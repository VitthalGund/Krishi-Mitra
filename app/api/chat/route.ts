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

const SYSTEM_PROMPT = `You are Krishi-Sahayak. Help the farmer fill the loan form.
1. If they mention a crop or land area, call 'update_form'.
2. If they upload an image (7/12 extract), analyze it and extract the Name and Survey Number.
3. Keep answers short and simple (Hinglish allowed).`;

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
            "Updates the loan application form fields based on user input.",
          parameters: z.object({
            surveyNo: z.string().optional(),
            crop: z.string().optional(),
            acreage: z.string().optional(),
            equipment: z.string().optional(),
            dealer: z.string().optional(),
            price: z.string().optional(),
            animalCount: z.string().optional(),
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
