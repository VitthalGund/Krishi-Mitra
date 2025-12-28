import { Sprout } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Krishi Mitra</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6">
              Empowering Indian farmers with instant, voice-first financial
              access. Bridging the gap between the field and the bank.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                X
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                in
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6">
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="/"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/guide"
                  className="hover:text-emerald-400 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Register as Farmer
                </a>
              </li>
            </ul>
          </div>

          {/* Govt Integrations & Trust */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6">
              Integrations
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <span className="block text-white font-medium">
                    AgriStack Compatible
                  </span>
                  <span className="text-xs text-slate-500">
                    Seamless land record verification
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <span className="block text-white font-medium">
                    Digital India
                  </span>
                  <span className="text-xs text-slate-500">
                    Aadhaar & UPI Integrated
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-orange-500"></div>
                <div>
                  <span className="block text-white font-medium">
                    KCC Scheme
                  </span>
                  <span className="text-xs text-slate-500">
                    Kisan Credit Card Support
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© 2025 Krishi-Mitra Platform. Built for AI India Summit.</p>
        </div>
      </div>
    </footer>
  );
}
