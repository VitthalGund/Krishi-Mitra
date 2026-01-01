"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KCCSchema,
  TractorSchema,
  DairySchema,
  LoanFormData,
} from "@/lib/schemas";
import {
  Send,
  Paperclip,
  Bot,
  Tractor,
  Sprout,
  Milk,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { submitLoanApplication } from "../actions";

type LoanType = "KCC" | "Mechanization" | "Dairy";

// Field Highlighting Component
const HighlightField = ({
  highlighted,
  children,
}: {
  highlighted: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`transition-colors duration-500 ease-in-out rounded-lg ${
        highlighted ? "ring-2 ring-yellow-400 bg-yellow-50" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default function ApplyPage() {
  const [loanType, setLoanType] = useState<LoanType>("KCC");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);

  // Vision / Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<string | null>(null);

  // Dynamic Schema Selection
  const currentSchema =
    loanType === "KCC"
      ? KCCSchema
      : loanType === "Mechanization"
      ? TractorSchema
      : DairySchema;

  // Form Handling
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      loanType: "KCC", // Default
    },
  });

  // Reset form when loan type changes (optional, but good for clean slate)
  useEffect(() => {
    reset({ loanType: loanType as any });
  }, [loanType, reset]);

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

        const newHighlights: string[] = [];

        // Helper to update and highlight
        const updateField = (key: keyof LoanFormData, value: any) => {
          if (value) {
            setValue(key, value);
            newHighlights.push(key);
          }
        };

        // Common
        updateField("farmerName", args.farmerName);
        updateField("mobile", args.mobile);
        updateField("village", args.village);

        // Switch Loan Type if AI suggests
        if (
          args.loanType &&
          ["KCC", "Mechanization", "Dairy"].includes(args.loanType)
        ) {
          if (loanType !== args.loanType) {
            setLoanType(args.loanType);
            // Note: Changing loan type might reset form due to useEffect above.
            // In a perfect world we'd merge values. For now, we let it switch.
          }
        }

        // Specifics
        updateField("surveyNo", args.surveyNo);
        updateField("crop", args.crop);
        updateField("acreage", args.acreage);
        updateField("cropSeason", args.cropSeason);
        updateField("equipment", args.equipment);
        updateField("dealer", args.dealer);
        updateField("price", args.price); // Map price -> quotationAmount logic if needed
        updateField("animalCount", args.animalCount);
        updateField("animalType", args.animalType);

        // Trigger Highlight Effect
        setHighlightedFields(newHighlights);
        setTimeout(() => setHighlightedFields([]), 2000); // Remove after 2s

        return "Form updated successfully.";
      }
    },
  });

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachment(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;

    const files = fileInputRef.current?.files;

    handleChatSubmit(e, {
      experimental_attachments: files ? files : undefined,
    });

    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: LoanFormData) => {
    console.log("Submitting:", data);
    try {
      const result = await submitLoanApplication(data);
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
    setTimeout(() => {
      setValue("acreage", 3.5); // Use number for Zod coercion or string if schema allows
      alert("AgriStack Verified: Owner Vitthal Gund");
      setVerifying(false);
      setHighlightedFields((prev) => [...prev, "acreage"]);
      setTimeout(() => setHighlightedFields([]), 2000);
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
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              <HighlightField
                highlighted={highlightedFields.includes("farmerName")}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Farmer Name
                </label>
                <input
                  {...register("farmerName")}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ram Lal"
                />
                {errors.farmerName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.farmerName.message as string}
                  </p>
                )}
              </HighlightField>

              <HighlightField
                highlighted={highlightedFields.includes("mobile")}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  {...register("mobile")}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="9876543210"
                />
                {errors.mobile && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.mobile.message as string}
                  </p>
                )}
              </HighlightField>

              <HighlightField
                highlighted={highlightedFields.includes("village")}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Village
                </label>
                <input
                  {...register("village")}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Village Name"
                />
                {errors.village && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.village.message as string}
                  </p>
                )}
              </HighlightField>
            </div>

            {/* KCC Fields */}
            {loanType === "KCC" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">
                      Land Details
                    </h3>
                  </div>

                  <HighlightField
                    highlighted={highlightedFields.includes("surveyNo")}
                  >
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
                          "Verify"
                        )}
                      </button>
                    </div>
                    {errors.surveyNo && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.surveyNo.message as string}
                      </p>
                    )}
                  </HighlightField>

                  <HighlightField
                    highlighted={highlightedFields.includes("acreage")}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Total Land Area (Acres)
                    </label>
                    <input
                      {...register("acreage")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                      placeholder="Auto-filled"
                      readOnly
                    />
                    {errors.acreage && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.acreage.message as string}
                      </p>
                    )}
                  </HighlightField>

                  <HighlightField
                    highlighted={highlightedFields.includes("crop")}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Crop Name
                    </label>
                    <input
                      {...register("crop")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. Sugarcane"
                    />
                    {errors.crop && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.crop.message as string}
                      </p>
                    )}
                  </HighlightField>

                  <HighlightField
                    highlighted={highlightedFields.includes("cropSeason")}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Season
                    </label>
                    <select
                      {...register("cropSeason")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Kharif">Kharif</option>
                      <option value="Rabi">Rabi</option>
                      <option value="Zaid">Zaid</option>
                    </select>
                  </HighlightField>
                </div>
              </div>
            )}

            {/* Mechanization (Tractor) Fields */}
            {loanType === "Mechanization" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HighlightField
                    highlighted={highlightedFields.includes("equipment")}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Equipment Name
                    </label>
                    <input
                      {...register("equipment")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. John Deere 5310"
                    />
                    {errors.equipment && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.equipment.message as string}
                      </p>
                    )}
                  </HighlightField>

                  <HighlightField
                    highlighted={highlightedFields.includes("dealer")}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Dealer Name
                    </label>
                    <input
                      {...register("dealer")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Authorized Dealer"
                    />
                    {errors.dealer && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.dealer.message as string}
                      </p>
                    )}
                  </HighlightField>

                  <HighlightField
                    highlighted={highlightedFields.includes("price")}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quotation Price (₹)
                    </label>
                    <input
                      {...register("price")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="850000"
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.price.message as string}
                      </p>
                    )}
                  </HighlightField>
                </div>
              </div>
            )}

            {/* Dairy Fields */}
            {loanType === "Dairy" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HighlightField
                    highlighted={highlightedFields.includes("animalType")}
                  >
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
                  </HighlightField>

                  <HighlightField
                    highlighted={highlightedFields.includes("animalCount")}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Number of Animals
                    </label>
                    <input
                      {...register("animalCount")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 5"
                    />
                    {errors.animalCount && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.animalCount.message as string}
                      </p>
                    )}
                  </HighlightField>
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
        {/* Toggle Button */}
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
                I can help you fill the form.
              </p>
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
                {/* Attachments */}
                {m.experimental_attachments &&
                  m.experimental_attachments.length > 0 && (
                    <div className="mt-2 text-xs">
                      {m.experimental_attachments.map((att: any, idx: number) =>
                        att.contentType?.startsWith("image/") ? (
                          <img
                            key={idx}
                            src={att.url}
                            alt="attachment"
                            className="max-w-full rounded mt-1"
                          />
                        ) : (
                          <span key={idx}>[Attachment]</span>
                        )
                      )}
                    </div>
                  )}
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
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* Preview */}
          {attachment && (
            <div className="mb-2 relative inline-block">
              <img
                src={attachment}
                alt="Preview"
                className="h-12 w-12 rounded object-cover border border-slate-200"
              />
              <button
                onClick={() => {
                  setAttachment(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
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
              className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
