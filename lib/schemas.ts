import { z } from "zod";

// --- Common Fields ---
const MobileRegex = /^[6-9]\d{9}$/;

export const CommonSchema = z.object({
  farmerName: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(MobileRegex, "Invalid Indian mobile number"),
  village: z.string().min(2, "Village name is required"),
});

// --- Specific Loan Schemas ---

export const KCCSchema = CommonSchema.extend({
  loanType: z.literal("KCC"),
  surveyNo: z.string().min(1, "Survey Number is required"),
  crop: z.string().min(2, "Crop name is required"),
  acreage: z.coerce.number().positive("Acreage must be a positive number"),
  cropSeason: z.enum(["Kharif", "Rabi", "Zaid"]),
});

export const TractorSchema = CommonSchema.extend({
  loanType: z.literal("Mechanization"),
  equipment: z.string().min(2, "Equipment name is required"),
  dealer: z.string().min(2, "Dealer name is required"),
  price: z.coerce
    .number()
    .min(10000, "Quotation amount must be at least ₹10,000"),
});

export const DairySchema = CommonSchema.extend({
  loanType: z.literal("Dairy"),
  animalType: z.enum(["Cow", "Buffalo"]),
  animalCount: z.coerce.number().int().min(1, "Must have at least 1 animal"),
  shedArea: z.coerce.number().optional(), // Optional for now
  milkYield: z.coerce.number().optional(),
});

// Union Type for usage in generic contexts
export const LoanSchema = z.discriminatedUnion("loanType", [
  KCCSchema,
  TractorSchema,
  DairySchema,
]);

export type KCCFormData = z.infer<typeof KCCSchema>;
export type TractorFormData = z.infer<typeof TractorSchema>;
export type DairyFormData = z.infer<typeof DairySchema>;
export type LoanFormData = z.infer<typeof LoanSchema>;
