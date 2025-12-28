"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sprout, Menu, X, User, LogOut, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("krishi_user_name");
    setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("krishi_user_mobile");
    localStorage.removeItem("krishi_user_name");
    setUserName(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed w-full z-50 bg-emerald-900/90 backdrop-blur-md border-b border-emerald-800 shadow-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-emerald-800 p-2.5 rounded-xl border border-emerald-700 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Sprout className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-white tracking-wide">
                Krishi-Mitra
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-emerald-100/80 hover:text-yellow-400 font-medium transition-colors tracking-wide text-sm"
            >
              {t.navHome}
            </Link>
            <Link
              href="/about"
              className="text-emerald-100/80 hover:text-yellow-400 font-medium transition-colors tracking-wide text-sm"
            >
              {t.navAbout}
            </Link>
            <Link
              href="/guide"
              className="text-emerald-100/80 hover:text-yellow-400 font-medium transition-colors tracking-wide text-sm"
            >
              {t.navGuide}
            </Link>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 text-emerald-100 hover:text-white bg-emerald-800/50 px-3 py-1.5 rounded-full border border-emerald-700 hover:border-emerald-500 transition-all text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase">{language}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute top-full mt-2 right-0 w-32 bg-emerald-900 border border-emerald-700 rounded-xl shadow-xl overflow-hidden py-1">
                  <button
                    onClick={() => {
                      setLanguage("en");
                      setLangMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-emerald-100 hover:bg-emerald-800 hover:text-yellow-400 text-sm"
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("hi");
                      setLangMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-emerald-100 hover:bg-emerald-800 hover:text-yellow-400 text-sm"
                  >
                    Hindi (हिंदी)
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("mr");
                      setLangMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-emerald-100 hover:bg-emerald-800 hover:text-yellow-400 text-sm"
                  >
                    Marathi (मराठी)
                  </button>
                </div>
              )}
            </div>

            {userName ? (
              <div className="flex items-center gap-4 pl-4 border-l border-emerald-800">
                <div className="flex items-center gap-2 text-yellow-400 font-medium bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-800">
                  <User className="w-4 h-4" />
                  <span>{userName.split(" ")[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-emerald-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-emerald-100 font-medium hover:text-white transition-colors text-sm"
                >
                  {t.navLogin}
                </Link>
                <Link
                  href="/register"
                  className="bg-yellow-500 hover:bg-yellow-400 text-emerald-900 px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-yellow-500/20 text-sm transform hover:-translate-y-0.5"
                >
                  {t.navRegister}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-4">
            {/* Mobile Lang Switch */}
            <button
              onClick={() => {
                const next =
                  language === "en" ? "hi" : language === "hi" ? "mr" : "en";
                setLanguage(next);
              }}
              className="text-emerald-100 font-bold text-sm bg-emerald-800 px-2 py-1 rounded-md"
            >
              {language.toUpperCase()}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-emerald-100 hover:text-white p-2"
            >
              {isOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-800">
          <div className="px-4 pt-4 pb-8 space-y-3">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-100 hover:bg-emerald-800 hover:text-yellow-400"
            >
              {t.navHome}
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-100 hover:bg-emerald-800 hover:text-yellow-400"
            >
              {t.navAbout}
            </Link>
            <Link
              href="/guide"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-100 hover:bg-emerald-800 hover:text-yellow-400"
            >
              {t.navGuide}
            </Link>

            <div className="border-t border-emerald-800 my-4 pt-4">
              {userName ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2 text-yellow-400 font-medium">
                    <User className="w-5 h-5" />
                    {t.welcome}, {userName}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-400 font-medium hover:bg-emerald-800 rounded-lg"
                  >
                    {t.navLogout}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 px-3 mt-4">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center py-3 border border-emerald-700 text-emerald-100 font-semibold rounded-xl hover:bg-emerald-800"
                  >
                    {t.navLogin}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center py-3 bg-yellow-500 text-emerald-950 font-bold rounded-xl shadow-md hover:bg-yellow-400"
                  >
                    {t.navRegister}
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
