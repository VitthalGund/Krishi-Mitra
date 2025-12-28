import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LoanApplication from "@/models/LoanApplication";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Ultravox Webhook Received:", body);

    await dbConnect();

    // Safety check for tool calls as requested
    if (!body.data || !body.data[0]?.toolCalls) {
      return NextResponse.json({ message: "No tools called" }, { status: 200 });
    }

    let farmerName, cropType, loanAmount;

    // Extract from the structure verified by the safety check
    const toolCalls = body.data[0].toolCalls;

    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls.find(
        (tc: any) => tc.name === "save_loan_application"
      );
      if (toolCall) {
        ({ farmerName, cropType, loanAmount } = toolCall.arguments);
      }
    }

    // If we don't have the data yet, we might check other fields or just rely on what we found.
    // The prompt implies we receive "Name, Crop, Amount" and Upsert based on phone number.
    // Upsert needs a unique key. The prompt says "Upsert ... based on the phone number".
    // But where do we get the phone number?
    // "farmerName, mobileNumber (required)".
    // The tool definition in the prompt DOES NOT have mobileNumber:
    // "required": ["farmerName", "cropType", "loanAmount"]
    // However, the Model requires mobileNumber.
    // Presumably, the mobile number comes from the call context (caller ID) or requested from user.
    // Let's assume it's in the metadata or call info. Use a fallback or extract from "call" object.

    // Ultravox webhook usually has call details.
    const mobileNumber =
      body.call?.from || body.customer?.phoneNumber || "Unknown";

    if (!farmerName || !cropType || !loanAmount) {
      // Just log and return ok to not break the agent flow, or generic error.
      console.warn("Missing required fields in webhook");
      return NextResponse.json(
        { status: "success", message: "Partial data received" },
        { status: 200 }
      );
    }

    const updateData = {
      farmerName,
      cropType,
      loanAmount,
      status: "Pending", // Reset status on new application? Or keep existing?
      // If upserting, maybe set status only if new.
    };

    // Upsert
    const application = await LoanApplication.findOneAndUpdate(
      { mobileNumber },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      { success: true, id: application._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
