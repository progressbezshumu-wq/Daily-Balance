import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, router } from "expo-router";
import { useFinanceStore } from "../src/store/financeStore";
import { useSettingsStore } from "../src/store/settingsStore";

type AssetCategory = "stock" | "etf" | "crypto" | "staking" | "deposit" | "cash";
type Currency = "EUR" | "USD" | "UAH";

const BG = "#050816";
const CARD = "rgba(15,23,42,0.82)";
const BORDER = "rgba(148,163,184,0.18)";
const TEXT = "#E2E8F0";
const MUTED = "#94A3B8";
const ACCENT = "#3B82F6";

const categories: AssetCategory[] = ["stock", "etf", "crypto", "staking", "deposit", "cash"];
const currencies: Currency[] = ["EUR", "USD", "UAH"];

export default function AddAssetScreen() {
  const addAsset = useFinanceStore((state: any) => state.addAsset);
  const language = useSettingsStore((state: any) => state.language) ?? "en";
  const displayCurrency = useSettingsStore((state: any) => state.displayCurrency) ?? "EUR";

  const [category, setCategory] = useState<AssetCategory>("stock");
  const [currency, setCurrency] = useState<Currency>(displayCurrency);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [rate, setRate] = useState("");

  const t = useMemo(() => {
    if (language === "uk") {
      return {
        title: "Додати актив",
        subtitle: "Новий актив",
        category: "Категорія",
        symbol: "Символ",
        name: "Назва",
        quantity: "Кількість",
        buyPrice: "Ціна купівлі",
        currentPrice: "Поточна ціна",
        rate: "Річна ставка, %",
        currency: "Валюта",
        save: "Зберегти",
        back: "Назад",
        fillRequired: "Заповни обовʼязкові поля",
        invalidNumber: "Перевір числові значення",
        success: "Актив додано",
        stock: "Акції",
        etf: "ETF",
        crypto: "Крипто",
        staking: "Стейкінг",
        deposit: "Депозит",
        cash: "Готівка",
      };
    }

    if (language === "de") {
      return {
        title: "Asset hinzufügen",
        subtitle: "Neues Asset",
        category: "Kategorie",
        symbol: "Symbol",
        name: "Name",
        quantity: "Menge",
        buyPrice: "Kaufpreis",
        currentPrice: "Aktueller Preis",
        rate: "Jahresrate, %",
        currency: "Währung",
        save: "Speichern",
        back: "Zurück",
        fillRequired: "Pflichtfelder ausfüllen",
        invalidNumber: "Numerische Werte prüfen",
        success: "Asset hinzugefügt",
        stock: "Aktien",
        etf: "ETF",
        crypto: "Krypto",
        staking: "Staking",
        deposit: "Einlage",
        cash: "Bargeld",
      };
    }

    return {
      title: "Add Asset",
      subtitle: "New asset",
      category: "Category",
      symbol: "Symbol",
      name: "Name",
      quantity: "Quantity",
      buyPrice: "Buy Price",
      currentPrice: "Current Price",
      rate: "Annual Rate, %",
      currency: "Currency",
      save: "Save",
      back: "Back",
      fillRequired: "Fill required fields",
      invalidNumber: "Check numeric values",
      success: "Asset added",
      stock: "Stocks",
      etf: "ETF",
      crypto: "Crypto",
      staking: "Staking",
      deposit: "Deposit",
      cash: "Cash",
    };
  }, [language]);

  const parseNumber = (value: string) => {
    const n = Number(String(value).replace(",", ".").trim());
    return Number.isFinite(n) ? n : NaN;
  };

  const handleSave = () => {
    if (!symbol.trim() || !name.trim() || !quantity.trim()) {
      Alert.alert(t.fillRequired);
      return;
    }

    const q = parseNumber(quantity);
    const bp = buyPrice.trim() ? parseNumber(buyPrice) : 0;
    const cp = currentPrice.trim() ? parseNumber(currentPrice) : 0;
    const r = rate.trim() ? parseNumber(rate) : 0;

    if (Number.isNaN(q) || Number.isNaN(bp) || Number.isNaN(cp) || Number.isNaN(r)) {
      Alert.alert(t.invalidNumber);
      return;
    }

    const asset = {
      id: String(Date.now()),
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      quantity: q,
      buyPrice: category === "cash" ? 1 : category === "deposit" ? cp : bp,
      currentPrice: category === "cash" ? 1 : cp,
      rate: category === "staking" || category === "deposit" ? r : 0,
      category,
      currency,
    };

    addAsset(asset);
    Alert.alert(t.success);
    router.back();
  };

  const showBuyPrice = category !== "cash" && category !== "deposit";
  const showCurrentPrice = category !== "cash";
  const showRate = category === "staking" || category === "deposit";

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <Text style={styles.subtitle}>{t.subtitle}</Text>
            <Text style={styles.title}>{t.title}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>{t.category}</Text>
            <View style={styles.rowWrap}>
              {categories.map((item) => {
                const active = item === category;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {t[item]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Field label={t.symbol} value={symbol} onChangeText={(v) => setSymbol(v.toUpperCase())} />
            <Field label={t.name} value={name} onChangeText={setName} />
            <Field label={t.quantity} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />

            {showBuyPrice ? (
              <Field label={t.buyPrice} value={buyPrice} onChangeText={setBuyPrice} keyboardType="decimal-pad" />
            ) : null}

            {showCurrentPrice ? (
              <Field label={t.currentPrice} value={currentPrice} onChangeText={setCurrentPrice} keyboardType="decimal-pad" />
            ) : null}

            {showRate ? (
              <Field label={t.rate} value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>{t.currency}</Text>
            <View style={styles.currencyRow}>
              {currencies.map((item) => {
                const active = item === currency;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setCurrency(item)}
                    style={[styles.currencyChip, active && styles.currencyChipActive]}
                  >
                    <Text style={[styles.currencyText, active && styles.currencyTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>{t.back}</Text>
            </Pressable>

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        placeholderTextColor={MUTED}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 16,
  },
  hero: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 28,
    padding: 20,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.14)",
    top: -70,
    right: -40,
  },
  subtitle: {
    color: MUTED,
    fontSize: 12,
    marginBottom: 8,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 24,
    padding: 16,
  },
  section: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(15,23,42,0.96)",
  },
  chipActive: {
    backgroundColor: "rgba(59,130,246,0.18)",
    borderColor: "rgba(59,130,246,0.42)",
  },
  chipText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(15,23,42,0.96)",
    paddingHorizontal: 16,
    color: TEXT,
    fontSize: 15,
  },
  currencyRow: {
    flexDirection: "row",
    gap: 10,
  },
  currencyChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(15,23,42,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyChipActive: {
    backgroundColor: "rgba(59,130,246,0.18)",
    borderColor: "rgba(59,130,246,0.42)",
  },
  currencyText: {
    color: "#CBD5E1",
    fontWeight: "700",
    fontSize: 14,
  },
  currencyTextActive: {
    color: "#FFFFFF",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    height: 54,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "rgba(15,23,42,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1.2,
    height: 54,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
