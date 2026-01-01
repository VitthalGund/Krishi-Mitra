"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Banknote,
  Languages,
  Database,
  Lock,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mobile = localStorage.getItem("krishi_user_mobile");
    if (mobile) setUserMobile(mobile);
    setLoading(false);
  }, []);

  const isAuthenticated = !!userMobile;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-emerald-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10"></div>
          {/* Gradient Blobs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100 dark:bg-emerald-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-100 dark:bg-teal-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium tracking-wide">
              AI-Powered Kisan Credit
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-xl text-slate-600 dark:text-emerald-100/80 max-w-2xl mx-auto mb-12 font-medium">
            {t.heroSubtitle}
          </p>

          {/* Dynamic Action Area */}
          <div className="flex flex-col items-center justify-center gap-8">
            <Link href={isAuthenticated ? "/apply" : "/register"}>
              <button className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-emerald-600 dark:bg-yellow-500 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 dark:focus:ring-yellow-400 hover:bg-emerald-700 dark:hover:bg-yellow-400 dark:text-emerald-950 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 gap-2">
                {isAuthenticated ? "Apply for Loan" : t.ctaButton}
                <ArrowRight className="w-5 h-5" />
                <div className="absolute -inset-3 rounded-full bg-emerald-400/20 dark:bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-lg" />
              </button>
            </Link>

            {isAuthenticated && (
              <p className="text-sm text-slate-500 dark:text-emerald-300">
                Welcome back! Continue your application.
              </p>
            )}
          </div>

          {/* Right Visuals (Features) */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            <FeatureRow
              icon={<ShieldCheck className="w-6 h-6 text-yellow-500" />}
              title={t.featureGovt}
              desc={t.featureGovtDesc}
            />
            <FeatureRow
              icon={
                <Banknote className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              }
              title={t.featureInstant}
              desc={t.featureInstantDesc}
            />
            <FeatureRow
              icon={
                <Languages className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              }
              title={t.featureVoice}
              desc={t.featureVoiceDesc}
            />
          </div>

          {/* Founder Verification */}
          <div className="pt-8 mt-12 border-t border-slate-200 dark:border-white/10 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-emerald-950 text-xs">
                VG
              </div>
              <p className="text-sm text-slate-700 dark:text-emerald-200 font-medium">
                {t.founderNote}
              </p>
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Database, label: "AgriStack Integrated" },
            { icon: Lock, label: "Aadhaar Verified" },
            { icon: IndianRupee, label: "100% Digital Process" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-slate-100 dark:bg-white/5 text-emerald-600 dark:text-emerald-400">
                <item.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-emerald-100">
                {t[item.label as keyof typeof t] || item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm font-medium text-slate-400 dark:text-emerald-500/60 uppercase tracking-widest mb-2">
            Built for Bharat
          </p>
          <p className="text-slate-500 dark:text-emerald-400/80 font-medium">
            By Vitthal Gund, IIT Bombay
          </p>
        </div>
      </section>
    </main>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group flex gap-4 items-start p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl transition-all duration-300">
      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm dark:shadow-none group-hover:bg-emerald-50 dark:group-hover:bg-white/10 group-hover:border-emerald-200 dark:group-hover:border-yellow-500/30 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-yellow-400 transition-colors mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-emerald-200/60 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
