import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoanApplication extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  type: "KCC" | "Mechanization" | "Dairy";
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  details: Record<string, any>; // Mixed: { surveyNo... } or { equipment... }
  documents: string[]; // URLs
  aiAnalysis?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema: Schema<ILoanApplication> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["KCC", "Mechanization", "Dairy"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Rejected"],
      default: "Draft",
    },
    // Critical: Mixed type for unstructured data like { surveyNo, crop } OR { animalType, count }
    details: { type: Schema.Types.Mixed, default: {} },
    documents: [{ type: String }],
    aiAnalysis: { type: String },
  },
  {
    timestamps: true,
  }
);

const LoanApplication: Model<ILoanApplication> =
  mongoose.models.LoanApplication ||
  mongoose.model<ILoanApplication>("LoanApplication", LoanApplicationSchema);

export default LoanApplication;
