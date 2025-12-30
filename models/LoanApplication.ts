import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoanApplication extends Document {
  farmerId: string;
  loanType: "KCC" | "Tractor" | "Dairy";
  status: "Pending" | "Verified" | "Approved" | "Rejected";
  details: Record<string, any>;
  aiSummary?: string;
  documents?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema: Schema<ILoanApplication> = new Schema(
  {
    farmerId: { type: String, required: true },
    loanType: {
      type: String,
      enum: ["KCC", "Tractor", "Dairy"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Approved", "Rejected"],
      default: "Pending",
    },
    details: { type: Schema.Types.Mixed, default: {} },
    aiSummary: { type: String },
    documents: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const LoanApplication: Model<ILoanApplication> =
  mongoose.models.LoanApplication ||
  mongoose.model<ILoanApplication>("LoanApplication", LoanApplicationSchema);

export default LoanApplication;
