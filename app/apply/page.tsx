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
  Save,
  ArrowRight,
} from "lucide-react";
import { submitApplication, saveDraft } from "../actions";
import { useRouter } from "next/navigation";

type LoanType = "KCC" | "Mechanization" | "Dairy" | null;

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
      className={`transition-colors duration-500 ease-in-out rounded-lg p-1 -m-1 ${
        highlighted ? "ring-2 ring-yellow-400 bg-yellow-50" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default function ApplyPage() {
  const [loanType, setLoanType] = useState<LoanType>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const router = useRouter();

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
    getValues, // Needed for Drafts
    formState: { errors, isValid },
  } = useForm<LoanFormData>({
    resolver: loanType ? zodResolver(currentSchema) : undefined,
    mode: "onChange",
  });

  // AI Chat Hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLoading,
  } = useChat({
    api: "/api/chat",
    maxSteps: 5,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === "update_form") {
        const args = toolCall.args as any;
        console.log("AI Updating Form:", args);

        const newHighlights: string[] = [];
        const updateField = (key: keyof LoanFormData, value: any) => {
          if (value) {
            setValue(key, value, { shouldValidate: true });
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
            // If we are in Selection State, this auto-selects.
            // If we are in Form State, it switches tabs.
            setLoanType(args.loanType);
          }
        }

        // Specifics
        updateField("surveyNo", args.surveyNo);
        updateField("crop", args.crop);
        updateField("acreage", args.acreage);
        updateField("cropSeason", args.cropSeason);
        updateField("equipment", args.equipment);
        updateField("dealer", args.dealer);
        updateField("price", args.price);
        updateField("animalCount", args.animalCount);
        updateField("animalType", args.animalType);

        setHighlightedFields(newHighlights);
        setTimeout(() => setHighlightedFields([]), 2000);

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
      setAttachment(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;
    const files = fileInputRef.current?.files;
    handleChatSubmit(e, {
      experimental_attachments: files ? files : undefined,
    });
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- ACTIONS ---

  const onSaveDraft = async () => {
    setIsSaving(true);
    const data = getValues(); // Get raw values, valid or not
    const result = await saveDraft({ ...data, loanType });
    setIsSaving(false);

    if (result.success) {
      alert("Draft Saved! Expected to resume later.");
    } else {
      alert("Failed to save draft: " + result.error);
    }
  };

  const onSubmit = async (data: LoanFormData) => {
    setIsSaving(true);
    const result = await submitApplication({ ...data, loanType }); // Re-validates on server
    setIsSaving(false);

    if (result.success) {
      alert("Application Submitted Successfully! ID: " + result.id);
      router.push("/dashboard");
    } else {
      alert("Submission Failed: " + result.error);
    }
  };

  const verifyLand = () => {
    setVerifying(true);
    setTimeout(() => {
      setValue("acreage", 3.5);
      alert("AgriStack Verified: Owner Vitthal Gund");
      setVerifying(false);
      setHighlightedFields((prev) => [...prev, "acreage"]);
      setTimeout(() => setHighlightedFields([]), 2000);
    }, 2000);
  };

  // --- RENDER: STEP 1 (Selection) ---
  if (!loanType) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center font-sans">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          Choose Your Loan
        </h1>
        <p className="text-slate-600 mb-10 max-w-lg text-center">
          Select the type of agricultural financing you need. Our AI Assistant
          will help you complete the application.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {[
            {
              id: "KCC",
              label: "Kisan Credit Card",
              desc: "For seeds, fertilizers, and crop expenses.",
              icon: Sprout,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              id: "Mechanization",
              label: "Farm Mechanization",
              desc: "Tractors, harvesters, and equipment.",
              icon: Tractor,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              id: "Dairy",
              label: "Dairy & Livestock",
              desc: "Cattle purchase and shed construction.",
              icon: Milk,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map((type: any) => (
            <button
              key={type.id}
              onClick={() => setLoanType(type.id)}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-200 text-left group"
            >
              <div
                className={`w-14 h-14 ${type.bg} ${type.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <type.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {type.label}
              </h3>
              <p className="text-slate-500 mb-6">{type.desc}</p>
              <div className="flex items-center font-semibold text-emerald-600 gap-2">
                Apply Now <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDER: STEP 2 (Form + Chat) ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* LEFT PANE: Application Form */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? "mr-[400px]" : "mr-0"
        }`}
      >
        <div className="max-w-4xl mx-auto p-8 pt-10 pb-32">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <button
                onClick={() => setLoanType(null)}
                className="text-sm text-slate-500 hover:text-emerald-600 mb-1"
              >
                ← Back to Selection
              </button>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                {loanType === "KCC" && (
                  <Sprout className="w-8 h-8 text-emerald-600" />
                )}
                {loanType === "Mechanization" && (
                  <Tractor className="w-8 h-8 text-blue-600" />
                )}
                {loanType === "Dairy" && (
                  <Milk className="w-8 h-8 text-amber-600" />
                )}
                {loanType === "KCC"
                  ? "Crop Loan"
                  : loanType === "Mechanization"
                  ? "Tractor Loan"
                  : "Dairy Loan"}{" "}
                Application
              </h1>
            </div>
          </header>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 relative"
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
                  type="tel"
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

            {/* Mechanization */}
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

            {/* Dairy */}
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

            {/* ACTION FOOTER */}
            <div className="pt-8 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white p-4 -mx-4 -mb-4 rounded-b-2xl">
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Draft
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
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
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-1/2 -left-12 bg-emerald-600 text-white p-3 rounded-l-xl shadow-lg hover:bg-emerald-700"
          >
            <Bot className="w-6 h-6" />
          </button>
        )}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600" /> Krishi-Sahayak
          </h3>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="mt-10 p-6 bg-white rounded-xl border border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                I can help you fill the form. Attach a photo of 7/12 or just
                speak.
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
                    ? "bg-emerald-600 text-white"
                    : "bg-white border text-slate-700"
                }`}
              >
                {m.content}
                {m.experimental_attachments?.map(
                  (a: any, i: number) =>
                    a.contentType?.startsWith("image") && (
                      <img
                        key={i}
                        src={a.url}
                        className="mt-2 rounded max-w-full"
                      />
                    )
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 m-4" />
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          {attachment && (
            <div className="mb-2 relative inline-flex">
              <img
                src={attachment}
                className="h-12 w-12 rounded object-cover border"
              />
              <button
                onClick={() => setAttachment(null)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <form onSubmit={handleCustomChatSubmit} className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-emerald-600"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type or speak..."
              className="flex-1 bg-slate-100 rounded-full px-4 outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
              disabled={isLoading}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
