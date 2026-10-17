
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

const PreferencesSchema = z.object({
  interests: z
    .array(z.string())
    .min(1, "Choose at least one interest.")
    .max(4)
    .refine(
      (items) => new Set(items).size === items.length,
      "Duplicate interests are not allowed.",
    ),
  readingDepth: z.enum(["brief", "balanced", "detailed"]),
  paperSize: z.enum(["compact", "standard", "extended"]),
});

const allowedInterests = new Set([
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
]);

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
    console.error("Load preferences error:", error);
    return NextResponse.json(
      { error: "Unable to load your preferences right now." },
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
        { error: "Please check your onboarding selections." },
        { status: 400 },
      );
    }

    if (
      parsed.data.interests.some(
        (interest) => !allowedInterests.has(interest),
      )
    ) {
      return NextResponse.json(
        { error: "One or more selected interests are invalid." },
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
      { new: true, runValidators: true },
    ).select("preferences");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Your personal paper preferences have been saved.",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Save preferences error:", error);
    return NextResponse.json(
      { error: "Unable to save your preferences right now." },
      { status: 500 },
    );
  }
}
