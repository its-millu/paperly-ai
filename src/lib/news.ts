import Parser from "rss-parser";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "PaperlyAI/1.0 RSS Reader",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
  // Preserve common publisher image metadata instead of dropping it.
  customFields: {
    item: ["media:content", "media:thumbnail", "image"],
  },
});

const FEEDS = [
  {
    name: "BBC News",
    category: "World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
  },
  {
    name: "BBC Technology",
    category: "Technology",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
  },
  {
    name: "BBC Science",
    category: "Science",
    url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  },
  {
    name: "BBC Business",
    category: "Business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
  },
] as const;

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string | null;
  imageUrl?: string | null;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }

  return null;
}

function normalizeText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSafeArticleUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeImageUrl(value: unknown, baseUrl: string): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const resolved = new URL(value.trim(), baseUrl);

    if (resolved.protocol !== "https:" && resolved.protocol !== "http:") {
      return null;
    }

    return resolved.toString();
  } catch {
    return null;
  }
}

function imageFromHtml(value: unknown, baseUrl: string): string | null {
  if (typeof value !== "string" || !value) return null;

  // RSS content often contains an img tag. Check src, data-src and srcset.
  const patterns = [
    /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/i,
    /<img\b[^>]*?\bdata-src\s*=\s*["']([^"']+)["']/i,
    /<img\b[^>]*?\bsrcset\s*=\s*["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match?.[1]) continue;

    // For srcset, use the first candidate's URL.
    const candidate = match[1].split(",")[0].trim().split(/\s+/)[0];
    const safeUrl = normalizeImageUrl(candidate, baseUrl);
    if (safeUrl) return safeUrl;
  }

  return null;
}

function imageFromMetadata(value: unknown, baseUrl: string): string | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = imageFromMetadata(entry, baseUrl);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "string") {
    return normalizeImageUrl(value, baseUrl);
  }

  const record = asRecord(value);
  if (!record) return null;

  // rss-parser represents media:content, media:thumbnail and enclosure
  // attributes differently depending on the feed's XML structure.
  const attributes = asRecord(record.$);
  const candidates = [
    record.url,
    record.href,
    record.src,
    attributes?.url,
    attributes?.href,
    record["@_url"],
  ];

  for (const candidate of candidates) {
    const safeUrl = normalizeImageUrl(candidate, baseUrl);
    if (safeUrl) return safeUrl;
  }

  return null;
}

function extractImageUrl(
  item: UnknownRecord,
  baseUrl: string,
): string | null {
  const enclosure = asRecord(item.enclosure);
  const mediaContent = item["media:content"] ?? item.mediaContent;
  const mediaThumbnail = item["media:thumbnail"] ?? item.mediaThumbnail;
  const imageField = item.image;

  // Prefer explicit image metadata first.
  const candidates: unknown[] = [
    enclosure?.type && typeof enclosure.type === "string" &&
    !enclosure.type.startsWith("image/")
      ? null
      : enclosure?.url,
    imageFromMetadata(mediaThumbnail, baseUrl),
    imageFromMetadata(mediaContent, baseUrl),
    imageFromMetadata(imageField, baseUrl),
    item["itunes:image"],
    item.itunesImage,
  ];

  for (const candidate of candidates) {
    const safeUrl = normalizeImageUrl(candidate, baseUrl);
    if (safeUrl) return safeUrl;
  }

  // Then inspect RSS HTML fields, which may contain an image tag.
  const htmlFields = [
    item["content:encoded"],
    item.content,
    item.summary,
    item.description,
  ];

  for (const field of htmlFields) {
    const found = imageFromHtml(field, baseUrl);
    if (found) return found;
  }

  return null;
}

export async function fetchNews(): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const response = await fetch(feed.url, {
        headers: {
          "User-Agent": "PaperlyAI/1.0 RSS Reader",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${feed.name} returned HTTP ${response.status}`);
      }

      const xml = await response.text();
      const parsed = await parser.parseString(xml);

      return parsed.items
        .filter((item) => isSafeArticleUrl(item.link))
        .map((item): NewsArticle => {
          const rawItem = item as unknown as UnknownRecord;
          const title = normalizeText(item.title || "Untitled story");
          const url = item.link!;
          const summary = normalizeText(
            item.contentSnippet || item.content || item.summary || "",
          );

          const parsedDate = item.isoDate || item.pubDate;
          const timestamp = parsedDate ? Date.parse(parsedDate) : NaN;
          const imageUrl = extractImageUrl(rawItem, url);

          return {
            id: url,
            title,
            summary: summary.slice(0, 1200),
            url,
            source: feed.name,
            category: feed.category,
            publishedAt: Number.isFinite(timestamp)
              ? new Date(timestamp).toISOString()
              : null,
            imageUrl,
          };
        });
    }),
  );

  const articles: NewsArticle[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      console.error("RSS feed failed:", result.reason);
    }
  }

  const seen = new Set<string>();

  return articles
    .filter((article) => {
      const key = article.url.toLowerCase();

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const dateA = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const dateB = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return dateB - dateA;
    });
}

const INTEREST_KEYWORDS: Record<string, string[]> = {
  Technology: ["technology", "tech", "digital", "software", "computer", "cyber"],
  "Artificial Intelligence": [
    "artificial intelligence",
    " ai ",
    "machine learning",
    "chatgpt",
    "robotics",
    "generative ai",
  ],
  Science: ["science", "research", "space", "discovery", "scientist", "study"],
  Business: ["business", "economy", "market", "company", "trade", "finance"],
  World: ["world", "global", "international", "country", "government"],
  Politics: ["politics", "election", "president", "parliament", "minister"],
  Health: ["health", "medical", "hospital", "disease", "medicine", "wellbeing"],
  Climate: ["climate", "environment", "emissions", "renewable", "weather"],
  Startups: ["startup", "start-up", "founder", "venture capital", "funding"],
  Sports: ["sports", "football", "cricket", "tennis", "championship", "athlete"],
  Culture: ["culture", "film", "music", "art", "book", "entertainment"],
  Education: ["education", "university", "school", "student", "learning"],
};

export function personalizeNews(
  articles: NewsArticle[],
  interests: string[],
  paperSize: "compact" | "standard" | "extended",
): NewsArticle[] {
  const ranked = articles.map((article) => {
    const text = ` ${article.title} ${article.summary} ${article.category} `.toLowerCase();

    const score = interests.reduce((total, interest) => {
      const keywords = INTEREST_KEYWORDS[interest] ?? [interest.toLowerCase()];

      const matched = keywords.some((keyword) =>
        text.includes(keyword.toLowerCase()),
      );

      return total + (matched ? 1 : 0);
    }, 0);

    return { article, score };
  });

  const matching = ranked
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article);

  const fallback = ranked
    .filter(({ score }) => score === 0)
    .map(({ article }) => article);

  const limit =
    paperSize === "compact" ? 8 : paperSize === "extended" ? 30 : 18;

  return [...matching, ...fallback].slice(0, limit);
}
