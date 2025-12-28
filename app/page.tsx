"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  Phone,
  X,
  User,
  ArrowRight,
  ShieldCheck,
  Banknote,
  Languages,
  Sprout,
} from "lucide-react";
import { UltravoxSession, UltravoxSessionStatus } from "ultravox-client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<UltravoxSession | null>(null);
  const [status, setStatus] = useState<UltravoxSessionStatus>(
    UltravoxSessionStatus.DISCONNECTED
  );
  const [error, setError] = useState<string | null>(null);

  // Auth State
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mobile = localStorage.getItem("krishi_user_mobile");
    const name = localStorage.getItem("krishi_user_name");

    if (mobile) {
      setUserMobile(mobile);
      setUserName(name);
    }
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

  const handleLogout = () => {
    localStorage.removeItem("krishi_user_mobile");
    localStorage.removeItem("krishi_user_name");
    setUserMobile(null);
    setUserName(null);
  };

  const isCallActive = status !== UltravoxSessionStatus.DISCONNECTED;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                Krishi Mitra
              </span>
            </div>

            {userMobile ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-700">
                    {userName}
                  </span>
                  <span className="text-xs text-slate-500">
                    Verified Farmer
                  </span>
                </div>
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-200">
                  {userName ? userName[0] : "F"}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/register")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
              >
                Register
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI-Powered Loan Processing
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Instant Funds for <br />
              <span className="text-gradient">Indian Agriculture</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Access government loans in seconds. Speak to our AI assistant in
              Hindi, Marathi, or Tamil and get instant approval without
              paperwork.
            </p>

            {!userMobile ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push("/register")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
                >
                  Start Your Application
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200">
                  Learn How it Works
                </button>
              </div>
            ) : (
              // Voice Interface Card (Only for logged in users)
              <div className="bg-white p-1 rounded-3xl shadow-2xl shadow-emerald-500/20 border border-slate-100 max-w-md">
                <div className="bg-slate-50 rounded-[1.4rem] p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        Loan Assistant
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCallActive
                              ? "bg-green-500 animate-pulse"
                              : "bg-slate-300"
                          }`}
                        ></div>
                        <span className="text-xs font-medium text-slate-500">
                          {isCallActive ? "Live Session" : "Ready to help"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                      <Languages className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center py-8">
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 mb-6 relative
                                    ${
                                      isCallActive
                                        ? "bg-emerald-50 shadow-emerald-500/20 shadow-lg scale-110"
                                        : "bg-white shadow-sm border border-slate-100"
                                    }
                                `}
                    >
                      {isCallActive && (
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-20"></div>
                      )}
                      {isCallActive ? (
                        <Mic className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <Phone className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    <p className="text-center text-slate-600 font-medium mb-8">
                      {status === UltravoxSessionStatus.CONNECTING
                        ? "Connecting securely..."
                        : isCallActive
                        ? "Listening (Hindi/Marathi/English)..."
                        : "Tap below to speak with an expert"}
                    </p>

                    {error && (
                      <div className="mb-4 text-xs font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        {error}
                      </div>
                    )}

                    {!isCallActive ? (
                      <button
                        onClick={startCall}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
                      >
                        <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Speak to Loan Officer
                      </button>
                    ) : (
                      <button
                        onClick={endCall}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:ml-12">
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
              title="Government Backed"
              desc="Authorized by Agri-Ministry for secure data handling."
            />
            <FeatureCard
              icon={<Banknote className="w-6 h-6 text-blue-600" />}
              title="Instant Disbursal"
              desc="Money transferred directly to your bank account."
            />
            <FeatureCard
              icon={<Languages className="w-6 h-6 text-orange-600" />}
              title="Multilingual AI"
              desc="Talk in your mother tongue. No English needed."
            />
            <FeatureCard
              icon={<User className="w-6 h-6 text-purple-600" />}
              title="Verified Identity"
              desc="Secure implementation with UIDAI standards."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-100 transition-all">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
