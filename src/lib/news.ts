
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "PaperlyAI/1.0 RSS Reader",
    Accept: "application/rss+xml, application/xml, text/xml",
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
};

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
          const title = normalizeText(item.title || "Untitled story");
          const url = item.link!;
          const summary = normalizeText(
            item.contentSnippet || item.content || item.summary || "",
          );

          const parsedDate = item.isoDate || item.pubDate;
          const timestamp = parsedDate ? Date.parse(parsedDate) : NaN;

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
