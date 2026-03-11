import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type AppLanguage = "en" | "de" | "uk";

type SettingsState = {
  language: AppLanguage | null;
  isReady: boolean;
  loadLanguage: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
};

const LANGUAGE_KEY = "dailybalance.language";

export const useSettingsStore = create<SettingsState>((set) => ({
  language: null,
  isReady: false,

  loadLanguage: async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);

      if (saved === "en" || saved === "de" || saved === "uk") {
        set({ language: saved, isReady: true });
        return;
      }

      set({ language: null, isReady: true });
    } catch {
      set({ language: null, isReady: true });
    }
  },

  setLanguage: async (language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch {}

    set({ language });
  },
}));
