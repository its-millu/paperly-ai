
import mongoose, { Schema, type Model } from "mongoose";

export interface IReadingHistory {
  userId: string;
  articleId: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: Date | null;
  firstReadAt: Date;
  lastReadAt: Date;
  readCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingHistorySchema = new Schema<IReadingHistory>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    articleId: {
      type: String,
      required: true,
      maxlength: 500,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    summary: {
      type: String,
      default: "",
      maxlength: 10000,
    },
    url: {
      type: String,
      required: true,
      maxlength: 2048,
    },
    source: {
      type: String,
      required: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      maxlength: 100,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    firstReadAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastReadAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    readCount: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true },
);

ReadingHistorySchema.index(
  { userId: 1, url: 1 },
  { unique: true },
);

ReadingHistorySchema.index({ userId: 1, lastReadAt: -1 });

const ReadingHistory: Model<IReadingHistory> =
  (mongoose.models.ReadingHistory as Model<IReadingHistory>) ||
  mongoose.model<IReadingHistory>("ReadingHistory", ReadingHistorySchema);

export default ReadingHistory;
