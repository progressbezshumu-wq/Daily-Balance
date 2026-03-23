import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppLanguage = "en" | "de" | "uk";
export type Currency = "EUR" | "USD" | "UAH";

type SettingsState = {
  language: AppLanguage | null;
  isReady: boolean;
  displayCurrency: Currency;

  loadLanguage: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;

  setDisplayCurrency: (currency: Currency) => void;
};

const LANGUAGE_KEY = "dailybalance.language";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: null,
      isReady: false,
      displayCurrency: "EUR",

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

      setDisplayCurrency: (currency) => {
        set({ displayCurrency: currency });
      },
    }),
    {
      name: "daily-balance-settings-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        displayCurrency: state.displayCurrency,
      }),
    }
  )
);
