
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import SavedArticle from "@/models/SavedArticle";

const articleSchema = z.object({
  id: z.string().trim().min(1).max(500),
  title: z.string().trim().min(1).max(500),
  summary: z.string().max(10000).default(""),
  url: z.string().url().max(2048),
  source: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  publishedAt: z.string().nullable().optional(),
});

const deleteSchema = z.object({
  url: z.string().url().max(2048),
});

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function getUserId() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  return user?.id || null;
}

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to view saved articles." },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const articles = await SavedArticle.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      articles: articles.map((article) => ({
        id: article.articleId,
        title: article.title,
        summary: article.summary,
        url: article.url,
        source: article.source,
        category: article.category,
        publishedAt: article.publishedAt?.toISOString() ?? null,
        savedAt: article.createdAt.toISOString(),
      })),
      count: articles.length,
    });
  } catch (error) {
    console.error("GET /api/saved-articles:", error);

    return NextResponse.json(
      { error: "Unable to load saved articles." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to save articles." },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    const parsed = articleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid article data." },
        { status: 400 },
      );
    }

    const article = parsed.data;

    if (!isSafeHttpUrl(article.url)) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS article links are allowed." },
        { status: 400 },
      );
    }

    let publishedAt: Date | null = null;

    if (article.publishedAt) {
      publishedAt = new Date(article.publishedAt);

      if (Number.isNaN(publishedAt.getTime())) {
        return NextResponse.json(
          { error: "Invalid publication date." },
          { status: 400 },
        );
      }
    }

    await connectToDatabase();

    const saved = await SavedArticle.findOneAndUpdate(
      { userId, url: article.url },
      {
        $setOnInsert: {
          userId,
          articleId: article.id,
          title: article.title,
          summary: article.summary,
          url: article.url,
          source: article.source,
          category: article.category,
          publishedAt,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json(
      {
        message: "Article saved.",
        article: {
          id: saved.articleId,
          url: saved.url,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/saved-articles:", error);

    return NextResponse.json(
      { error: "Unable to save this article." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to manage saved articles." },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success || !isSafeHttpUrl(parsed.data.url)) {
      return NextResponse.json(
        { error: "A valid HTTP or HTTPS article URL is required." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    await SavedArticle.deleteOne({
      userId,
      url: parsed.data.url,
    });

    return NextResponse.json({ message: "Article removed from saved items." });
  } catch (error) {
    console.error("DELETE /api/saved-articles:", error);

    return NextResponse.json(
      { error: "Unable to remove this article." },
      { status: 500 },
    );
  }
}
