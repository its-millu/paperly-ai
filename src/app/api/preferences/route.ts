
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

const allowedInterests = [
  "Technology",
  "Artificial Intelligence",
  "Science",
  "Business",
  "World",
  "Politics",
  "Health",
  "Climate",
  "Startups",
  "Sports",
  "Culture",
  "Education",
] as const;

const PreferencesSchema = z.object({
  interests: z
    .array(z.enum(allowedInterests))
    .min(1, "Choose at least one interest.")
    .max(4, "Choose no more than four interests.")
    .refine((items) => new Set(items).size === items.length, {
      message: "Duplicate interests are not allowed.",
    }),
  readingDepth: z.enum(["brief", "balanced", "detailed"]),
  paperSize: z.enum(["compact", "standard", "extended"]),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to access your preferences." },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).select("preferences");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      preferences: user.preferences ?? {
        interests: [],
        readingDepth: "balanced",
        paperSize: "standard",
        onboardingCompleted: false,
      },
    });
  } catch (error) {
    console.error("GET /api/preferences failed:", error);

    return NextResponse.json(
      { error: "Unable to load preferences. Please try again." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to save your preferences." },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    const parsed = PreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid preferences." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          preferences: {
            ...parsed.data,
            onboardingCompleted: true,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("preferences");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Preferences saved successfully.",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("PUT /api/preferences failed:", error);

    return NextResponse.json(
      { error: "Unable to save preferences. Please try again." },
      { status: 500 },
    );
  }
}
