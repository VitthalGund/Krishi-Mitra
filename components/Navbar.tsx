"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sprout, Menu, X, User, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // effective way to update state based on localStorage changes if they happen in other tabs/windows
    // or just on mount. For same-page updates, we might need a custom event or context,
    // but for simple navigation flow this useEffect on mount is usually enough.
    // To grab updates after login/register immediately, those pages redirect, triggering a mount here.
    const name = localStorage.getItem("krishi_user_name");
    setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("krishi_user_mobile");
    localStorage.removeItem("krishi_user_name");
    setUserName(null);
    router.push("/");
    router.refresh(); // Refresh to update server components if any
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                Krishi Mitra
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/guide"
              className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/contact"
              className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
            >
              Contact
            </Link>

            {userName ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-2 text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4" />
                  <span>{userName.split(" ")[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-emerald-600 font-semibold hover:text-emerald-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-emerald-500/30"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-emerald-600 p-2"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
            >
              About
            </Link>
            <Link
              href="/guide"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
            >
              How It Works
            </Link>

            <div className="border-t border-slate-100 my-2 pt-2">
              {userName ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2 text-emerald-700 font-medium">
                    <User className="w-5 h-5" />
                    Welcome, {userName}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-500 font-medium hover:bg-red-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 px-3 mt-4">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center py-2.5 border border-emerald-600 text-emerald-600 font-semibold rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center py-2.5 bg-emerald-600 text-white font-semibold rounded-xl shadow-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
