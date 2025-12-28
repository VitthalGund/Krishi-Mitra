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

    let farmerName, cropType, loanAmount, mobileNumber;

    // Extract from the structure verified by the safety check
    const toolCalls = body.data[0].toolCalls;

    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls.find(
        (tc: any) => tc.name === "save_loan_application"
      );
      if (toolCall) {
        ({ farmerName, cropType, loanAmount, mobileNumber } =
          toolCall.arguments);
      }
    }

    // Fallback if mobileNumber wasn't caught in the tool (though required by prompt)
    // or if we want to log the "from" number as backup.
    if (!mobileNumber) {
      mobileNumber = body.call?.from || "Unknown-Web-User";
    }

    if (!farmerName || !cropType || !loanAmount || !mobileNumber) {
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
