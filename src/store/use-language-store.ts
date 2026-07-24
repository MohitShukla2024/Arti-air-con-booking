import { create } from "zustand";

interface LanguageState {
  language: "en" | "hi";
  isLanguageModalOpen: boolean;
  setLanguage: (lang: "en" | "hi") => void;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",
  isLanguageModalOpen: false,
  setLanguage: (lang) => set({ language: lang, isLanguageModalOpen: false }),
  openLanguageModal: () => set({ isLanguageModalOpen: true }),
  closeLanguageModal: () => set({ isLanguageModalOpen: false }),
}));
