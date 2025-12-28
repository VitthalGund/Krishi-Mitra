"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Register() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    language: "hi", // Default to Hindi as per user context
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Update global language context if user changes it here
    if (e.target.name === "language") {
      setLanguage(e.target.value as "en" | "hi" | "mr");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("krishi_user_mobile", data.user.mobileNumber);
      localStorage.setItem("krishi_user_name", data.user.name);

      // Ensure global language matches preference
      setLanguage(formData.language as "en" | "hi" | "mr");

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-emerald-950 flex flex-col items-center justify-center p-4 pt-24 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] -right-[10%] w-[600px] h-[600px] rounded-full bg-emerald-200/40 dark:bg-emerald-800/20 blur-3xl transition-colors duration-300"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-teal-200/40 dark:bg-teal-800/20 blur-3xl transition-colors duration-300"></div>
      </div>

      <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-white/10 relative z-10 transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="inline-block bg-emerald-100 dark:bg-emerald-800/50 p-3 rounded-2xl mb-4 border border-emerald-100 dark:border-emerald-700/50">
            <Sprout className="w-8 h-8 text-emerald-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t.registerTitle}
          </h1>
          <p className="text-slate-500 dark:text-emerald-200/70 text-sm">
            {t.registerSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-200 text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-emerald-200/80 mb-1.5 ml-1">
              {t.formName}
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-700 focus:outline-none focus:border-emerald-500 dark:focus:border-yellow-500/50 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-yellow-500/50 transition-all font-medium"
              placeholder="e.g. Ram Lal"
            />
          </div>

          {/* Mobile Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-emerald-200/80 mb-1.5 ml-1">
              {t.formMobile}
            </label>
            <input
              type="tel"
              name="mobileNumber"
              required
              value={formData.mobileNumber}
              onChange={handleChange}
              className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-700 focus:outline-none focus:border-emerald-500 dark:focus:border-yellow-500/50 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-yellow-500/50 transition-all font-medium"
              placeholder="e.g. 9876543210"
            />
          </div>

          {/* Language Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-emerald-200/80 mb-1.5 ml-1">
              {t.formLang}
            </label>
            <div className="relative">
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-yellow-500/50 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-yellow-500/50 transition-all appearance-none font-medium cursor-pointer"
              >
                <option
                  value="en"
                  className="bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                >
                  English
                </option>
                <option
                  value="hi"
                  className="bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                >
                  Hindi (हिंदी)
                </option>
                <option
                  value="mr"
                  className="bg-white dark:bg-emerald-900 text-slate-900 dark:text-white"
                >
                  Marathi (मराठी)
                </option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-emerald-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-400 dark:hover:to-yellow-500 text-white dark:text-emerald-950 font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 dark:shadow-yellow-500/20 transition-all transform hover:-translate-y-0.5 mt-4"
          >
            {loading ? "Creating Account..." : t.formSubmit}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-emerald-400/60">
          Already registered?{" "}
          <a
            href="/login"
            className="text-emerald-600 dark:text-yellow-400 hover:underline"
          >
            {t.navLogin} here
          </a>
        </p>
      </div>
    </div>
  );
}
