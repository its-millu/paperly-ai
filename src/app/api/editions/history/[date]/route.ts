
import { NextResponse, connection } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import DailyEdition from "@/models/DailyEdition";

type RouteContext = {
  params: Promise<{ date: string }>;
};

function getPakistanDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    await connection();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to open this edition." },
        { status: 401 },
      );
    }

    const { date } = await params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid edition date." },
        { status: 400 },
      );
    }

    // Only previous editions are available in this archive.
    if (date >= getPakistanDate()) {
      return NextResponse.json(
        {
          error:
            "Only previous editions are available in this archive.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const edition = await DailyEdition.findOne({
      userId: session.user.id,
      editionDate: date,
    }).lean();

    if (!edition) {
      return NextResponse.json(
        { error: "No saved edition was found for this date." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      edition: {
        _id: String(edition._id),
        editionDate: edition.editionDate,
        title: edition.title,
        interests: edition.interests ?? [],
        articles: edition.articles ?? [],
        generatedAt: edition.generatedAt,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/editions/history/[date] failed:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to load this edition right now." },
      { status: 500 },
    );
  }
}
