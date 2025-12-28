"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  Phone,
  X,
  ArrowRight,
  ShieldCheck,
  Banknote,
  Languages,
  Database,
  Lock,
  IndianRupee,
} from "lucide-react";
import { UltravoxSession, UltravoxSessionStatus } from "ultravox-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [session, setSession] = useState<UltravoxSession | null>(null);
  const [status, setStatus] = useState<UltravoxSessionStatus>(
    UltravoxSessionStatus.DISCONNECTED
  );
  const [error, setError] = useState<string | null>(null);

  // Auth State
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mobile = localStorage.getItem("krishi_user_mobile");
    if (mobile) setUserMobile(mobile);
    setLoading(false);

    return () => {
      if (session) {
        session.leaveCall();
      }
    };
  }, [session]);

  const startCall = async () => {
    if (!userMobile) {
      router.push("/register");
      return;
    }

    try {
      setStatus(UltravoxSessionStatus.CONNECTING);
      const response = await fetch("/api/ultravox/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: userMobile }),
      });

      if (!response.ok) throw new Error("Failed to create call session");
      const data = await response.json();
      const joinUrl = data.joinUrl;
      if (!joinUrl) throw new Error("No join URL received");

      const newSession = new UltravoxSession();
      setSession(newSession);

      newSession.addEventListener("status", () => {
        setStatus(newSession.status);
      });

      newSession.addEventListener("error", (err: any) => {
        console.error("Ultravox error:", err);
        setError("Call error occurred.");
      });

      await newSession.joinCall(joinUrl);
    } catch (err) {
      console.error("Failed to start call:", err);
      setError("Connection failed. Please try again.");
      setStatus(UltravoxSessionStatus.DISCONNECTED);
    }
  };

  const stopCall = async () => {
    if (session) {
      session.leaveCall();
      setSession(null);
      setStatus(UltravoxSessionStatus.DISCONNECTED);
    }
  };

  const isCallActive = status !== UltravoxSessionStatus.DISCONNECTED;
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
            {!isAuthenticated ? (
              <Link href="/register">
                <button className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-emerald-600 dark:bg-yellow-500 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 dark:focus:ring-yellow-400 hover:bg-emerald-700 dark:hover:bg-yellow-400 dark:text-emerald-950 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  {t.ctaButton}
                  <div className="absolute -inset-3 rounded-full bg-emerald-400/20 dark:bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-lg" />
                </button>
              </Link>
            ) : (
              /* Voice Interface Card */
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 dark:opacity-25 group-hover:opacity-40 dark:group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm mx-auto">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status === UltravoxSessionStatus.LISTENING
                          ? "bg-red-500 animate-pulse"
                          : "bg-emerald-500"
                      }`}
                    ></div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-emerald-400/80">
                      {status === UltravoxSessionStatus.LISTENING
                        ? "Listening..."
                        : "Ready to Help"}
                    </span>
                  </div>

                  {/* Main Button */}
                  <div className="relative flex items-center justify-center mb-6">
                    {/* Pulse Rings */}
                    {status === UltravoxSessionStatus.LISTENING && (
                      <>
                        <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                      </>
                    )}

                    <button
                      onClick={
                        status === UltravoxSessionStatus.LISTENING
                          ? stopCall
                          : startCall
                      }
                      className="w-20 h-20 rounded-full bg-emerald-600 dark:bg-yellow-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 dark:shadow-yellow-500/20 hover:scale-105 transition-transform duration-300 z-10"
                    >
                      {status === UltravoxSessionStatus.LISTENING ? (
                        <div className="w-8 h-8 bg-white dark:bg-emerald-950 rounded-md"></div>
                      ) : (
                        <Mic className="w-10 h-10 text-white dark:text-emerald-950" />
                      )}
                    </button>
                  </div>

                  <p className="text-slate-600 dark:text-emerald-100 text-sm font-medium mb-4">
                    {status === UltravoxSessionStatus.LISTENING
                      ? "I'm listening..."
                      : "Tap to speak in your language"}
                  </p>

                  {/* Trust Badges within Card */}
                  <div className="flex justify-center gap-4 border-t border-slate-100 dark:border-white/10 pt-4">
                    <div className="flex flex-col items-center gap-1">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[10px] text-slate-500 dark:text-emerald-500 uppercase">
                        {t.trustBadge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Visuals (Features) */}
          <div className="space-y-6 lg:ml-12 border-l border-slate-200 dark:border-white/5 pl-8 md:pl-12 py-4">
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

            {/* Founder Verification */}
            <div className="pt-8 mt-12 border-t border-slate-200 dark:border-white/10">
              <p className="text-xs text-slate-400 dark:text-emerald-400/60 uppercase tracking-widest font-semibold mb-2">
                Visionary
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-emerald-950 text-xs">
                  VG
                </div>
                <p className="text-sm text-slate-700 dark:text-emerald-200 font-medium">
                  {t.founderNote}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8">
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
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="group flex gap-4 items-start transition-all hover:translate-x-2 duration-300">
      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 shadow-sm dark:shadow-none group-hover:bg-emerald-50 dark:group-hover:bg-white/10 group-hover:border-emerald-200 dark:group-hover:border-yellow-500/30 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-yellow-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-emerald-200/60 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
