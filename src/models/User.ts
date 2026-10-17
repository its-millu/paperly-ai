
import mongoose, { Schema, type Model } from "mongoose";

export interface IUserPreferences {
  interests: string[];
  readingDepth: "brief" | "balanced" | "detailed";
  paperSize: "compact" | "standard" | "extended";
  onboardingCompleted: boolean;
}

export type SubscriptionPlan = "free" | "plus" | "pro";

export type SubscriptionStatus =
  | "inactive"
  | "active"
  | "past_due"
  | "canceled";

export interface IUser {
  firstName: string;
  lastName?: string;
  email: string;
  passwordHash: string;
  preferences?: IUserPreferences;

  // Subscription and AI summary quota
  plan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionExpiresAt?: Date | null;

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

    // All new users start on the Free plan.
    plan: {
      type: String,
      enum: ["free", "plus", "pro"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "past_due", "canceled"],
      default: "inactive",
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
