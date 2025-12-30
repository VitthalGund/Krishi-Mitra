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
} from "lucide-react";

type LoanType = "KCC" | "Tractor" | "Dairy";

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
  } = useForm();

  // AI Chat Hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    setMessages,
    isLoading,
  } = useChat({
    api: "/api/chat",
    onToolCall: async (toolCall: any) => {
      // Vercel AI SDK (native) might handle tools differently depending on version.
      // If the backend streams tool calls properly, this callback or the message stream will identify it.
      // However, for GoogleGenerativeAIStream, function calls often come as text chunks or specific functionCall blocks.
      // We'll implement a fallback check in `useEffect` on messages to be safe.
      if (toolCall.name === "fill_form") {
        const args = JSON.parse(toolCall.arguments as string);
        console.log("Auto-filling form:", args);
        Object.keys(args).forEach((key) => {
          setValue(key, args[key]);
          if (
            key === "loanType" &&
            ["KCC", "Tractor", "Dairy"].includes(args[key])
          ) {
            setLoanType(args[key]);
          }
        });
        return "Form updated successfully.";
      }
    },
  });

  // Watch for Tool Calls in Messages (Fallback)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg.toolInvocations) {
      lastMsg.toolInvocations.forEach((tool) => {
        if (tool.toolName === "fill_form" && tool.args) {
          const args = tool.args;
          Object.keys(args).forEach((key) => {
            // @ts-ignore
            setValue(key, args[key]);
            // @ts-ignore
            if (
              key === "loanType" &&
              ["KCC", "Tractor", "Dairy"].includes(args[key])
            ) {
              // @ts-ignore
              setLoanType(args[key]);
            }
          });
        }
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, setValue]);

  const onSubmit = (data: any) => {
    console.log("Form Submitted:", data);
    alert("Application Submitted! Status: Pending Verification.");
  };

  const verifyLand = async () => {
    setVerifying(true);
    // Mock AgriStack API
    setTimeout(() => {
      setValue("ownerName", "Vitthal Gund");
      setValue("landArea", "3.5 Acres");
      setValue("riskStatus", "Low");
      setVerifying(false);
      // Trigger a system message in chat
      const sysMsg = {
        id: Date.now().toString(),
        role: "system",
        content: "AgriStack Verified: Land 3.5 Acres, Owner Vitthal Gund.",
      };
      // We can't easily inject system messages into useChat state directly without using setMessages spread
      // But visually we can show a toast or just let the form update speak for itself.
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* LEFT PANE: Application Form */}
      <div
        className={`flex-1 overflow-y-auto transition-all ${
          isSidebarOpen ? "mr-96" : ""
        }`}
      >
        <div className="max-w-4xl mx-auto p-8 pt-24">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            New Loan Application
          </h1>
          <p className="text-slate-500 mb-8">
            Krishi-Sahayak Portal • Certified by NABARD
          </p>

          {/* Loan Selector */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {(["KCC", "Tractor", "Dairy"] as LoanType[]).map((type) => (
              <button
                key={type}
                onClick={() => setLoanType(type)}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  loanType === type
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {type === "KCC" && <Sprout className="w-6 h-6" />}
                {type === "Tractor" && <Tractor className="w-6 h-6" />}
                {type === "Dairy" && <Milk className="w-6 h-6" />}
                <span className="font-semibold">{type} Loan</span>
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Survey / Gat Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        {...register("surveyNumber")}
                        className="flex-1 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. 102/2A"
                      />
                      <button
                        type="button"
                        onClick={verifyLand}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
                        disabled={verifying}
                      >
                        {verifying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Village & Taluka
                    </label>
                    <input
                      {...register("village")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Village, Taluka"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Total Land Area
                    </label>
                    <input
                      {...register("landArea")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                      placeholder="Auto-filled after verification"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Crop Season
                    </label>
                    <select
                      {...register("cropSeason")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Kharif">Kharif (Monsoon)</option>
                      <option value="Rabi">Rabi (Winter)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tractor Fields */}
            {loanType === "Tractor" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dealer Name
                    </label>
                    <input
                      {...register("dealerName")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Authorized Dealer Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Equipment Type
                    </label>
                    <select
                      {...register("equipmentType")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Tractor">Tractor</option>
                      <option value="Power Tiller">Power Tiller</option>
                      <option value="Drone">Agri-Drone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quotation Amount (₹)
                    </label>
                    <input
                      {...register("quotationAmount")}
                      type="number"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Loan Amount Requested (₹)
                    </label>
                    <input
                      {...register("loanAmount")}
                      type="number"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="0.00"
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
                      <option value="Cow">Cow (Crossbred)</option>
                      <option value="Buffalo">Buffalo (Murrah)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Number of Animals
                    </label>
                    <input
                      {...register("animalCount")}
                      type="number"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Shed Area (Sq. ft)
                    </label>
                    <input
                      {...register("shedArea")}
                      type="number"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Daily Milk Yield (Liters)
                    </label>
                    <input
                      {...register("milkYield")}
                      type="number"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT PANE: AI Co-pilot */}
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 flex flex-col z-50 ${
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
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200">
              <Bot className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Sahayak AI</h3>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Online • Gemini/Ollama
              </span>
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
            <div className="text-center mt-10 opacity-60">
              <p className="text-sm text-slate-500">Ask me anything like:</p>
              <div className="mt-4 space-y-2">
                <span
                  className="block text-xs bg-white border border-slate-200 p-2 rounded-lg cursor-pointer hover:border-emerald-400"
                  onClick={() =>
                    handleInputChange({
                      target: { value: "I want a tractor loan" },
                    } as any)
                  }
                >
                  "I want a tractor loan"
                </span>
                <span
                  className="block text-xs bg-white border border-slate-200 p-2 rounded-lg cursor-pointer hover:border-emerald-400"
                  onClick={() =>
                    handleInputChange({
                      target: { value: "My land is 2 acres in Pune" },
                    } as any)
                  }
                >
                  "My land is 2 acres in Pune"
                </span>
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
                {m.content}
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
              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
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
