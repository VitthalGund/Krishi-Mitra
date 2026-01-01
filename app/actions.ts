"use server";

import dbConnect from "@/lib/db";
import LoanApplication from "@/models/LoanApplication";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Validation Schemas ---

// Flexible "details" schema that permits specific known fields but allows others (Mixed)
// This matches the "Strict Base, Flexible Details" philosophy.
const DetailsSchema = z
  .object({
    surveyNo: z.string().optional(),
    crop: z.string().optional(),
    acreage: z.string().optional(),
    equipment: z.string().optional(),
    dealer: z.string().optional(),
    price: z.string().optional(),
    animalCount: z.string().optional(),
    animalType: z.string().optional(),
    village: z.string().optional(),
    cropSeason: z.string().optional(),
    // Allow other fields for future extensibility without code changes
  })
  .passthrough();

const LoanApplicationSchema = z.object({
  loanType: z.enum(["KCC", "Mechanization", "Dairy"]),
  // In a real app, userId would come from session, but we accept it or default it here.
  userId: z.string().optional().default("653a1234567890abcdef1234"),
  details: DetailsSchema,
});

export async function submitLoanApplication(data: any) {
  await dbConnect();

  try {
    // 1. Validate Input
    const validated = LoanApplicationSchema.parse({
      loanType: data.loanType,
      details: data, // Pass all other data as details
    });

    // 2. Create Document
    const newLoan = await LoanApplication.create({
      userId: validated.userId,
      type: validated.loanType,
      status: "Submitted",
      details: validated.details,
      documents: [], // Will be updated by separate upload action if needed
      aiAnalysis: "Pending AI Review",
    });

    console.log("Loan Application Created:", newLoan._id);

    revalidatePath("/dashboard");
    return { success: true, id: newLoan._id.toString() };
  } catch (error: any) {
    console.error("Submission Error:", error);
    // Return friendly error for Zod issues
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation Failed: " + error.errors[0]?.message,
      };
    }
    return { success: false, error: error.message || "Database Error" };
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
