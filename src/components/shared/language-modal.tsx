"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/use-language-store";

export function LanguageModal() {
  const { language, setLanguage, isLanguageModalOpen, closeLanguageModal } =
    useLanguageStore();

  useEffect(() => {
    // Language selection is controlled via header button toggle
  }, []);

  if (!isLanguageModalOpen) return null;

  const handleSelectLanguage = (lang: "en" | "hi") => {
    setLanguage(lang);
    sessionStorage.setItem("visited_language", "true");
    closeLanguageModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md transition-opacity duration-300">
      <div className="glass-card max-w-md w-[90%] p-8 rounded-2xl shadow-2xl text-center border border-white/30">
        <h2 className="font-display text-2xl font-semibold text-[#0050cb] mb-2">
          Welcome to Arti Air Con
        </h2>
        <p className="font-sans text-sm text-[#424656] mb-8">
          Please select your preferred language to continue
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSelectLanguage("en")}
            className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
              language === "en"
                ? "border-[#0050cb] bg-[#dae1ff]/30 font-bold"
                : "border-[#c2c6d8] hover:border-[#0050cb] hover:bg-[#dae1ff]/20"
            }`}
          >
            <span className="text-2xl font-bold mb-2 text-[#191c1e]">English</span>
            <span className="text-xs text-[#424656]">Continue in English</span>
          </button>
          <button
            onClick={() => handleSelectLanguage("hi")}
            className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
              language === "hi"
                ? "border-[#0050cb] bg-[#dae1ff]/30 font-bold"
                : "border-[#c2c6d8] hover:border-[#0050cb] hover:bg-[#dae1ff]/20"
            }`}
          >
            <span className="text-2xl font-bold mb-2 text-[#191c1e]">हिन्दी</span>
            <span className="text-xs text-[#424656]">हिंदी में जारी रखें</span>
          </button>
        </div>
      </div>
    </div>
  );
}
