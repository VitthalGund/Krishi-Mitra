"use client";

import Link from "next/link";
import { User, Sun, Moon, Menu, X, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import GoogleTranslate from "./GoogleTranslate";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-emerald-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-emerald-600 dark:bg-yellow-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
            <span className="text-white dark:text-emerald-900 font-bold">
              K
            </span>
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-emerald-600 to-green-500 dark:from-yellow-400 dark:to-yellow-200 bg-clip-text text-transparent">
            Krishi-Mitra
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 dark:text-emerald-100/80 hover:text-emerald-600 dark:hover:text-yellow-400 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-slate-600 dark:text-emerald-100/80 hover:text-emerald-600 dark:hover:text-yellow-400 transition-colors"
          >
            About
          </Link>
          {!isLoggedIn && (
            <Link
              href="/register"
              className="text-sm font-medium text-slate-600 dark:text-emerald-100/80 hover:text-emerald-600 dark:hover:text-yellow-400 transition-colors"
            >
              Register
            </Link>
          )}

          <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />

          <GoogleTranslate />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-yellow-400 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Auth Actions */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 dark:text-white hover:text-emerald-600 dark:hover:text-yellow-400 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
              <div className="w-8 h-8 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/10">
                <User className="w-4 h-4 text-slate-500 dark:text-emerald-200" />
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-bold text-white dark:text-emerald-950 bg-emerald-600 dark:bg-yellow-500 px-5 py-2.5 rounded-full hover:bg-emerald-700 dark:hover:bg-yellow-400 transition-all shadow-lg shadow-emerald-500/20 dark:shadow-yellow-500/20"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 dark:text-white"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-emerald-950 border-b border-slate-200 dark:border-white/10 p-4 space-y-4">
          <Link
            href="/"
            className="block text-slate-600 dark:text-white font-medium"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="block text-slate-600 dark:text-white font-medium"
          >
            About
          </Link>
          {!isLoggedIn && (
            <Link
              href="/register"
              className="block text-slate-600 dark:text-white font-medium"
            >
              Register
            </Link>
          )}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-slate-600 dark:text-white font-medium w-full text-left"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" /> Dark Mode
              </>
            )}
          </button>
          <div className="py-2">
            <GoogleTranslate />
          </div>
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="block text-slate-600 dark:text-white font-medium"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block text-red-500 font-medium w-full text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block text-emerald-600 dark:text-yellow-400 font-bold"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
