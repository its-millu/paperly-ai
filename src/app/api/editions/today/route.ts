import { NextResponse, connection } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { fetchNews, personalizeNews } from "@/lib/news";
import { generateAIBriefing } from "@/lib/ai-briefing";
import User from "@/models/User";
import DailyEdition from "@/models/DailyEdition";

function isDuplicateKey(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

async function attachBriefing(
  edition: {
    _id: mongoose.Types.ObjectId;
    articles: Array<{
      id: string;
      title: string;
      summary: string;
      url: string;
      source: string;
      category: string;
      publishedAt: string | null;
      imageUrl?: string | null;
    }>;
    interests: string[];
  },
) {
  const existing = await DailyEdition.findById(edition._id).lean();

  if (existing?.briefing) return existing;

  try {
    const briefing = await generateAIBriefing(
      edition.articles,
      edition.interests,
    );

    // Only fill the briefing if another concurrent request hasn't already done it.
    await DailyEdition.updateOne(
      { _id: edition._id, briefing: { $exists: false } },
      { $set: { briefing } },
    );
  } catch (error) {
    // The newspaper must remain usable if the AI provider is unavailable.
    console.error("[Paperly AI] Could not generate edition briefing:", error);
  }

  return DailyEdition.findById(edition._id).lean();
}

export async function GET() {
  try {
    await connection();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to access your daily paper." },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        { error: "Invalid user session." },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const editionDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    let edition = await DailyEdition.findOne({
      userId,
      editionDate,
    });

    let isNew = false;

    if (!edition) {
      const user = await User.findById(userId)
        .select("preferences")
        .lean();

      if (!user) {
        return NextResponse.json(
          { error: "User not found." },
          { status: 404 },
        );
      }

      const preferences = user.preferences;

      if (!preferences?.onboardingCompleted) {
        return NextResponse.json(
          {
            error: "Please complete onboarding first.",
            redirect: "/onboarding",
          },
          { status: 409 },
        );
      }

      const allArticles = await fetchNews();

      const articles = personalizeNews(
        allArticles,
        preferences.interests,
        preferences.paperSize,
      );

      if (articles.length === 0) {
        return NextResponse.json(
          {
            error:
              "No news articles could be retrieved. Please try again later.",
          },
          { status: 503 },
        );
      }

      try {
        edition = await DailyEdition.create({
          userId,
          editionDate,
          title: "Your Daily Paper",
          interests: preferences.interests,
          articles,
          generatedAt: new Date(),
        });

        isNew = true;
      } catch (error) {
        if (!isDuplicateKey(error)) throw error;

        // Another request may have created today's edition concurrently.
        edition = await DailyEdition.findOne({ userId, editionDate });

        if (!edition) throw error;
      }
    }

    // Preserve stored articles; only enrich missing images when a matching
    // fresh RSS article is available.
    const articles = edition.articles ?? [];

    if (articles.some((article) => !article.imageUrl)) {
      try {
        const freshArticles = await fetchNews();
        const freshByUrl = new Map(
          freshArticles.map((article) => [article.url, article]),
        );

        const enriched = articles.map((article) => {
          if (article.imageUrl) return article;

          const fresh = freshByUrl.get(article.url);
          return fresh?.imageUrl
            ? { ...article.toObject(), imageUrl: fresh.imageUrl }
            : article;
        });

        if (
          enriched.some(
            (article, index) =>
              !articles[index].imageUrl && Boolean(article.imageUrl),
          )
        ) {
          edition.articles = enriched as typeof edition.articles;
          await edition.save();
        }
      } catch (error) {
        console.error("[Paperly AI] Image enrichment failed:", error);
      }
    }

    const savedEdition = await attachBriefing({
      _id: edition._id,
      articles: edition.articles.map((article) => {
        const item = article.toObject();
        return {
          ...item,
          publishedAt: item.publishedAt ?? null,
          imageUrl: item.imageUrl ?? null,
        };
      }),
      interests: edition.interests ?? [],
    });

    if (!savedEdition) {
      return NextResponse.json(
        { error: "Unable to load your saved edition." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { edition: savedEdition, isNew },
      { status: isNew ? 201 : 200 },
    );
  } catch (error) {
    console.error("GET /api/editions/today failed:", error);

    return NextResponse.json(
      { error: "Unable to generate your daily paper right now." },
      { status: 500 },
    );
  }
}