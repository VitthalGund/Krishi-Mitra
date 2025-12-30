"use server";

import dbConnect from "@/lib/db";
import LoanApplication, { ILoanApplication } from "@/models/LoanApplication";
import { revalidatePath } from "next/cache";

export async function submitLoanApplication(data: any) {
  await dbConnect();

  try {
    const MOCK_USER_ID = "653a1234567890abcdef1234";

    const newLoan = await LoanApplication.create({
      userId: MOCK_USER_ID,
      type: data.loanType || "KCC", // map from form data
      status: "Submitted",
      details: {
        ...data,
        // clean up flattened fields into specific structure if needed,
        // but schema allows Mixed so strict structure isn't forced yet.
      },
      documents: [],
      aiAnalysis: "Pending AI Review",
    });

    revalidatePath("/dashboard");
    return { success: true, id: newLoan._id.toString() };
  } catch (error: any) {
    console.error("Submission Error:", error);
    return { success: false, error: error.message };
  }
}

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
