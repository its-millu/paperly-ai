
import { NextResponse, connection } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { fetchNews, personalizeNews } from "@/lib/news";


export async function GET() {
  try {
    await connection();

    const session = await getServerSession(authOptions);

    // Keep the rest of your existing handler unchanged.

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to view your personal paper." },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).select("preferences");

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

    return NextResponse.json({
      articles,
      count: articles.length,
      generatedAt: new Date().toISOString(),
      interests: preferences.interests,
      sources: [...new Set(articles.map((article) => article.source))],
    });
  } catch (error) {
    console.error("GET /api/news failed:", error);

    return NextResponse.json(
      { error: "Unable to fetch news right now. Please try again." },
      { status: 500 },
    );
  }
}