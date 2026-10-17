
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { fetchNews, personalizeNews } from "@/lib/news";
import User from "@/models/User";
import DailyEdition from "@/models/DailyEdition";

export async function GET() {
  try {
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

    // Use Pakistan's calendar date consistently for daily editions.
    const editionDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const existingEdition = await DailyEdition.findOne({
      userId,
      editionDate,
    }).lean();

    if (existingEdition) {
  const articles = existingEdition.articles ?? [];
  const needsImages = articles.some(
    (article) => !article.imageUrl,
  );

  if (needsImages) {
    try {
      const freshArticles = await fetchNews();

      const freshByUrl = new Map(
        freshArticles.map((article) => [
          article.url,
          article,
        ]),
      );

      const enrichedArticles = articles.map((article) => {
        if (article.imageUrl) return article;

        const freshArticle = freshByUrl.get(article.url);

        if (!freshArticle?.imageUrl) return article;

        return {
          ...article,
          imageUrl: freshArticle.imageUrl,
        };
      });

      const hasNewImages = enrichedArticles.some(
        (article, index) =>
          !articles[index].imageUrl && Boolean(article.imageUrl),
      );

      if (hasNewImages) {
        await DailyEdition.updateOne(
          { _id: existingEdition._id },
          { $set: { articles: enrichedArticles } },
        );

        return NextResponse.json({
          edition: {
            ...existingEdition,
            articles: enrichedArticles,
          },
          isNew: false,
        });
      }
    } catch (error) {
      console.error("Unable to enrich saved edition images:", error);
    }
  }

  return NextResponse.json({
    edition: existingEdition,
    isNew: false,
  });
}

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

    const generatedAt = new Date();

    try {
      const edition = await DailyEdition.create({
        userId,
        editionDate,
        title: "Your Daily Paper",
        interests: preferences.interests,
        articles,
        generatedAt,
      });

      return NextResponse.json(
        { edition, isNew: true },
        { status: 201 },
      );
    } catch (error) {
      // A parallel request may have created today's edition first.
      if (
        (error instanceof mongoose.Error &&
          error.name === "ValidationError") ||
        (typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === 11000)
      ) {
        const edition = await DailyEdition.findOne({
          userId,
          editionDate,
        }).lean();

        if (edition) {
          return NextResponse.json({
            edition,
            isNew: false,
          });
        }
      }

      throw error;
    }
  } catch (error) {
    console.error("GET /api/editions/today failed:", error);

    return NextResponse.json(
      { error: "Unable to generate your daily paper right now." },
      { status: 500 },
    );
  }
}
