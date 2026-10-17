
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

 

const SignupSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional().default(""),
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[a-z]/, "Password needs a lowercase letter")
    .regex(/[A-Z]/, "Password needs an uppercase letter")
    .regex(/\d/, "Password needs a number"),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your details and password requirements." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const email = data.email.toLowerCase();

    await connectToDatabase();

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return NextResponse.json(
        { error: "Unable to create an account with those details." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      passwordHash,
    });

    return NextResponse.json(
      { message: "Account created successfully. You can now sign in." },
      { status: 201 },
    );
  } catch (error: unknown) {
    // Handle concurrent signup requests that hit the unique email index.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: "Unable to create an account with those details." },
        { status: 409 },
      );
    }

    console.error("Signup API error:", error);

    return NextResponse.json(
      { error: "Unable to create your account right now." },
      { status: 500 },
    );
  }
}
