import React, { useMemo, useState } from "react";
import {
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
import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { translations } from "../../src/i18n/translations";

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
  return `${value.toFixed(2)} ${currency}`;
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
          addAsset: "Додати актив",
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
          addAsset: "Asset hinzufügen",
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
          addAsset: "Add asset",
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
          <Pressable style={styles.addAssetButton} onPress={() => router.push("/add-asset")}>
            <LinearGradient
              colors={["rgba(59,130,246,0.95)", "rgba(37,99,235,0.95)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addAssetGradient}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.addAssetText}>{copy.addAsset}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{copy.allAssets}</Text>

          {groupedAssets.length === 0 ? (
            <Text style={styles.emptyText}>{copy.empty}</Text>
          ) : (
            groupedAssets.map((group, groupIndex) => (
              <View key={`${group.category}-${groupIndex}`} style={styles.groupBlock}>
                <Text style={styles.groupTitle}>{group.category.toUpperCase()}</Text>

                {group.items.map((asset, index) => {
                  const value = asset.quantity * asset.currentPrice;
                  const profit = (asset.currentPrice - asset.buyPrice) * asset.quantity;
                  const profitColor = profit >= 0 ? "#22C55E" : "#EF4444";

                  return (
                    <Pressable
                      key={`${asset.key}-${index}`}
                      style={styles.assetCard}
                      onPress={() => router.push("/add-asset")}
                    >
                      <View style={styles.assetGlassGlow} />

                      <View style={styles.assetTopRow}>
                        <View style={styles.assetLeft}>
                          <View style={styles.assetIconWrap}>
                            <MaterialCommunityIcons
                              name={getCategoryIcon(asset.category)}
                              size={20}
                              color="#60A5FA"
                            />
                          </View>

                          <View>
                            <Text style={styles.assetName}>{asset.name}</Text>
                            <Text style={styles.assetMeta}>
                              {asset.symbol || asset.category.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.assetRight}>
                          <Text style={styles.assetValue}>
                            {formatMoney(value, displayCurrency)}
                          </Text>
                          <Text style={[styles.assetProfit, { color: profitColor }]}>
                            {profit >= 0 ? "+" : ""}
                            {formatMoney(profit, displayCurrency)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.assetStatsRow}>
                        <View style={styles.statBox}>
                          <Text style={styles.statLabel}>{copy.qty}</Text>
                          <Text style={styles.statValue}>{asset.quantity.toFixed(4)}</Text>
                        </View>

                        <View style={styles.statBox}>
                          <Text style={styles.statLabel}>{copy.avgBuy}</Text>
                          <Text style={styles.statValue}>
                            {formatMoney(asset.buyPrice, asset.currency)}
                          </Text>
                        </View>

                        <View style={styles.statBox}>
                          <Text style={styles.statLabel}>{copy.price}</Text>
                          <Text style={styles.statValue}>
                            {formatMoney(asset.currentPrice, asset.currency)}
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
    padding: 20,
    paddingBottom: 150,
    gap: 16,
  },
  header: {
    marginBottom: 2,
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
    marginBottom: 2,
  },
  addAssetButton: {
    borderRadius: 18,
    overflow: "hidden",
  },
  addAssetGradient: {
    height: 52,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addAssetText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 12,
  },
  groupBlock: {
    marginTop: 10,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  assetCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "rgba(17, 24, 39, 0.70)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    marginBottom: 12,
  },
  assetGlassGlow: {
    position: "absolute",
    top: -18,
    right: -18,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(59,130,246,0.10)",
  },
  assetTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  assetLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assetIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(59,130,246,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  assetName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  assetMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#94A3B8",
  },
  assetRight: {
    alignItems: "flex-end",
  },
  assetValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  assetProfit: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
  },
  assetStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 32, 0.88)",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
  },
  statLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 4,
  },
  cashMiniWrap: {
    marginTop: 2,
  },
  cashMiniCard: {
    backgroundColor: "rgba(11, 18, 32, 0.44)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.08)",
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
    fontSize: 14,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  cashMiniText: {
    marginTop: 2,
    fontSize: 12,
    color: "#94A3B8",
  },
  cashMiniActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: 12,
  },
  cashMiniButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#0B1220",
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#CBD5E1",
  },
  modalCloseButton: {
    marginTop: 18,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
