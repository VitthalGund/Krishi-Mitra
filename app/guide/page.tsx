import { Mic, FileText, IndianRupee, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Guide() {
  return (
    <div className="min-h-screen bg-white dark:bg-emerald-950 font-sans pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <span className="text-emerald-600 dark:text-yellow-400 font-bold uppercase tracking-wider text-sm mb-2 block">
          How It Works
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-16">
          Get a Loan in 3 Simple Steps
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-linear-to-r from-emerald-200 via-emerald-400 to-emerald-200 dark:from-emerald-800 dark:to-emerald-800 z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-24 h-24 bg-white dark:bg-emerald-900 border-4 border-emerald-100 dark:border-emerald-700 rounded-full flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
              <Mic className="w-10 h-10 text-emerald-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
              1. Speak
            </h3>
            <p className="text-slate-500 dark:text-emerald-200 max-w-xs">
              Tap the microphone button and tell us what you need. <br />
              &quot;I need a crop loan for Sugarcane.&quot;
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-24 h-24 bg-white dark:bg-emerald-900 border-4 border-emerald-100 dark:border-emerald-700 rounded-full flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
              <FileText className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
              2. Auto-Fill
            </h3>
            <p className="text-slate-500 dark:text-emerald-200 max-w-xs">
              Our AI listens and fills the application form for you. No typing
              needed.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-24 h-24 bg-white dark:bg-emerald-900 border-4 border-emerald-100 dark:border-emerald-700 rounded-full flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
              <IndianRupee className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
              3. Receive
            </h3>
            <p className="text-slate-500 dark:text-emerald-200 max-w-xs">
              Submit the form and get approval from partner banks in minutes.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-emerald-600 dark:bg-yellow-500 text-white dark:text-emerald-950 px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 dark:hover:bg-yellow-400 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
            Start Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
