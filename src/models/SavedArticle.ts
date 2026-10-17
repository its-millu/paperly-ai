
import mongoose, { Schema, type Model } from "mongoose";

export interface ISavedArticle {
  userId: string;
  articleId: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SavedArticleSchema = new Schema<ISavedArticle>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    articleId: {
      type: String,
      required: true,
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
  },
  { timestamps: true },
);

SavedArticleSchema.index(
  { userId: 1, url: 1 },
  { unique: true },
);

const SavedArticle: Model<ISavedArticle> =
  (mongoose.models.SavedArticle as Model<ISavedArticle>) ||
  mongoose.model<ISavedArticle>("SavedArticle", SavedArticleSchema);

export default SavedArticle;