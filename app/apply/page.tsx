"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { useForm } from "react-hook-form";
import {
  Send,
  Paperclip,
  Bot,
  User,
  Tractor,
  Sprout,
  Milk,
  Loader2,
  CheckCircle,
  X,
  FileText,
} from "lucide-react";
import { submitLoanApplication } from "../actions";

type LoanType = "KCC" | "Mechanization" | "Dairy";

interface LoanFormData {
  surveyNo?: string;
  crop?: string;
  acreage?: string;
  equipment?: string;
  dealer?: string;
  price?: string;
  animalCount?: string;
  animalType?: string;
  village?: string;
  cropSeason?: string;
  dealerName?: string;
  equipmentType?: string;
  quotationAmount?: string;
  loanAmount?: string;
  shedArea?: string;
  milkYield?: string;
}

export default function ApplyPage() {
  const [loanType, setLoanType] = useState<LoanType>("KCC");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form Handling
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      surveyNo: "",
      crop: "",
      acreage: "",
      equipment: "",
      dealer: "",
      price: "",
      animalCount: "",
      animalType: "Cow",
      village: "",
      cropSeason: "Kharif",
      dealerName: "",
      equipmentType: "Tractor",
      quotationAmount: "",
      loanAmount: "",
      shedArea: "",
      milkYield: "",
    },
  });

  // AI Chat Hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLoading,
    addToolResult,
  } = useChat({
    api: "/api/chat",
    maxSteps: 5,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === "update_form") {
        const args = toolCall.args as any;
        console.log("AI Updating Form:", args);

        // Update form fields
        if (args.surveyNo) setValue("surveyNo", args.surveyNo);
        if (args.crop) setValue("crop", args.crop);
        if (args.acreage) setValue("acreage", args.acreage);
        if (args.equipment) setValue("equipment", args.equipment);
        if (args.dealer) setValue("dealer", args.dealer);
        if (args.price) setValue("price", args.price);
        if (args.animalCount) setValue("animalCount", args.animalCount);

        return "Form updated on screen.";
      }
    },
  });

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data: any) => {
    console.log("Submitting:", data);
    try {
      const result = await submitLoanApplication({ ...data, loanType });
      if (result.success) {
        alert("Application Submitted! ID: " + result.id);
      } else {
        alert("Submission Failed: " + result.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const verifyLand = () => {
    setVerifying(true);
    // Mock AgriStack
    setTimeout(() => {
      setValue("acreage", "3.5");
      alert("AgriStack Verified: Owner Vitthal Gund");
      setVerifying(false);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* LEFT PANE: Application Form */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? "mr-[400px]" : "mr-0"
        }`}
      >
        <div className="max-w-4xl mx-auto p-8 pt-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              New Loan Application
            </h1>
            <p className="text-slate-500 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Krishi-Sahayak Portal • Certified by NABARD
            </p>
          </header>

          {/* Loan Selector Tabs */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { id: "KCC", label: "Crop Loan", icon: Sprout },
              { id: "Mechanization", label: "Tractor Loan", icon: Tractor },
              { id: "Dairy", label: "Dairy Loan", icon: Milk },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setLoanType(type.id as LoanType)}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  loanType === type.id
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <type.icon className="w-6 h-6" />
                <span className="font-semibold">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6"
          >
            {/* KCC Fields */}
            {loanType === "KCC" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">
                      Land Details
                    </h3>
                  </div>

                  {/* Survey Number Verification */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Survey / Gat Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        {...register("surveyNo")}
                        className="flex-1 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. 102/2A"
                      />
                      <button
                        type="button"
                        onClick={verifyLand}
                        disabled={verifying}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-70"
                      >
                        {verifying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Verify Land"
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Verifies against AgriStack DB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Village Name
                    </label>
                    <input
                      {...register("village")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Enter Village"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Total Land Area (Acres)
                    </label>
                    <input
                      {...register("acreage")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                      placeholder="Auto-filled after verification"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Crop Name
                    </label>
                    <input
                      {...register("crop")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. Sugarcane"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mechanization (Tractor) Fields */}
            {loanType === "Mechanization" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Equipment Name
                    </label>
                    <input
                      {...register("equipment")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. John Deere 5310"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dealer Name
                    </label>
                    <input
                      {...register("dealer")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Authorized Dealer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quotation Price (₹)
                    </label>
                    <input
                      {...register("price")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="8,50,000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dairy Fields */}
            {loanType === "Dairy" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Animal Type
                    </label>
                    <select
                      {...register("animalType")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option>Cow</option>
                      <option>Buffalo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Number of Animals
                    </label>
                    <input
                      {...register("animalCount")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT PANE: AI Co-pilot */}
      <div
        className={`fixed inset-y-0 right-0 w-[400px] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 flex flex-col z-50 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Toggle Button (Visible when closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-1/2 -left-12 bg-emerald-600 text-white p-3 rounded-l-xl shadow-lg hover:bg-emerald-700"
          >
            <Bot className="w-6 h-6" />
          </button>
        )}

        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200">
                <Bot className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Krishi-Sahayak</h3>
              <p className="text-xs text-slate-500">
                AI Co-pilot • Multi-Engine
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="mt-10 p-6 bg-white rounded-xl border border-slate-200 text-center">
              <h4 className="font-semibold text-slate-700 mb-2">Welcome!</h4>
              <p className="text-sm text-slate-500 mb-4">
                I can help you fill the form. Try saying:
              </p>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    handleInputChange({
                      target: { value: "I want a tractor loan for John Deere" },
                    } as any)
                  }
                  className="w-full text-left text-xs bg-emerald-50 text-emerald-700 p-2 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  "I want a tractor loan..."
                </button>
                <button
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value: "My survey number is 105/2, crop is Sugarcane",
                      },
                    } as any)
                  }
                  className="w-full text-left text-xs bg-emerald-50 text-emerald-700 p-2 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  "My survey number is 105/2..."
                </button>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm"
                }`}
              >
                {/* Render Text Content */}
                {m.content}

                {/* Render Tool Invocations (Visual Feedback) */}
                {m.toolInvocations?.map((toolInvocation) => {
                  const toolCallId = toolInvocation.toolCallId;
                  const addResult = (result: string) =>
                    addToolResult({ toolCallId, result });

                  // Just showing a small indicator that a tool was utilized
                  return (
                    <div
                      key={toolCallId}
                      className="mt-2 text-xs bg-slate-100 p-2 rounded border border-slate-200"
                    >
                      <span className="font-semibold text-slate-500">
                        🛠️ Tool: {toolInvocation.toolName}
                      </span>
                      {/* We don't need to manually invoke here as we handle state in onToolCall */}
                      {"result" in toolInvocation && (
                        <div className="text-emerald-600 mt-1">
                          Done: {JSON.stringify(toolInvocation.result)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
              title="Upload Document"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type or speak..."
              className="flex-1 bg-slate-100 border border-transparent focus:bg-white focus:border-emerald-500 rounded-full px-4 py-2 text-sm outline-none transition-all"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 shadow-md disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
