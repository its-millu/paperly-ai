
import mongoose, { Schema, type Model } from "mongoose";

export interface ISummaryUsage {
  userId: string;
  usageDate: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const SummaryUsageSchema = new Schema<ISummaryUsage>(
  {
    userId: { type: String, required: true },
    usageDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    count: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

SummaryUsageSchema.index(
  { userId: 1, usageDate: 1 },
  { unique: true },
);

const SummaryUsage: Model<ISummaryUsage> =
  (mongoose.models.SummaryUsage as Model<ISummaryUsage>) ||
  mongoose.model<ISummaryUsage>("SummaryUsage", SummaryUsageSchema);

export default SummaryUsage;
