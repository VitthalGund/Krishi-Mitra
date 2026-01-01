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
    // Extract from the structure verified by the safety check
    const toolCalls = body.data[0].toolCalls;

    if (toolCalls && toolCalls.length > 0) {
      // --- Tool: Status Check ---
      const statusTool = toolCalls.find(
        (tc: any) => tc.name === "check_application_status"
      );

      if (statusTool) {
        // Prefer tool arg, fallback to caller id
        const lookupMobile =
          statusTool.arguments?.mobileNumber || body.call?.from;

        console.log("Checking status for:", lookupMobile);

        if (!lookupMobile) {
          return NextResponse.json(
            {
              result:
                "I could not find a mobile number to check the status for.",
            },
            { status: 200 }
          );
        }

        // Find latest application (assuming 'details.mobileNumber' or just by userId if we had it, but here likely by mobile stored in details or conventions)
        // Since the prompt implied looking up by mobile:
        // Note: The previous save logic didn't explicitly save 'details.mobileNumber' in the top level.
        // We will search in 'details.mobile' or try to match if we saved it in a standard way.
        // For this implementation, let's assume we search in `details` or a strict field if added.
        // Given current schema uses Mixed details, we'll Query `details.mobile` or `mobileNumber` if we decide to save it there.
        // Let's check `details.mobile` as a convention or the top level if we add it to schema.
        // Schema doesn't have top-level mobile. Let's assume we save it in details.

        // Actually, the previous 'save_loan_application' logic (in this file) was UPSERTING based on { mobileNumber } but that was in the 'filter' of findOneAndUpdate...
        // Wait, the previous file had: `LoanApplication.findOneAndUpdate({ mobileNumber }, ...)`
        // This implies 'mobileNumber' IS a field suitable for query.
        // But the schema I saw: `userId`, `type`, `status`, `details`, `documents`, `aiAnalysis`.
        // It does NOT have `mobileNumber` at top level.
        // *Correction*: The previous webhook code WAS trying to use `mobileNumber` filter.
        // If the schema doesn't have it, it must be in `details` or the previous code was slightly broken regarding schema (Mongoose might throw or ignore if strict).
        // To be safe and strict, I should query `details.mobile` OR `userId` if mapped.
        // BUT, since we are patching, let's assume the intention is to find by `details.mobile` or similar.
        // Let's use a flexible query for now: look for `details.mobile` or just `mobileNumber` if user added it to schema (they didn't explicitly in the diff).
        // Let's stick to `details.mobile` or finding by `details` containing the number.

        // However, the previous code used: `LoanApplication.findOneAndUpdate({ mobileNumber }, ...)`
        // If `strict: false` isn't set, this might fail if not in schema.
        // Let's fix this access pattern. We will search `details.mobileNumber`.

        const latestApp = await LoanApplication.findOne({
          "details.mobileNumber": lookupMobile,
        }).sort({ createdAt: -1 });

        if (latestApp) {
          return NextResponse.json(
            {
              result: `Your application for ${latestApp.type} loan is currently ${latestApp.status}.`,
            },
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            {
              result:
                "I could not find any loan application linked to this number.",
            },
            { status: 200 }
          );
        }
      }

      // --- Tool: Save Application (Existing Logic) ---
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

    if (!farmerName || !cropType || !loanAmount) {
      // If we didn't match 'save_loan_application' and didn't return from 'status check',
      // we might be here. If tools were called but not these two, just return ok.
      return NextResponse.json(
        { message: "No relevant tools processed" },
        { status: 200 }
      );
    }

    const updateData = {
      // We must save mobileNumber inside details if we want to find it later!
      details: {
        farmerName,
        crop: cropType,
        loanAmount,
        mobileNumber, // IMPORTANT: Save this for lookup!
      },
      status: "Submitted", // Default to Submitted if coming from voice agent
      type: "KCC", // Defaulting to KCC for voice demo if not specified
      userId: "653a1234567890abcdef1234", // Mock User
    };

    // Upsert using the details.mobileNumber to find existing or create new
    const application = await LoanApplication.findOneAndUpdate(
      { "details.mobileNumber": mobileNumber },
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
