"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
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
  X,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileText,
  User,
  Volume2,
  MicOff,
  Mic,
} from "lucide-react";
import { submitApplication, saveDraft } from "../actions";
import { useRouter } from "next/navigation";

// --- Types ---
type LoanType = "KCC" | "Mechanization" | "Dairy" | null;
type Step = 0 | 1 | 2 | 3; // 0: Select, 1: Personal, 2: Loan Details, 3: Documents

// --- Components ---
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
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const router = useRouter();

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Vision / Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<string | null>(null);

  // Dynamic Schema
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
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: loanType ? zodResolver(currentSchema) : undefined,
    mode: "onBlur", // Switch to onBlur to reduce typing noise
    defaultValues: {
      farmerName: "",
      mobile: "",
      village: "",
      surveyNo: "",
      crop: "",
      equipment: "",
      dealer: "",
      animalType: "Cow",
      cropSeason: "Kharif",
      // Numeric fields can be undefined initially, but we need to handle Zod
    },
  });

  // Sync loanType state with Form Data
  useEffect(() => {
    if (loanType) {
      setValue("loanType", loanType);
    }
  }, [loanType, setValue]);

  // --- Auto-Fill from LocalStorage & Drafts ---
  useEffect(() => {
    // 1. User Logic
    const storedMobile = localStorage.getItem("krishi_user_mobile");
    const storedName = localStorage.getItem("krishi_user_name");

    if (storedMobile) setValue("mobile", storedMobile);
    if (storedName) setValue("farmerName", storedName);

    // 2. Draft Logic
    const savedDraft = localStorage.getItem("krishi_loan_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (confirm("Found a saved draft. Do you want to resume?")) {
          setLoanType(parsed.loanType);
          setCurrentStep(parsed.currentStep || 1);
          Object.keys(parsed.formData).forEach((key) => {
            setValue(key as any, parsed.formData[key]);
          });
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [setValue]);

  // Auto-Save Draft
  useEffect(() => {
    if (!loanType) return;
    const interval = setInterval(() => {
      const formData = getValues();
      localStorage.setItem(
        "krishi_loan_draft",
        JSON.stringify({ loanType, currentStep, formData })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [loanType, currentStep, getValues]);

  // --- Voice Helpers ---
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN"; // Prefer Indian English for technical terms, or switch to hi-IN
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- AI Chat Hook ---
  const {
    messages,
    append,
    isLoading,
    input,
    setInput,
    handleSubmit: handleChatSubmit,
  } = useChat({
    api: "/api/chat",
    maxSteps: 5,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === "update_form" && toolCall.args) {
        const args = toolCall.args as any;
        console.log("AI Auto-filling:", args);

        // 1. Update Form State
        const fieldsUpdated: string[] = [];
        Object.keys(args).forEach((key) => {
          if (args[key]) {
            setValue(key as any, args[key]);
            fieldsUpdated.push(key);
          }
        });

        // 2. Special Logic: Switch Loan Type if detected
        if (args.loanType && args.loanType !== loanType) {
          setLoanType(args.loanType);
          if (currentStep === 0) setCurrentStep(1); // Auto-advance
        }

        // 3. Highlight updated fields
        setHighlightedFields(fieldsUpdated);
        setTimeout(() => setHighlightedFields([]), 3000);

        return "Form updated successfully with provided details.";
      }
    },
    onFinish: (message) => {
      // Speak the AI response
      speakText(message.content);
    },
  });

  // --- Step Navigation ---
  const nextStep = async () => {
    let valid = false;
    if (currentStep === 1) {
      valid = await trigger(["farmerName", "mobile", "village"]);
    } else if (currentStep === 2) {
      // Trigger all fields for the specific loan type
      valid = await trigger();
    }

    if (valid || currentStep === 0) {
      if (currentStep < 3) setCurrentStep((p) => (p + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((p) => (p - 1) as Step);
    if (currentStep === 1) {
      setLoanType(null);
      setCurrentStep(0);
    }
  };

  // --- Voice Recognition ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript); // Set input for visual feedback
          append({ role: "user", content: transcript }); // Auto-send
        };
        recognitionRef.current = recognition;
      }
    }
  }, [append, setInput]);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else recognitionRef.current?.start();
  };

  // --- Actions ---
  const onSaveDraft = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // Fake network delay
    const formData = getValues();
    localStorage.setItem(
      "krishi_loan_draft",
      JSON.stringify({ loanType, currentStep, formData })
    );
    setIsSaving(false);
    alert("Draft Saved to Device!");
  };

  const onSubmit = async (data: LoanFormData) => {
    setIsSaving(true);
    // Simulate server action
    const result = await submitApplication({ ...data, loanType }); // Assume this server action handles the DB write
    setIsSaving(false);
    if (result.success) {
      localStorage.removeItem("krishi_loan_draft");
      router.push("/dashboard");
    } else {
      alert("Submission Failed: " + result.error);
    }
  };

  const verifyLand = () => {
    setVerifying(true);
    setTimeout(() => {
      setValue("acreage", "3.5");
      setValue("ownerName", "Vitthal Gund"); // If field exists
      speakText(
        "Verified. Land record found: 3.5 Acres owned by Vitthal Gund."
      );
      setVerifying(false);
      setHighlightedFields((prev) => [...prev, "acreage"]);
      setTimeout(() => setHighlightedFields([]), 2000);
    }, 2000);
  };

  // --- RENDER: STEP 0 (Selection) ---
  if (!loanType || currentStep === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center font-sans">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          Choose Your Loan
        </h1>
        <p className="text-slate-600 mb-10 max-w-lg text-center">
          Select the type of agricultural financing you need. Our AI Assistant
          is ready to help.
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
              onClick={() => {
                setLoanType(type.id);
                setCurrentStep(1);
              }}
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

  // --- RENDER: MULTI-STEP FORM ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* LEFT PANE: Form Wizard */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? "mr-[400px]" : "mr-0"
        }`}
      >
        <div className="max-w-3xl mx-auto p-8 pt-10 pb-32">
          {/* Header & Steps */}
          <div className="mb-8">
            <button
              onClick={prevStep}
              className="text-sm text-slate-500 hover:text-emerald-600 mb-4 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-4 mb-6">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 ${
                    currentStep >= step ? "text-emerald-600" : "text-slate-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                      currentStep >= step
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-300"
                    }`}
                  >
                    {step}
                  </div>
                  <span className="font-medium hidden md:block">
                    {step === 1 && "Personal"}
                    {step === 2 && "Loan Details"}
                    {step === 3 && "Documents"}
                  </span>
                  {step < 3 && <div className="w-8 h-0.5 bg-slate-200 mx-2" />}
                </div>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Apply for{" "}
              {loanType === "KCC"
                ? "Kisan Credit Card"
                : loanType === "Mechanization"
                ? "Tractor Loan"
                : "Dairy Loan"}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8 relative min-h-[500px]"
          >
            {/* STEP 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                <h2 className="text-xl font-semibold text-slate-700 pb-2 border-b border-slate-100 mb-6">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HighlightField
                    highlighted={highlightedFields.includes("farmerName")}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      {...register("farmerName")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="First Last"
                    />
                    {errors.farmerName && (
                      <p className="text-red-500 text-xs mt-1">
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.mobile.message as string}
                      </p>
                    )}
                  </HighlightField>
                  <HighlightField
                    highlighted={highlightedFields.includes("village")}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Village Name
                    </label>
                    <input
                      {...register("village")}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Village, Taluka"
                    />
                    {errors.village && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.village.message as string}
                      </p>
                    )}
                  </HighlightField>
                </div>
              </div>
            )}

            {/* STEP 2: Loan Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                <h2 className="text-xl font-semibold text-slate-700 pb-2 border-b border-slate-100 mb-6">
                  Loan Particulars
                </h2>

                {/* KCC fields */}
                {loanType === "KCC" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <HighlightField
                      highlighted={highlightedFields.includes("surveyNo")}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Survey No / Gat No
                      </label>
                      <div className="flex gap-2">
                        <input
                          {...register("surveyNo")}
                          className="flex-1 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="e.g. 102/A"
                        />
                        <button
                          type="button"
                          onClick={verifyLand}
                          disabled={verifying}
                          className="bg-emerald-600 text-white px-3 rounded-lg text-sm hover:bg-emerald-700"
                        >
                          {verifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </div>
                    </HighlightField>
                    <HighlightField
                      highlighted={highlightedFields.includes("acreage")}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Total Land (Acres)
                      </label>
                      <input
                        {...register("acreage")}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
                        readOnly
                        placeholder="Auto-filled"
                      />
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
                        placeholder="e.g. Rice"
                      />
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
                      </select>
                    </HighlightField>
                  </div>
                )}

                {/* Tractor fields */}
                {loanType === "Mechanization" && (
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
                        placeholder="Tractor Model"
                      />
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
                        placeholder="0.00"
                      />
                    </HighlightField>
                  </div>
                )}

                {/* Dairy fields */}
                {loanType === "Dairy" && (
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
                        Quantity
                      </label>
                      <input
                        {...register("animalCount")}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Number of Animals"
                      />
                    </HighlightField>
                    <HighlightField
                      highlighted={highlightedFields.includes("milkYield")}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Daily Milk Yield (Liters)
                      </label>
                      <input
                        {...register("milkYield")}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. 15"
                      />
                    </HighlightField>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                <h2 className="text-xl font-semibold text-slate-700 pb-2 border-b border-slate-100 mb-6">
                  Required Documents
                </h2>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-4 items-start">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-800">
                      Automatic Verification Active
                    </h4>
                    <p className="text-sm text-emerald-700 mt-1">
                      We have verified your land records automatically via
                      AgriStack. No 7/12 upload required.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer">
                    <FileText className="w-10 h-10 mb-2" />
                    <span className="text-sm font-medium">
                      Upload Aadhaar Card (Front & Back)
                    </span>
                  </div>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer">
                    <FileText className="w-10 h-10 mb-2" />
                    <span className="text-sm font-medium">Upload PAN Card</span>
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="pt-8 border-t border-slate-100 flex justify-between items-center mt-12">
              <button
                type="button"
                onClick={onSaveDraft}
                className="text-slate-500 hover:text-emerald-600 font-medium flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Draft
              </button>

              <div className="flex gap-4">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-md flex items-center gap-2"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                )}
              </div>
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

        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" /> Sahayak AI
            </h3>
            <span className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online • {isSpeaking ? "Speaking..." : "Ready"}
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="mt-8 p-6 bg-white rounded-xl border border-slate-200 text-center mx-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Volume2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">Voice Enabled</h4>
              <p className="text-sm text-slate-500 mb-4">
                Tell me about your farm, or verify details. I can fill the form
                for you.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-xs bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-slate-200 hover:border-emerald-200">
                  "I have 5 acres of Sugarcane"
                </span>
                <span className="text-xs bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-slate-200 hover:border-emerald-200">
                  "I need a tractor loan"
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
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-sm"
                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="text-xs text-slate-400 font-medium">
                  Processing...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="flex items-end gap-2"
          >
            <button
              type="button"
              className="p-3 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-xl hover:bg-emerald-50"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white transition-all border border-transparent focus-within:border-emerald-200">
              <input
                value={input || ""}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or use voice..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 min-h-[24px]"
              />
            </div>

            {(input || "").trim() ? (
              <button
                type="submit"
                disabled={isLoading}
                className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
