"use server";

import dbConnect from "@/lib/db";
import LoanApplication from "@/models/LoanApplication";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  LoanFormData,
  KCCSchema,
  TractorSchema,
  DairySchema,
} from "@/lib/schemas";
import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/auth";

// Helper to get authenticated user (Mock/Token based)
async function getUserId() {
  // In a real app, verify token from headers/cookies here.
  // We'll rely on the cookie created by login.
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return null;

  try {
    const payload = await verifyRefreshToken(refreshToken);
    return payload.userId;
  } catch (e) {
    return null;
  }
}

// --- Action: Save as Draft ---
// Requirements: Upsert, "Draft" Status, NO Validation
export async function saveDraft(data: any) {
  try {
    await dbConnect();
    const userId = await getUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { loanType, ...details } = data;

    // We use a Flexible update. We don't validate 'details' against Zod here.
    // Just ensure mandatory fields for DB (like mobile/userId) are present if it's a new doc.
    const mobileNumber = details.mobile || details.mobileNumber;

    if (!mobileNumber) {
      return {
        success: false,
        error: "Mobile number is required to save a draft.",
      };
    }

    // Ensure mobile is in details for querying
    details.mobileNumber = mobileNumber;

    const application = await LoanApplication.findOneAndUpdate(
      { userId, type: loanType }, // Find strictly by OWNER + TYPE
      {
        $set: {
          userId,
          type: loanType,
          status: "Draft",
          details: details,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath("/dashboard");
    return { success: true, id: application._id.toString() };
  } catch (error: any) {
    console.error("Save Draft Error:", error);
    return { success: false, error: error.message };
  }
}

// --- Action: Submit Application ---
// Requirements: Full Zod Validation, "Submitted" Status
export async function submitApplication(data: any) {
  try {
    await dbConnect();
    const userId = await getUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Validate based on Loan Type
    const loanType = data.loanType;
    let schema;

    switch (loanType) {
      case "KCC":
        schema = KCCSchema;
        break;
      case "Mechanization":
        schema = TractorSchema;
        break;
      case "Dairy":
        schema = DairySchema;
        break;
      default:
        return { success: false, error: "Invalid Loan Type" };
    }

    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      const errorMessage =
        parsed.error.errors[0]?.message || "Validation Failed";
      return { success: false, error: errorMessage };
    }

    const validData = parsed.data;

    // Ensure mobile is in details
    const details = { ...validData } as any;
    // @ts-ignore
    const mobileNumber = validData.mobile;
    details.mobileNumber = mobileNumber;

    // 2. Persist to DB
    const application = await LoanApplication.findOneAndUpdate(
      { userId, type: loanType },
      {
        $set: {
          userId,
          type: loanType,
          status: "Submitted",
          details: details,
          aiAnalysis: {
            riskScore: 0, // Placeholder
            summary: "Submitted via Portal",
            recommendedAction: "Pending Review",
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath("/dashboard");
    return { success: true, id: application._id.toString() };
  } catch (error: any) {
    console.error("Submit Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getApplications() {
  await dbConnect();
  const userId = await getUserId();
  if (!userId) return [];

  // Convert _id to string to avoid serialization warnings
  const apps = await LoanApplication.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
  return apps.map((app: any) => ({
    ...app,
    _id: app._id.toString(),
  }));
}
