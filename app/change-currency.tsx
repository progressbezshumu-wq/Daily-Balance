import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Currency, AppLanguage } from "../src/store/settingsStore";
import { useSettingsStore } from "../src/store/settingsStore";
import { SUPPORTED_CURRENCIES } from "../src/utils/currency";

const currencyFlags: Record<Currency, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  JPY: "🇯🇵",
  GBP: "🇬🇧",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  SEK: "🇸🇪",
  NOK: "🇳🇴",
  DKK: "🇩🇰",
  PLN: "🇵🇱",
  CZK: "🇨🇿",
  HUF: "🇭🇺",
  RON: "🇷🇴",
  BGN: "🇧🇬",
  TRY: "🇹🇷",
  UAH: "🇺🇦",
  RUB: "🇷🇺",
  INR: "🇮🇳",
  BRL: "🇧🇷",
  MXN: "🇲🇽",
  ARS: "🇦🇷",
  CLP: "🇨🇱",
  COP: "🇨🇴",
  PEN: "🇵🇪",
  ZAR: "🇿🇦",
  EGP: "🇪🇬",
  MAD: "🇲🇦",
  NGN: "🇳🇬",
  KES: "🇰🇪",
  GHS: "🇬🇭",
  AED: "🇦🇪",
  SAR: "🇸🇦",
  QAR: "🇶🇦",
  KWD: "🇰🇼",
  BHD: "🇧🇭",
  OMR: "🇴🇲",
  ILS: "🇮🇱",
  SGD: "🇸🇬",
  HKD: "🇭🇰",
  KRW: "🇰🇷",
  TWD: "🇹🇼",
  THB: "🇹🇭",
  MYR: "🇲🇾",
  IDR: "🇮🇩",
  PHP: "🇵🇭",
  VND: "🇻🇳",
  PKR: "🇵🇰",
};

function getScreenTitle(language: AppLanguage) {
  if (language === "de") return "Währung wählen";
  if (language === "uk") return "Обрати валюту";
  return "Choose currency";
}

function getSearchPlaceholder(language: AppLanguage) {
  if (language === "de") return "Währung suchen";
  if (language === "uk") return "Пошук валюти";
  return "Search currency";
}

export default function ChangeCurrencyScreen() {
  const language = useSettingsStore((state) => (state.language ?? "en") as AppLanguage);
  const displayCurrency = useSettingsStore((state) => state.displayCurrency);
  const setDisplayCurrency = useSettingsStore((state) => state.setDisplayCurrency);
  const [query, setQuery] = useState("");

  const filteredCurrencies = useMemo(() => {
    const value = query.trim().toUpperCase();
    if (!value) return [...SUPPORTED_CURRENCIES];
    return SUPPORTED_CURRENCIES.filter((currency) => currency.includes(value));
  }, [query]);

  const handleSelect = (currency: Currency) => {
    setDisplayCurrency(currency);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{getScreenTitle(language)}</Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={getSearchPlaceholder(language)}
          placeholderTextColor="#98a2b3"
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredCurrencies.map((currency) => {
            const selected = currency === displayCurrency;

            return (
              <Pressable
                key={currency}
                onPress={() => handleSelect(currency)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.flag}>{currencyFlags[currency]}</Text>
                  <Text style={styles.optionText}>{currency}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1c2230",
    color: "white",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  option: {
    backgroundColor: "#1c2230",
    borderRadius: 16,
    marginBottom: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionSelected: {
    backgroundColor: "#2f6fed",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  optionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
