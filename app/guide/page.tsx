import { Smartphone, Mic, Banknote, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Guide() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h1>
          <p className="text-xl text-slate-600">
            Get your loan approved in 3 simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 -z-10"></div>

          <StepCard
            number="1"
            icon={<Smartphone className="w-10 h-10 text-white" />}
            title="Register Mobile"
            desc="Enter your name and mobile number. Select your preferred language (Hindi, Marathi, etc)."
          />
          <StepCard
            number="2"
            icon={<Mic className="w-10 h-10 text-white" />}
            title="Talk to Krishi Mitra"
            desc="Click the microphone button. Tell our AI agent about your crop and how much loan you need."
          />
          <StepCard
            number="3"
            icon={<Banknote className="w-10 h-10 text-white" />}
            title="Instant Credit"
            desc="Your application is instantly verified against AgriStack. Money is disbursed to your bank."
          />
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            Start Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  desc,
}: {
  number: string;
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl relative text-center">
      <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6 relative z-10">
        {icon}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">
          {number}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
