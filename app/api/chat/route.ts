import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToCoreMessages, tool } from "ai";
import { z } from "zod";

export const runtime = "edge";

// --- Dual Engine Configuration ---
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: "ollama",
});

const SYSTEM_PROMPT = `You are Krishi-Sahayak, an expert agri-loan assistant.
1. Your goal is to help the farmer fill the loan application form.
2. If the user provides information (e.g., "I have 2 cows" or "My survey number is 105"), call the 'update_form' tool immediately.
3. You can infer details: "2 cows" -> animalCount: 2, animalType: Cow. "Sugarcane crop" -> crop: Sugarcane.
4. If data is missing for the selected loan type, ask the user for it.
5. Keep responses short, encouraging, and in Hinglish if appropriate.
6. Analyzed images/documents will be provided as context; use them to fill fields like Survey Number or Name.`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const provider = process.env.LLM_PROVIDER || "ollama"; // Default to Ollama

  // Select Model Engine
  let model;
  if (provider === "ollama") {
    model = ollama(process.env.OLLAMA_MODEL || "llama3");
  } else {
    model = google("gemini-1.5-flash");
  }

  try {
    const result = await streamText({
      model,
      messages: convertToCoreMessages(messages),
      system: SYSTEM_PROMPT,
      tools: {
        update_form: tool({
          description:
            "Updates the loan application form fields with extracted data.",
          parameters: z.object({
            // Common
            farmerName: z.string().optional(),
            mobile: z.string().optional(),
            village: z.string().optional(),
            loanType: z.enum(["KCC", "Mechanization", "Dairy"]).optional(),

            // KCC
            surveyNo: z.string().optional(),
            crop: z.string().optional(),
            acreage: z.string().optional(),
            cropSeason: z.string().optional(),

            // Tractor
            equipment: z.string().optional(),
            dealer: z.string().optional(),
            price: z.string().optional(),

            // Dairy
            animalType: z.string().optional(),
            animalCount: z.string().optional(),
            shedArea: z.string().optional(),
            milkYield: z.string().optional(),
          }),
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
