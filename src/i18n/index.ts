import type { AppLanguage } from "../store/settingsStore";
import { translations } from "./translations";

export type TranslationKey = keyof typeof translations.en;

export function t(language: AppLanguage, key: TranslationKey): string {
  return translations[language][key];
}
