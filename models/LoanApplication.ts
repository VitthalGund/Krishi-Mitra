import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoanApplication extends Document {
  farmerName?: string;
  mobileNumber: string;
  cropType?: string;
  loanAmount?: number;
  status: "Pending" | "Verified" | "Approved" | "Rejected";
  riskScore: number;
  voiceCallId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema: Schema<ILoanApplication> = new Schema(
  {
    farmerName: { type: String },
    mobileNumber: { type: String, required: true },
    cropType: { type: String },
    loanAmount: { type: Number },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Approved", "Rejected"],
      default: "Pending",
    },
    riskScore: { type: Number, default: 0 },
    voiceCallId: { type: String },
  },
  {
    timestamps: true,
  }
);

const LoanApplication: Model<ILoanApplication> =
  mongoose.models.LoanApplication ||
  mongoose.model<ILoanApplication>("LoanApplication", LoanApplicationSchema);

export default LoanApplication;
