"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            layout?: any; // google.translate.TranslateElement.InlineLayout.HORIZONTAL
            autoDisplay?: boolean;
            includedLanguages?: string;
          },
          elementId: string
        ) => void;
        InlineLayout: {
          HORIZONTAL: any;
          SIMPLE: any;
          VERTICAL: any;
        };
      };
    };
  }
}

const useGoogleTranslate = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Prevent duplicate injection
    if (typeof window !== "undefined" && !window.googleTranslateElementInit) {
      // Define the callback function that Google Translate API will execute
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,mr,gu,ta,te,bn,kn,ml,pa", // Common Indian languages
            layout: window.google.translate.InlineLayout.HORIZONTAL,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };

      // Create and append the script
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      // Already loaded
      setIsScriptLoaded(true);
    }
  }, []);

  return isScriptLoaded;
};

export default useGoogleTranslate;
