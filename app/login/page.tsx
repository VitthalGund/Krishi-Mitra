"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, Lock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Login() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Reuse register endpoint for demo login check
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Returning User",
          mobileNumber,
        }),
      });

      const data = await res.json();

      if (data.user) {
        localStorage.setItem("krishi_user_mobile", data.user.mobileNumber);
        localStorage.setItem("krishi_user_name", data.user.name);
        router.push("/");
      } else {
        setError("Login failed. Please register.");
      }
    } catch (err) {
      setError("Connection failed.");
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
            {t.loginTitle}
          </h1>
          <p className="text-slate-500 dark:text-emerald-200/70">
            {t.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="text-red-500 dark:text-red-300 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg text-center mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-emerald-200/80 mb-2">
              {t.formMobile}
            </label>
            <input
              type="tel"
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="e.g. 9876543210"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-yellow-500 dark:hover:bg-yellow-400 text-white dark:text-emerald-950 font-bold py-4 rounded-xl shadow-lg transition-all"
          >
            {loading ? "Verifying..." : t.formLoginSubmit}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-emerald-400/60">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-emerald-600 dark:text-yellow-400 font-semibold hover:underline"
          >
            {t.navRegister}
          </a>
        </p>
      </div>
    </div>
  );
}
