import Svg, { Polyline } from "react-native-svg";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
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
import AssetSearch from "../src/components/AssetSearch";
import { getCachedSnapshot } from "../src/utils/priceCache";

type AssetCategory = "stock" | "etf" | "crypto" | "staking" | "deposit" | "cash";
type Currency = "EUR" | "USD" | "UAH";
type AppLanguage = "en" | "de" | "uk";

const BG = "#050816";
const CARD = "rgba(10, 14, 28, 0.78)";
const CARD_STRONG = "rgba(10, 16, 32, 0.94)";
const BORDER = "rgba(96, 165, 250, 0.16)";
const BORDER_SOFT = "rgba(148, 163, 184, 0.10)";
const TEXT = "#EAF2FF";
const MUTED = "#7C8AA5";
const ACCENT = "#3B82F6";
const POSITIVE = "#22C55E";
const PINK = "#EC4899";
const VIOLET = "#8B5CF6";
const CYAN = "#22D3EE";

const categories: AssetCategory[] = ["stock", "etf", "crypto", "staking", "deposit", "cash"];
const currencies: Currency[] = ["EUR", "USD", "UAH"];

function toSafeNumber(value: string) {
  const n = Number(String(value).replace(",", ".").trim());
  return Number.isFinite(n) ? n : NaN;
}

function getQuickToggleCurrency(current: string) {
  const c = String(current || "EUR").toUpperCase();
  if (c === "EUR") return "USD";
  if (c === "USD") return "EUR";
  if (c === "UAH") return "USD";
  return "EUR";
}

function MiniSparkline({
  data,
  color,
}: {
  data?: number[];
  color: string;
}) {
  const width = 160;
  const height = 56;
  const values =
    data && data.length > 1
      ? data
      : [10, 11, 10.7, 11.4, 11.1, 11.8, 11.5, 12.2, 12.0, 12.6, 12.4, 13.0];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View style={{ width: "100%", height: 56, justifyContent: "center" }}>
      <Svg width="100%" height="56" viewBox={`0 0 ${width} ${height}`}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}


export default function AddAssetScreen() {
  const addAsset = useFinanceStore((state: any) => state.addAsset);
  const language = (useSettingsStore((state: any) => state.language) ?? "en") as AppLanguage;
  const displayCurrency = (useSettingsStore((state: any) => state.displayCurrency) ?? "EUR") as Currency;

  const [category, setCategory] = useState<AssetCategory>("stock");
  const [currency, setCurrency] = useState<Currency>(displayCurrency);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [snapshot, setSnapshot] = useState<{ price: number; changePercent24h: number; sparkline?: number[] } | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [rate, setRate] = useState("");

  const t = useMemo(() => {
    if (language === "uk") {
      return {
        badge: "NEW ASSET",
        title: "Додати актив",
        subtitle: "Чистий запис у портфель",
        sectionAsset: "Актив",
        sectionDetails: "Параметри",
        category: "Категорія",
        currency: "Валюта",
        switchCurrency: "Змінити",
        name: "Назва",
        symbol: "Тікер / символ",
        quantity: "Кількість",
        buyPrice: "Ціна купівлі",
        rate: "Річна ставка, %",
        save: "Зберегти актив",
        back: "Назад",
        note: "Знайди актив, вибери його зі списку, далі заповни тільки потрібні поля.",
        fillRequired: "Заповни обов’язкові поля",
        invalid: "Перевір числові значення",
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
        badge: "NEW ASSET",
        title: "Asset hinzufügen",
        subtitle: "Sauberer Portfolio-Eintrag",
        sectionAsset: "Asset",
        sectionDetails: "Parameter",
        category: "Kategorie",
        currency: "Währung",
        switchCurrency: "Wechseln",
        name: "Name",
        symbol: "Ticker / Symbol",
        quantity: "Menge",
        buyPrice: "Kaufpreis",
        rate: "Jahresrate, %",
        save: "Asset speichern",
        back: "Zurück",
        note: "Finde das Asset, wähle es aus der Liste, dann fülle nur die nötigen Felder aus.",
        fillRequired: "Pflichtfelder ausfüllen",
        invalid: "Numerische Werte prüfen",
        stock: "Aktien",
        etf: "ETF",
        crypto: "Krypto",
        staking: "Staking",
        deposit: "Einlage",
        cash: "Bargeld",
      };
    }

    return {
      badge: "NEW ASSET",
      title: "Add Asset",
      subtitle: "Clean portfolio entry",
      sectionAsset: "Asset",
      sectionDetails: "Parameters",
      category: "Category",
      currency: "Currency",
      switchCurrency: "Switch",
      name: "Name",
      symbol: "Ticker / Symbol",
      quantity: "Quantity",
      buyPrice: "Buy Price",
      rate: "Annual Rate, %",
      save: "Save Asset",
      back: "Back",
      note: "Search the asset, select it from the list, then fill only the needed fields.",
      fillRequired: "Fill required fields",
      invalid: "Check numeric values",
      stock: "Stocks",
      etf: "ETF",
      crypto: "Crypto",
      staking: "Staking",
      deposit: "Deposit",
      cash: "Cash",
    };
  }, [language]);

  const showRate = category === "staking" || category === "deposit";

  useEffect(() => {
    setCurrency(displayCurrency);
  }, [displayCurrency]);

  useEffect(() => {
    if (!selectedAsset) {
      setSnapshot(null);
      return;
    }

    let alive = true;

    const buildSparkline = (price: number, changePercent24h: number) => {
      const base = price || 100;
      const drift = (changePercent24h || 0) / 100;
      return Array.from({ length: 24 }, (_, i) => {
        const progress = i / 23;
        const trend = base * drift * (progress - 0.5) * 0.6;
        const wave = Math.sin(i / 2.8) * base * 0.006;
        const noise = Math.cos(i / 1.9) * base * 0.003;
        return Math.max(0.0001, base + trend + wave + noise);
      });
    };

    const loadPrice = async (withLoader = false) => {
      try {
        if (withLoader) setLoadingPrice(true);
        const data = await getCachedSnapshot(selectedAsset);
        const next = {
          ...data,
          sparkline:
            data?.sparkline && data.sparkline.length > 1
              ? data.sparkline
              : buildSparkline(data?.price ?? 0, data?.changePercent24h ?? 0),
        };

        if (alive) setSnapshot(next);
      } catch {
        if (alive) {
          setSnapshot({
            price: 0,
            changePercent24h: 0,
            sparkline: buildSparkline(100, 0),
          });
        }
      } finally {
        if (alive && withLoader) setLoadingPrice(false);
      }
    };

    loadPrice(true);
    const id = setInterval(() => loadPrice(false), 15000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [selectedAsset]);

  const handleSave = () => {
    if (!selectedAsset || !quantity.trim() || !buyPrice.trim()) {
      Alert.alert(t.fillRequired);
      return;
    }

    const parsedQuantity = toSafeNumber(quantity);
    const parsedBuyPrice = toSafeNumber(buyPrice);
    const parsedRate = rate.trim() ? toSafeNumber(rate) : 0;

    if (
      Number.isNaN(parsedQuantity) ||
      Number.isNaN(parsedBuyPrice) ||
      Number.isNaN(parsedRate)
    ) {
      Alert.alert(t.invalid);
      return;
    }

    addAsset({
      name: selectedAsset.name,
      symbol: selectedAsset.symbol,
      quantity: parsedQuantity,
      buyPrice: parsedBuyPrice,
      currentPrice: snapshot?.price || 0,
      category:
        selectedAsset.type === "crypto"
          ? "crypto"
          : selectedAsset.type === "etf"
          ? "etf"
          : category,
      currency,
      rate: showRate ? parsedRate : 0,
    });

    router.back();
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.bgOrb, styles.bgBlue]} />
      <View style={[styles.bgOrb, styles.bgGreen]} />
      <View style={[styles.bgOrb, styles.bgPink]} />
      <View style={[styles.bgOrb, styles.bgViolet]} />
      <View style={[styles.bgLine, styles.bgLineA]} />
      <View style={[styles.bgLine, styles.bgLineB]} />

      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.heroCard}>
            <View style={styles.heroGlowA} />
            <View style={styles.heroGlowB} />
            <View style={styles.heroGlowC} />

            <Text style={styles.badge}>{t.badge}</Text>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{t.sectionAsset}</Text>

            <Text style={styles.label}>{t.category}</Text>
            <View style={styles.chipsWrap}>
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

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{t.sectionDetails}</Text>

            <AssetSearch key={selectedAsset?.symbol || "empty"}
              onSelect={(asset: any) => {
                setSelectedAsset(asset);
                if (asset.type === "crypto") setCategory("crypto");
                if (asset.type === "etf") setCategory("etf");
                if (asset.type === "stock") setCategory("stock");
              }}
            />

            {selectedAsset ? (
              <View
                style={{
                  marginTop: 10,
                  minHeight: 82,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(96, 165, 250, 0.12)",
                  backgroundColor: "rgba(10, 14, 28, 0.65)",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: "26%" }}>
                  <Text
                    style={{
                      color: TEXT,
                      fontSize: 15,
                      fontWeight: "700",
                      letterSpacing: 0.3,
                    }}
                    numberOfLines={1}
                  >
                    {selectedAsset.symbol}
                  </Text>

                  <Text
                    style={{
                      color: MUTED,
                      fontSize: 12,
                      marginTop: 3,
                    }}
                    numberOfLines={2}
                  >
                    {selectedAsset.name}
                  </Text>
                </View>

                <View
                  style={{
                    width: "42%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MiniSparkline
                    data={snapshot?.sparkline}
                    color={(snapshot?.changePercent24h ?? 0) >= 0 ? "#22C55E" : "#EF4444"}
                  />
                </View>

                <View style={{ width: "26%", alignItems: "flex-end" }}>
                  {loadingPrice && !snapshot ? (
                    <ActivityIndicator />
                  ) : (
                    <>
                      <Text
                        style={{
                          color: TEXT,
                          fontSize: 16,
                          fontWeight: "700",
                        }}
                      >
                        {(snapshot?.price ?? 0).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </Text>

                      <Text
                        style={{
                          marginTop: 3,
                          fontSize: 12,
                          fontWeight: "700",
                          color:
                            (snapshot?.changePercent24h ?? 0) >= 0
                              ? "#22C55E"
                              : "#EF4444",
                        }}
                      >
                        {(snapshot?.changePercent24h ?? 0) >= 0 ? "+" : ""}
                        {(snapshot?.changePercent24h ?? 0).toFixed(2)}%
                      </Text>
                    </>
                  )}
                </View>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Field
                  label={t.quantity}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.rowItem}>
                <View style={styles.fieldWrap}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>
                      {t.buyPrice} · {currency}
                    </Text>

                    <Pressable
                      onPress={() => setCurrency(getQuickToggleCurrency(currency) as Currency)}
                      style={styles.currencyMiniButton}
                    >
                      <Text style={styles.currencyMiniButtonText}>
                        {getQuickToggleCurrency(currency)}
                      </Text>
                    </Pressable>
                  </View>

                  <TextInput
                    value={buyPrice}
                    onChangeText={setBuyPrice}
                    placeholder="0.00"
                    placeholderTextColor={MUTED}
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            {showRate ? (
              <Field
                label={t.rate}
                value={rate}
                onChangeText={setRate}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            ) : null}
          </View>


          <View style={styles.noteCard}>
            <View style={styles.noteGlow} />
            <Text style={styles.noteTitle}>API</Text>
            <Text style={styles.noteText}>{t.note}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>{t.back}</Text>
            </Pressable>

            <Pressable style={[styles.saveButton, !selectedAsset && { opacity: 0.5 }]} onPress={handleSave} disabled={!selectedAsset}>
              <View style={styles.saveGlow} />
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
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "decimal-pad";
  autoCapitalize?: "none" | "characters" | "sentences" | "words";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={MUTED}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "none"}
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

  bgOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  bgBlue: {
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    backgroundColor: "rgba(59,130,246,0.16)",
  },
  bgGreen: {
    top: 260,
    left: -90,
    width: 180,
    height: 180,
    backgroundColor: "rgba(34,197,94,0.08)",
  },
  bgPink: {
    bottom: 160,
    right: -70,
    width: 220,
    height: 220,
    backgroundColor: "rgba(236,72,153,0.08)",
  },
  bgViolet: {
    bottom: 40,
    left: -90,
    width: 220,
    height: 220,
    backgroundColor: "rgba(139,92,246,0.08)",
  },
  bgLine: {
    position: "absolute",
    height: 1,
    borderRadius: 999,
  },
  bgLineA: {
    top: 200,
    left: 30,
    right: 80,
    backgroundColor: "rgba(34,211,238,0.10)",
  },
  bgLineB: {
    top: 520,
    left: 80,
    right: 20,
    backgroundColor: "rgba(236,72,153,0.08)",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
    gap: 14,
  },

  heroCard: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    overflow: "hidden",
    shadowColor: ACCENT,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  heroGlowA: {
    position: "absolute",
    top: -60,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.22)",
  },
  heroGlowB: {
    position: "absolute",
    bottom: -50,
    left: -25,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(139,92,246,0.14)",
  },
  heroGlowC: {
    position: "absolute",
    top: 70,
    left: 130,
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.08)",
  },
  badge: {
    color: "#A5D8FF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#B7C7DE",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  panel: {
    backgroundColor: CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  panelTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    backgroundColor: CARD_STRONG,
  },
  chipActive: {
    backgroundColor: "rgba(59,130,246,0.18)",
    borderColor: "rgba(96,165,250,0.34)",
    shadowColor: ACCENT,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  chipText: {
    color: "#C8D5E6",
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
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  fieldWrap: {
    width: "100%",
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  currencyMiniButton: {
    minWidth: 48,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.14)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyMiniButtonText: {
    color: "#93C5FD",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  input: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    backgroundColor: CARD_STRONG,
    paddingHorizontal: 16,
    color: TEXT,
    fontSize: 15,
    fontWeight: "500",
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
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
    borderColor: BORDER_SOFT,
    backgroundColor: CARD_STRONG,
    alignItems: "center",
    justifyContent: "center",
  },
  currencyChipActive: {
    backgroundColor: "rgba(59,130,246,0.18)",
    borderColor: "rgba(96,165,250,0.34)",
  },
  currencyText: {
    color: "#C8D5E6",
    fontWeight: "700",
    fontSize: 14,
  },
  currencyTextActive: {
    color: "#FFFFFF",
  },

  noteCard: {
    backgroundColor: "rgba(19, 26, 48, 0.86)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.16)",
    padding: 15,
    overflow: "hidden",
  },
  noteGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 999,
    right: -30,
    bottom: -50,
    backgroundColor: "rgba(236,72,153,0.08)",
  },
  noteTitle: {
    color: "#BFDBFE",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  noteText: {
    color: "#D8E4F5",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    backgroundColor: CARD_STRONG,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1.25,
    height: 56,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: ACCENT,
    shadowOpacity: 0.26,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  saveGlow: {
    position: "absolute",
    top: -20,
    right: -10,
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
