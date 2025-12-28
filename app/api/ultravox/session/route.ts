import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const ULTRAVOX_API_KEY = process.env.ULTRAVOX_API_KEY;

  if (!ULTRAVOX_API_KEY) {
    return NextResponse.json(
      { error: "ULTRAVOX_API_KEY is not defined" },
      { status: 500 }
    );
  }

  const systemPrompt = `You are Krishi-Mitra, a government agricultural loan assistant. Language Protocol: Listen carefully to the user's first language. If they speak Hindi, reply ONLY in Hindi. If Marathi, reply in Marathi. If Tamil, reply in Tamil. If English, reply in English. Do not ask them to switch languages. Goal: Collect Farmer Name, Crop Type, and Loan Amount. Personality: Warm, patient, and respectful. Use simple terms suitable for rural farmers.`;

  const payload = {
    systemPrompt: systemPrompt,
    model: "fixie-ai/ultravox",
    voice: "Mark", // Using a default voice, can be customized
    temperature: 0.3,
    selectedTools: [
      {
        definition: {
          name: "save_loan_application",
          description:
            "Saves the farmer's loan request to the central database.",
          parameters: {
            type: "object",
            properties: {
              farmerName: {
                type: "string",
                description: "The name of the farmer",
              },
              cropType: {
                type: "string",
                description: "The crop they are growing",
              },
              loanAmount: {
                type: "number",
                description: "Amount requested in Rupees",
              },
            },
            required: ["farmerName", "cropType", "loanAmount"],
          },
        },
      },
    ],
  };

  try {
    const response = await fetch("https://api.ultravox.ai/api/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ULTRAVOX_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ultravox API Error:", errorText);
      return NextResponse.json(
        {
          error: `Ultravox API error: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ joinUrl: data.joinUrl }, { status: 200 });
  } catch (error) {
    console.error("Error creating Ultravox session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
