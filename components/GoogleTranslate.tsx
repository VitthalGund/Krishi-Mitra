"use client";

import React, { useState, useEffect } from "react";
import useGoogleTranslate from "@/hooks/useGoogleTranslate";
import { Globe } from "lucide-react";

export default function GoogleTranslate() {
  useGoogleTranslate();
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Handle language change by bridging to Google's hidden UI
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);

    // Find the Google Translate hidden select element
    const googleSelect = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement;

    if (googleSelect) {
      googleSelect.value = newLang;
      // Dispatch change event to trigger Google Translate
      googleSelect.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Hidden google translate element container required by the script */}
      <div
        id="google_translate_element"
        className="absolute top-0 left-0 w-0 h-0 overflow-hidden"
        style={{ display: "none" }} // Hide the default Google UI
      />

      {/* Custom Dropdown UI */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 px-3 py-2 rounded-full border border-slate-200 dark:border-white/10">
        <Globe className="w-4 h-4 text-slate-500 dark:text-emerald-200" />
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 dark:text-emerald-100 cursor-pointer appearance-none min-w-[80px]"
        >
          <option value="en" className="bg-white dark:bg-emerald-950">
            English
          </option>
          <option value="hi" className="bg-white dark:bg-emerald-950">
            Hindi (हिंदी)
          </option>
          <option value="mr" className="bg-white dark:bg-emerald-950">
            Marathi (मराठी)
          </option>
          <option value="gu" className="bg-white dark:bg-emerald-950">
            Gujarati (ગુજરાતી)
          </option>
          <option value="ta" className="bg-white dark:bg-emerald-950">
            Tamil (தமிழ்)
          </option>
          <option value="te" className="bg-white dark:bg-emerald-950">
            Telugu (తెలుగు)
          </option>
          <option value="bn" className="bg-white dark:bg-emerald-950">
            Bengali (বাংলা)
          </option>
          <option value="kn" className="bg-white dark:bg-emerald-950">
            Kannada (ಕನ್ನಡ)
          </option>
          <option value="ml" className="bg-white dark:bg-emerald-950">
            Malayalam (മലയാളം)
          </option>
          <option value="pa" className="bg-white dark:bg-emerald-950">
            Punjabi (ਪੰਜਾਬੀ)
          </option>
        </select>
        {/* Custom arrow icon could go here if appearance-none removes it */}
      </div>
    </div>
  );
}
