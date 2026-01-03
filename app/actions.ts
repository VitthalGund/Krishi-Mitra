"use server";

import dbConnect from "@/lib/db";
import LoanApplication, { ILoanApplication } from "@/models/LoanApplication";
import { revalidatePath } from "next/cache";
import { LoanSchema, type LoanFormData } from "@/lib/schemas";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth"; // Ensure lib/auth has verifyToken exported
import User from "@/models/User";

/**
 * Helper to retrieve the authenticated user's ID from the session cookie.
 */
async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return null;

  try {
    // Correctly await the token verification
    const payload = await verifyToken(refreshToken);
    return payload.userId;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches the basic profile of the currently logged-in user.
 */
export async function getUserProfile(): Promise<{
  name: string;
  mobile: string;
} | null> {
  await dbConnect();
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;

  const user = await User.findById(userId).lean();
  if (!user) return null;

  return {
    name: user.name,
    mobile: user.mobileNumber,
  };
}

/**
 * Action: Save as Draft
 * Requirements: Upsert data without strict validation to allow incremental progress.
 */
export async function saveDraft(
  data: Partial<LoanFormData> & { loanType: string }
) {
  try {
    await dbConnect();
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { loanType, ...details } = data;

    // Composite key (userId + loanType + status) prevents duplicate drafts per category
    const application = await LoanApplication.findOneAndUpdate(
      { userId, type: loanType, status: "Draft" },
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
    return { success: true, id: (application._id as string).toString() };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save draft";
    console.error("Save Draft Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Action: Submit Application
 * Requirements: Full Zod validation before moving status to "Submitted".
 */
export async function submitApplication(data: unknown) {
  try {
    await dbConnect();
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Strict validation using the discriminated union schema
    const parsed = LoanSchema.safeParse(data);

    if (!parsed.success) {
      const errorMessage =
        parsed.error.errors[0]?.message || "Validation Failed";
      return { success: false, error: errorMessage };
    }

    const validData = parsed.data;

    const application = await LoanApplication.findOneAndUpdate(
      { userId, type: validData.loanType, status: "Draft" }, // Update the existing draft
      {
        $set: {
          userId,
          type: validData.loanType,
          status: "Submitted",
          details: validData,
          aiAnalysis: "Submitted via Krishi-Mitra AI Portal",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath("/dashboard");
    return { success: true, id: (application._id as string).toString() };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Submission failed";
    console.error("Submit Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Retrieves all loan applications associated with the current user.
 */
export async function getApplications(): Promise<ILoanApplication[]> {
  await dbConnect();
  const userId = await getAuthenticatedUserId();

  if (!userId) return [];

  const apps = await LoanApplication.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();

  return apps as unknown as ILoanApplication[];
}
