"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";

// Simple validation schema
const loginSchema = z.object({
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
});

export default function Login() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setValidationError("");

    // 1. Validation
    const result = loginSchema.safeParse({ mobileNumber });
    if (!result.success) {
      setValidationError(result.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      // 2. Auth API Call
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber,
        }),
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        // 3. Success
        // Update global auth state via Context
        login({
          name: data.user.name,
          mobile: data.user.mobileNumber || data.user.mobile,
        });

        // Redirect
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("from") || "/dashboard"; // Redirect to dashboard by default
        router.push(redirectUrl);
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-emerald-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-white/5 dark:backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 dark:border-white/10 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block bg-emerald-100 dark:bg-emerald-800/50 p-3 rounded-full mb-4">
            <Lock className="w-6 h-6 text-emerald-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.loginTitle || "Welcome Back"}
          </h1>
          <p className="text-slate-500 dark:text-emerald-200/70">
            {t.loginSubtitle || "Enter your mobile number to continue"}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 dark:text-red-300 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg text-center mb-4 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-emerald-200/80 mb-2">
              {t.formMobile || "Mobile Number"}
            </label>
            <input
              type="tel"
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                validationError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-200 dark:border-emerald-800"
              }`}
              placeholder="e.g. 9876543210"
              pattern="[0-9]{10}"
              minLength={10}
              maxLength={10}
              title="Please enter exactly 10 digits"
            />
            {validationError && (
              <p className="text-xs text-red-500 mt-1 ml-1">
                {validationError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-yellow-500 dark:hover:bg-yellow-400 text-white dark:text-emerald-950 font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
          >
            {loading ? "Verifying..." : t.formLoginSubmit || "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-emerald-400/60">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-emerald-600 dark:text-yellow-400 font-semibold hover:underline"
          >
            {t.navRegister || "Register"}
          </a>
        </p>
      </div>
    </div>
  );
}
