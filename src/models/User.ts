
import mongoose, { Schema, type Model } from "mongoose";

export interface IUserPreferences {
  interests: string[];
  readingDepth: "brief" | "balanced" | "detailed";
  paperSize: "compact" | "standard" | "extended";
  onboardingCompleted: boolean;
}

export interface IUser {
  firstName: string;
  lastName?: string;
  email: string;
  passwordHash: string;
  preferences?: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    interests: {
      type: [String],
      default: [],
    },
    readingDepth: {
      type: String,
      enum: ["brief", "balanced", "detailed"],
      default: "balanced",
    },
    paperSize: {
      type: String,
      enum: ["compact", "standard", "extended"],
      default: "standard",
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
