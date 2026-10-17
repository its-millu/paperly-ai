
import { NextResponse, connection } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import ReadingHistory from "@/models/ReadingHistory";

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

async function authenticatedUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET() {
  try {
    await connection();

    const userId = await authenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to view your reading history." },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const records = await ReadingHistory.find({ userId })
      .sort({ lastReadAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      articles: records.map((article) => ({
        id: article.articleId,
        title: article.title,
        summary: article.summary,
        url: article.url,
        source: article.source,
        category: article.category,
        publishedAt: article.publishedAt?.toISOString() ?? null,
        firstReadAt: article.firstReadAt.toISOString(),
        lastReadAt: article.lastReadAt.toISOString(),
        readCount: article.readCount,
      })),
      count: records.length,
    });
  } catch (error) {
    console.error("GET /api/reading-history:", error);

    return NextResponse.json(
      { error: "Unable to load reading history." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connection();

    const userId = await authenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to record reading history." },
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

    const now = new Date();

    const record = await ReadingHistory.findOneAndUpdate(
      { userId, url: article.url },
      {
        $set: {
          articleId: article.id,
          title: article.title,
          summary: article.summary,
          source: article.source,
          category: article.category,
          publishedAt,
          lastReadAt: now,
        },
        $setOnInsert: {
          userId,
          url: article.url,
          firstReadAt: now,
        },
        $inc: { readCount: 1 },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({
      message: "Reading history updated.",
      article: {
        id: record.articleId,
        url: record.url,
        lastReadAt: record.lastReadAt.toISOString(),
        readCount: record.readCount,
      },
    });
  } catch (error) {
    console.error("POST /api/reading-history:", error);

    return NextResponse.json(
      { error: "Unable to record this article." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connection();

    const userId = await authenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to manage your reading history." },
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

    await ReadingHistory.deleteOne({
      userId,
      url: parsed.data.url,
    });

    return NextResponse.json({
      message: "Article removed from reading history.",
    });
  } catch (error) {
    console.error("DELETE /api/reading-history:", error);

    return NextResponse.json(
      { error: "Unable to remove this history item." },
      { status: 500 },
    );
  }
}
