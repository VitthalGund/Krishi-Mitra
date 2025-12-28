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
} from "lucide-react";
import { UltravoxSession, UltravoxSessionStatus } from "ultravox-client";
import { useRouter } from "next/navigation";
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

  const endCall = async () => {
    if (session) {
      session.leaveCall();
      setSession(null);
    }
  };

  const isCallActive = status !== UltravoxSessionStatus.DISCONNECTED;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-black font-sans text-white selection:bg-yellow-400 selection:text-emerald-900 overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/50 border border-emerald-600/50 text-emerald-300 text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI-Powered • 24/7 Support
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              {t.heroTitle}
            </h1>

            <p className="text-xl text-emerald-200/80 leading-relaxed max-w-lg">
              {t.heroSubtitle}
            </p>

            {!userMobile ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push("/register")}
                  className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  {t.ctaStart}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              // Voice Interface Card (Glassmorphism)
              <div className="backdrop-blur-xl bg-white/5 p-1 rounded-3xl shadow-2xl border border-white/10 max-w-md relative group">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                <div className="relative bg-emerald-950/80 rounded-[1.4rem] p-8 border border-white/5">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide">
                        AI Loan Assistant
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCallActive
                              ? "bg-red-500 animate-pulse"
                              : "bg-emerald-400"
                          }`}
                        ></div>
                        <span className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">
                          {isCallActive ? t.voiceLive : "Online"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <Languages className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4">
                    {/* Pulse Ring Animation */}
                    <div className="relative mb-8 group-hover:scale-105 transition-transform duration-500">
                      {isCallActive && (
                        <div className="absolute -inset-4 bg-emerald-500/30 rounded-full animate-ping"></div>
                      )}
                      <div
                        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 border-4 
                                        ${
                                          isCallActive
                                            ? "bg-emerald-800 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                                            : "bg-white/10 border-white/10 hover:border-yellow-400/50 hover:bg-white/20"
                                        }`}
                      >
                        {isCallActive ? (
                          <Mic className="w-10 h-10 text-white animate-pulse" />
                        ) : (
                          <Phone className="w-10 h-10 text-emerald-300 group-hover:text-yellow-400 transition-colors" />
                        )}
                      </div>
                    </div>

                    <p className="text-center text-emerald-200/80 font-medium mb-8 h-6">
                      {status === UltravoxSessionStatus.CONNECTING
                        ? t.voiceConnecting
                        : isCallActive
                        ? t.voiceListening
                        : t.voiceReady}
                    </p>

                    {error && (
                      <div className="mb-4 text-xs font-medium text-red-300 bg-red-900/30 px-4 py-2 rounded-lg border border-red-500/30">
                        {error}
                      </div>
                    )}

                    {!isCallActive ? (
                      <button
                        onClick={startCall}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-3 border border-emerald-500/30"
                      >
                        <Mic className="w-5 h-5" />
                        {t.ctaButton}
                      </button>
                    ) : (
                      <button
                        onClick={endCall}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold py-4 rounded-xl border border-red-500/30 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                      >
                        <X className="w-5 h-5" />
                        End Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Visuals (Features) */}
          <div className="space-y-6 lg:ml-12 border-l border-white/5 pl-8 md:pl-12 py-4">
            <FeatureRow
              icon={<ShieldCheck className="w-6 h-6 text-yellow-500" />}
              title={t.featureGovt}
              desc={t.featureGovtDesc}
            />
            <FeatureRow
              icon={<Banknote className="w-6 h-6 text-emerald-400" />}
              title={t.featureInstant}
              desc={t.featureInstantDesc}
            />
            <FeatureRow
              icon={<Languages className="w-6 h-6 text-blue-400" />}
              title={t.featureVoice}
              desc={t.featureVoiceDesc}
            />

            {/* Founder Verification */}
            <div className="pt-8 mt-12 border-t border-white/10">
              <p className="text-xs text-emerald-400/60 uppercase tracking-widest font-semibold mb-2">
                Visionary
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-emerald-950 text-xs">
                  VG
                </div>
                <p className="text-sm text-emerald-200 font-medium">
                  {t.founderNote}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badge Bar */}
        <div className="mt-24 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 text-center opacity-70">
          <div className="flex items-center justify-center gap-2 text-emerald-300/60 text-sm font-semibold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>{" "}
            {t.trustAgriStack}
          </div>
          <div className="flex items-center justify-center gap-2 text-emerald-300/60 text-sm font-semibold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>{" "}
            {t.trustAadhaar}
          </div>
          <div className="flex items-center justify-center gap-2 text-emerald-300/60 text-sm font-semibold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>{" "}
            {t.trustDigital}
          </div>
        </div>
      </main>
    </div>
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
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 group-hover:border-yellow-500/30 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg text-white group-hover:text-yellow-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-emerald-200/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
