"use server";

import dbConnect from "@/lib/db";
import LoanApplication, { ILoanApplication } from "@/models/LoanApplication";

export async function getApplications() {
  await dbConnect();
  // Lean queries are faster; explicit casting needed because _id is standard Object ID
  const applications = await LoanApplication.find({})
    .sort({ createdAt: -1 })
    .lean();

  // Serialization for Client Components
  return applications.map((app) => ({
    ...app,
    _id: (app as any)._id.toString(),
    createdAt: (app as any).createdAt?.toISOString(),
    updatedAt: (app as any).updatedAt?.toISOString(),
  }));
}
