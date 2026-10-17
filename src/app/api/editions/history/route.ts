
import { NextResponse, connection } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import DailyEdition from "@/models/DailyEdition";

function getPakistanDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET() {
  try {
    await connection();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to view previous editions." },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const today = getPakistanDate();

    const editions = await DailyEdition.find({
      userId: session.user.id,
      editionDate: { $lt: today },
    })
      .select("_id editionDate title interests articles generatedAt")
      .sort({ editionDate: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      editions: editions.map((edition) => ({
        _id: String(edition._id),
        editionDate: edition.editionDate,
        title: edition.title,
        interests: edition.interests ?? [],
        articleCount: edition.articles?.length ?? 0,
        generatedAt: edition.generatedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/editions/history failed:", error);

    return NextResponse.json(
      { error: "Unable to load previous editions right now." },
      { status: 500 },
    );
  }
}
