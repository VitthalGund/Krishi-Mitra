import { google } from "@ai-sdk/google";
import { createOllama } from "ollama-ai-provider";
import { streamText, tool } from "ai";
import { z } from "zod";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are an expert Indian Agri-Loan Officer.
1. Co-pilot: If the user says 'I want a tractor loan', guide them to select 'Tractor' and ask for the Dealer Name.
2. Form Filling: If the user provides details (e.g., 'My land is 2 acres'), call the 'fill_form' tool immediately with the fields you extracted.
3. Tech Support: If they ask 'What is 7/12?', explain it is a land ownership document.
4. Language: Always answer in the language the user is speaking, or English if unsure.
`;

const tools = {
  fill_form: tool({
    description: "Autofill the loan application form with extracted details",
    parameters: z.object({
      loanType: z.enum(["KCC", "Tractor", "Dairy"]).optional(),
      surveyNumber: z.string().optional(),
      landArea: z.string().optional(),
      cropName: z.string().optional(),
      dealerName: z.string().optional(),
      quotationAmount: z.string().optional(),
      animalType: z.string().optional(),
      animalCount: z.string().optional(),
    }),
  }),
};

export async function POST(req: Request) {
  const { messages } = await req.json();
  const provider = process.env.LLM_PROVIDER || "gemini";

  let model;

  if (provider === "ollama") {
    const ollama = createOllama({
      baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });
    model = ollama(process.env.OLLAMA_MODEL || "llama3");
  } else {
    model = google("gemini-1.5-flash");
  }

  try {
    const result = streamText({
      model,
      messages,
      system: SYSTEM_PROMPT,
      tools,
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
