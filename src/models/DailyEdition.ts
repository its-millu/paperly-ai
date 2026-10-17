import mongoose, { Schema, type Model } from "mongoose";
import type { NewsArticle } from "@/lib/news";
import type { AIBriefing } from "@/lib/ai-briefing";

export interface IDailyEdition {
  userId: string;
  editionDate: string;
  title: string;
  interests: string[];
  articles: NewsArticle[];
  briefing?: AIBriefing;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<NewsArticle>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, maxlength: 500 },
    summary: { type: String, default: "", maxlength: 1200 },
    url: { type: String, required: true, maxlength: 2048 },
    source: { type: String, required: true, maxlength: 200 },
    category: { type: String, required: true, maxlength: 100 },
    publishedAt: { type: String, default: null },
    imageUrl: { type: String, default: null, maxlength: 2048 },
  },
  { _id: false },
);

const BriefingSchema = new Schema<AIBriefing>(
  {
    headline: { type: String, required: true, maxlength: 180 },
    introduction: { type: String, required: true, maxlength: 1800 },
    keyThemes: { type: [String], default: [] },
    summaries: {
      type: [
        new Schema(
          {
            title: { type: String, required: true, maxlength: 500 },
            summary: { type: String, default: "", maxlength: 1000 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    provider: { type: String, default: "Groq" },
    model: { type: String, default: "" },
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const DailyEditionSchema = new Schema<IDailyEdition>(
  {
    userId: { type: String, required: true, index: true },
    editionDate: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    interests: { type: [String], default: [] },
    articles: { type: [ArticleSchema], default: [] },
    briefing: { type: BriefingSchema, default: undefined },
    generatedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

DailyEditionSchema.index(
  { userId: 1, editionDate: 1 },
  { unique: true },
);

const DailyEdition: Model<IDailyEdition> =
  (mongoose.models.DailyEdition as Model<IDailyEdition>) ||
  mongoose.model<IDailyEdition>("DailyEdition", DailyEditionSchema);

export default DailyEdition;