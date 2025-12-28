"use client";

import { useState, useEffect } from "react";
import { Mic, Phone, X } from "lucide-react";
import { UltravoxSession, UltravoxSessionStatus } from "ultravox-client";

// Placeholder - Replace with actual Join URL from Ultravox
const JOIN_URL = "YOUR_ULTRAVOX_JOIN_URL_HERE";

export default function Home() {
  const [session, setSession] = useState<UltravoxSession | null>(null);
  const [status, setStatus] = useState<UltravoxSessionStatus>(
    UltravoxSessionStatus.DISCONNECTED
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (session) {
        session.leaveCall();
      }
    };
  }, [session]);

  const startCall = async () => {
    if (!JOIN_URL || JOIN_URL === "YOUR_ULTRAVOX_JOIN_URL_HERE") {
      setError("Please configure the JOIN_URL in app/page.tsx");
      return;
    }

    try {
      const newSession = new UltravoxSession();
      setSession(newSession);

      // Register listeners
      newSession.addEventListener("status", () => {
        setStatus(newSession.status);
      });

      newSession.addEventListener("error", (err: any) => {
        console.error("Ultravox error:", err);
        setError("Call error occurred.");
      });

      // Join the call
      await newSession.joinCall(JOIN_URL);
    } catch (err) {
      console.error("Failed to start call:", err);
      setError("Failed to connect to the agent.");
    }
  };

  const endCall = async () => {
    if (session) {
      session.leaveCall();
      setSession(null);
    }
  };

  const isCallActive =
    status === UltravoxSessionStatus.CONNECTING ||
    status === UltravoxSessionStatus.CONNECTED;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
        <div className="bg-green-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Krishi Mitra</h1>
          <p className="text-green-100 mt-1">Your AI Loan Assistant</p>
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className="mb-8 relative">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                status === UltravoxSessionStatus.CONNECTED
                  ? "bg-green-100 animate-pulse border-4 border-green-400"
                  : "bg-gray-50 border-4 border-gray-100"
              }`}
            >
              {isCallActive ? (
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  {/* Abstract waveform or animation could go here */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mic className="w-12 h-12 text-green-600" />
                  </div>
                </div>
              ) : (
                <Phone className="w-12 h-12 text-gray-400" />
              )}
            </div>
            {status === UltravoxSessionStatus.CONNECTED && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                Live
              </div>
            )}
          </div>

          <div className="text-center mb-8 h-8">
            {error ? (
              <p className="text-red-500 font-medium">{error}</p>
            ) : (
              <p className="text-gray-500 font-medium">
                {status === UltravoxSessionStatus.DISCONNECTED
                  ? "Tap to talk to your loan officer"
                  : status === UltravoxSessionStatus.CONNECTING
                  ? "Connecting..."
                  : "Listening..."}
              </p>
            )}
          </div>

          {!isCallActive ? (
            <button
              onClick={startCall}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3"
            >
              <Mic className="w-6 h-6" />
              Speak to Loan Officer
            </button>
          ) : (
            <button
              onClick={endCall}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3"
            >
              <X className="w-6 h-6" />
              End Call
            </button>
          )}

          <p className="mt-6 text-xs text-gray-400 text-center">
            Powered by Ultravox AI & Krishi-Mitra Platform
          </p>
        </div>
      </div>
    </main>
  );
}
