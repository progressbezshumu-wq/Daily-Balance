import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Svg, { Polyline } from "react-native-svg";
import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { translations } from "../../src/i18n/translations";
import { assetLogos } from "../../src/constants/assetLogos";

type AssetItem = {
  id?: string;
  symbol?: string;
  name?: string;
  quantity?: number;
  buyPrice?: number;
  currentPrice?: number;
  currency?: string;
  category?: string;
  rate?: number;
};

type MergedAsset = {
  key: string;
  ids: string[];
  symbol: string;
  name: string;
  category: string;
  currency: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  rate: number;
};

function toSafeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value: number, currency: string) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toFixed(2)} ${currency}`;
}

const FX: Record<string, number> = {
  EUR: 1,
  USD: 0.93,
  UAH: 0.022,
};

function convertLocal(value: number, from: string, to: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;

  const fromRate = FX[String(from || "EUR").toUpperCase()] ?? 1;
  const toRate = FX[String(to || "EUR").toUpperCase()] ?? 1;

  const eurValue = amount * fromRate;
  return eurValue / toRate;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "crypto":
      return "bitcoin";
    case "stock":
      return "chart-line";
    case "etf":
      return "finance";
    case "staking":
      return "lock";
    case "deposit":
      return "bank";
    case "cash":
      return "cash";
    default:
      return "wallet-outline";
  }
}

function getAssetLogo(symbol?: string) {
  if (!symbol) return null;
  const key = String(symbol).toUpperCase() as keyof typeof assetLogos;
  return assetLogos[key] ?? null;
}


function getSparklineData(asset: MergedAsset) {
  const base = toSafeNumber(asset.currentPrice) || 100;
  const driftSeed = ((base - toSafeNumber(asset.buyPrice)) / (toSafeNumber(asset.buyPrice) || base || 1)) * 0.6;

  return Array.from({ length: 20 }, (_, i) => {
    const progress = i / 19;
    const trend = base * driftSeed * (progress - 0.5);
    const wave = Math.sin(i / 2.4) * base * 0.01;
    const noise = Math.cos(i / 1.7) * base * 0.004;
    return Math.max(0.0001, base + trend + wave + noise);
  });
}

function MiniSparkline({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const width = 132;
  const height = 42;

  const values = data.length > 1 ? data : [10, 11, 10.8, 11.4, 11.2, 11.8, 11.5, 12.0];
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
    <View style={{ width: 132, height: 42, justifyContent: "center", alignItems: "center" }}>
      <Svg width="132" height="42" viewBox={`0 0 ${width} ${height}`}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}


function mergeAssets(list: AssetItem[]): MergedAsset[] {
  const map = new Map<string, MergedAsset>();

  for (const asset of list ?? []) {
    const category = asset.category ?? "other";
    const symbol = asset.symbol ?? asset.name ?? "asset";
    const currency = asset.currency ?? "EUR";
    const key = `${category}__${symbol}__${currency}`;

    const quantity = toSafeNumber(asset.quantity);
    const buyPrice = toSafeNumber(asset.buyPrice);
    const currentPrice = toSafeNumber(asset.currentPrice);
    const rate = toSafeNumber(asset.rate);

    if (!map.has(key)) {
      map.set(key, {
        key,
        ids: asset.id ? [asset.id] : [],
        symbol: asset.symbol ?? "",
        name: asset.name ?? asset.symbol ?? "Asset",
        category,
        currency,
        quantity,
        buyPrice,
        currentPrice,
        rate,
      });
      continue;
    }

    const prev = map.get(key)!;
    const totalQuantity = prev.quantity + quantity;

    const averageBuyPrice =
      totalQuantity > 0
        ? (prev.buyPrice * prev.quantity + buyPrice * quantity) / totalQuantity
        : 0;

    map.set(key, {
      ...prev,
      ids: asset.id ? [...prev.ids, asset.id] : prev.ids,
      quantity: totalQuantity,
      buyPrice: averageBuyPrice,
      currentPrice: currentPrice || prev.currentPrice,
      rate: Math.max(prev.rate, rate),
    });
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function AssetsScreen() {
  const language = useSettingsStore((state) => state.language) ?? "en";
  const displayCurrency = useSettingsStore((state) => state.displayCurrency) ?? "EUR";
  const rawAssets = useFinanceStore((state) => state.assets ?? []);
  const t = translations[language];
  const [showCashHelp, setShowCashHelp] = useState(false);

  const copy =
    language === "uk"
      ? {
          title: "Активи",
          subtitle: "Головні позиції твого портфеля",
          addAsset: "Додати",
          addAssetFull: "Додати актив",
          cashTitle: "Готівка",
          cashText: "Швидке додавання готівки",
          allAssets: "Список активів",
          avgBuy: "Сер. ціна",
          qty: "К-сть",
          price: "Ціна",
          empty: "Поки активів немає",
          ok: "OK",
        }
      : language === "de"
      ? {
          title: "Vermögenswerte",
          subtitle: "Die Hauptpositionen deines Portfolios",
          addAsset: "Hinzufügen",
          addAssetFull: "Asset hinzufügen",
          cashTitle: "Bargeld",
          cashText: "Bargeld schnell hinzufügen",
          allAssets: "Asset-Liste",
          avgBuy: "Ø Kaufpreis",
          qty: "Menge",
          price: "Preis",
          empty: "Noch keine Assets",
          ok: "OK",
        }
      : {
          title: "Assets",
          subtitle: "Main positions of your portfolio",
          addAsset: "Add",
          addAssetFull: "Add asset",
          cashTitle: "Cash",
          cashText: "Quick cash entry",
          allAssets: "Assets list",
          avgBuy: "Avg buy",
          qty: "Qty",
          price: "Price",
          empty: "No assets yet",
          ok: "OK",
        };

  const assets = useMemo(() => mergeAssets(rawAssets), [rawAssets]);

  const groupedAssets = useMemo(() => {
    const groups = new Map<string, MergedAsset[]>();

    for (const asset of assets) {
      if (!groups.has(asset.category)) groups.set(asset.category, []);
      groups.get(asset.category)!.push(asset);
    }

    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [assets]);

  const handleAddCash = () => {
    router.push("/add-asset");
  };

  const handleAddAsset = () => {
    router.push("/add-asset");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#050816", "#0A1020", "#0C1425"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          </View>

        <View style={styles.topRow}>
          <Pressable style={styles.addAssetButton} onPress={handleAddAsset}>
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addAssetGradient}
            >
              <MaterialCommunityIcons name="plus" size={13} color="#FFFFFF" />
              <Text style={styles.addAssetText}>{copy.addAsset}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          
<View style={{
  flexDirection: "row",
  gap: 8,
  marginBottom: 8,
  paddingHorizontal: 12,
}}>
  <View style={{
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(59,130,246,0.12)"
  }}>
    <Text style={{ color: "#60A5FA", fontSize: 12, fontWeight: "700" }}>
      ALL
    </Text>
  </View>

  <View style={{
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(148,163,184,0.08)"
  }}>
    <Text style={{ color: "#94A3B8", fontSize: 12 }}>
      CRYPTO
    </Text>
  </View>

  <View style={{
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(148,163,184,0.08)"
  }}>
    <Text style={{ color: "#94A3B8", fontSize: 12 }}>
      STOCKS
    </Text>
  </View>
</View>

<Text style={styles.sectionTitle}>{copy.allAssets}</Text>

          {groupedAssets.length === 0 ? (
            <Text style={styles.emptyText}>{copy.empty}</Text>
          ) : (
            groupedAssets.map((group, groupIndex) => (
              <View key={`${group.category}-${groupIndex}`} style={styles.groupBlock}>
                <Text style={styles.groupTitle}>{group.category.toUpperCase()}</Text>

                {group.items.map((asset, index) => {
                  const nativeValue = asset.quantity * asset.currentPrice;
                  const nativeProfit = (asset.currentPrice - asset.buyPrice) * asset.quantity;

                  const currentPriceDisplay = convertLocal(
                    asset.currentPrice,
                    asset.currency,
                    displayCurrency
                  );

                  const buyPriceDisplay = convertLocal(
                    asset.buyPrice,
                    asset.currency,
                    displayCurrency
                  );

                  const value = convertLocal(
                    nativeValue,
                    asset.currency,
                    displayCurrency
                  );

                  const profit = convertLocal(
                    nativeProfit,
                    asset.currency,
                    displayCurrency
                  );

                  const profitColor = profit >= 0 ? "#22C55E" : "#EF4444";
                  const sparkline = getSparklineData(asset);

                  return (
                    <Pressable
                      key={`${asset.key}-${index}`}
                      style={{
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(148,163,184,0.08)"
}}
                      onPress={() => router.push({ pathname: "/asset-details", params: { assetId: asset.ids?.[0] ?? "" } })}
                    >
                      

                      <View style={styles.assetTopRow}>
                        <View style={styles.assetLeft}>
                          <View style={styles.assetIconWrap}>
                            {getAssetLogo(asset.symbol) ? (
                              <Image
                                source={getAssetLogo(asset.symbol)!}
                                style={styles.assetLogo}
                                resizeMode="contain"
                              />
                            ) : (
                              <MaterialCommunityIcons
                                name={getCategoryIcon(asset.category)}
                                size={17}
                                color="#60A5FA"
                              />
                            )}
                          </View>

                          <View style={styles.assetNameWrap}>
                            <Text style={styles.assetSymbol} numberOfLines={1}>
                              {asset.symbol || asset.category.toUpperCase()}
                            </Text>
                            <Text style={styles.assetName} numberOfLines={1}>
                              {asset.name}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.assetChartCol}>
                          <MiniSparkline data={sparkline} color={profit >= 0 ? "#22C55E" : "#EF4444"} />
                        </View>

                        <View style={styles.assetRight}>
                          <Text style={styles.assetPriceNow} numberOfLines={1}>
                            {formatMoney(currentPriceDisplay || 0, displayCurrency)}
                          </Text>
                          <Text style={[styles.assetProfit, { color: profitColor }]} numberOfLines={1}>
                            {profit >= 0 ? "+" : ""}{formatMoney(profit || 0, displayCurrency)}
                          </Text>
                        </View>
                      </View>

                      
                    </Pressable>
                  );
                })}
              </View>
            ))
          )}
        </View>

        <View style={styles.cashMiniWrap}>
          <View style={styles.cashMiniCard}>
            <View style={styles.cashMiniLeft}>
              <MaterialCommunityIcons name="cash" size={16} color="#22C55E" />
              <View>
                <Text style={styles.cashMiniTitle}>{copy.cashTitle}</Text>
                <Text style={styles.cashMiniText}>{copy.cashText}</Text>
              </View>
            </View>

            <View style={styles.cashMiniActions}>
              <Pressable onPress={() => setShowCashHelp(true)} hitSlop={8}>
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={18}
                  color="#94A3B8"
                />
              </Pressable>

              <Pressable style={styles.cashMiniButton} onPress={handleAddCash}>
                <MaterialCommunityIcons name="plus" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>

        <Modal
          visible={showCashHelp}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCashHelp(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{copy.cashTitle}</Text>
              <Text style={styles.modalText}>{t.cashHelpText ?? copy.cashText}</Text>

              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowCashHelp(false)}
              >
                <Text style={styles.modalCloseButtonText}>{copy.ok}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050816",
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 14,
    paddingBottom: 150,
    gap: 14,
  },
  header: {
    marginBottom: 0,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
  },
  topRow: {
    marginBottom: 8,
    alignItems: "flex-end",
    paddingHorizontal: 10,
  },
  addAssetButton: {
    alignSelf: "flex-end",
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addAssetGradient: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addAssetText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  sectionCard: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    paddingHorizontal: 12,
  },
  groupBlock: {
    marginBottom: 14,
  },
  groupTitle: {
    color: "#7C8AA5",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  assetCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.08)",
  },
  assetGlassGlow: {
    display: "none",
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assetTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assetLeftCol: {
    width: "28%",
    flexDirection: "row",
    alignItems: "center",
  },
  assetLeft: {
    width: "28%",
    flexDirection: "row",
    alignItems: "center",
  },
  assetNameWrap: {
    flex: 1,
  },
  assetChartCol: {
    width: "38%",
    alignItems: "center",
    justifyContent: "center",
  },
  assetRightCol: {
    width: "26%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  assetRight: {
    width: "26%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  assetIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(59,130,246,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.14)",
  },
  assetLogo: {
    width: 20,
    height: 20,
  },
  assetSymbol: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  assetName: {
    color: "#7C8AA5",
    fontSize: 11,
    marginTop: 2,
  },
  assetMeta: {
    color: "#7C8AA5",
    fontSize: 11,
    marginTop: 2,
  },
  assetPriceNow: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  assetValue: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  assetProfit: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
  },
  assetStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
  },
  statLabel: {
    color: "#7C8AA5",
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "700",
  },
  assetBottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  assetBottomText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },
  assetBottomDot: {
    color: "rgba(148,163,184,0.45)",
    fontSize: 11,
    marginHorizontal: 6,
  },
  cashMiniWrap: {
    marginTop: 6,
    paddingHorizontal: 12,
  },
  cashMiniCard: {
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cashMiniLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  cashMiniTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
  },
  cashMiniText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  cashMiniActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: 12,
  },
  cashMiniButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.68)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
  },
  modalTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalText: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 20,
  },
  modalCloseButton: {
    marginTop: 16,
    alignSelf: "flex-end",
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modalCloseButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
