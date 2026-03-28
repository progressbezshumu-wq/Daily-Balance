import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, Pressable, Alert } from "react-native";
import { useState, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { t } from "../../src/i18n";
import { fetchLiveRates, convertCurrency } from "../../src/utils/currency";

const screenWidth = Dimensions.get("window").width;
const chartSize = Math.min(screenWidth - 96, 240);
const radius = chartSize / 2;

const palette = [
  "#4F7CFF",
  "#4FC3F7",
  "#A855F7",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#F472B6",
  "#84CC16",
  "#8B5CF6",
];

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getStableColor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

function getAllocationHelp(language: string) {
  if (language === "de") {
    return "Zeigt, wie dein Portfolio auf deine Assets verteilt ist.";
  }

  if (language === "uk") {
    return "???????, ?? ???? ???? ???????? ???????????? ??? ????????.";
  }

  return "Shows how your portfolio is distributed across your assets.";
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeSector(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle >= 359.999) {
    return null;
  }

  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
    "Z",
  ].join(" ");
}

export default function PortfolioScreen() {
  const assets = useFinanceStore((state) => state.assets);
  const language = useSettingsStore((state) => state.language) ?? "en";
  const displayCurrency = useSettingsStore((state) => state.displayCurrency);

  const [rates, setRates] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLiveRates().then(setRates);
  }, []);

  const portfolioData = useMemo(() => {
    let portfolioValue = 0;

    const groupedMap: Record<
      string,
      {
        key: string;
        label: string;
        value: number;
        color: string;
      }
    > = {};

    for (const asset of assets) {
      const quantity = toSafeNumber(asset.quantity);
      const currentPrice = toSafeNumber(asset.currentPrice ?? asset.buyPrice);
      const currentValue = quantity * currentPrice;

      const convertedValue = rates
        ? convertCurrency(currentValue, asset.currency, displayCurrency, rates)
        : currentValue;

      portfolioValue += convertedValue;

      const symbol = (asset.symbol || "").trim();
      const name = (asset.name || "").trim();
      const categoryLabel = t(language, asset.category as any);
      const groupKey = symbol || name || asset.category || "asset";
      const label = symbol || name || categoryLabel;

      if (!groupedMap[groupKey]) {
        groupedMap[groupKey] = {
          key: groupKey,
          label,
          value: 0,
          color: getStableColor(groupKey),
        };
      }

      groupedMap[groupKey].value += convertedValue;
    }

    const allocationEntries = Object.values(groupedMap)
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((item) => ({
        ...item,
        percent: portfolioValue > 0 ? (item.value / portfolioValue) * 100 : 0,
      }));

    return {
      portfolioValue,
      allocationEntries,
    };
  }, [assets, rates, displayCurrency, language]);

  const { portfolioValue, allocationEntries } = portfolioData;

  function handleRefresh() {
    setRefreshing(true);
    fetchLiveRates().then((r) => {
      setRates(r);
      setRefreshing(false);
    });
  }

  let currentAngle = 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t(language, "portfolio")}</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{t(language, "currentValue")}</Text>
          <Text style={styles.heroValue}>
            {portfolioValue.toFixed(2)} {displayCurrency}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t(language, "portfolioAllocation")}</Text>

            <Pressable
              style={styles.helpButton}
              onPress={() => Alert.alert(t(language, "help"), getAllocationHelp(language))}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </Pressable>
          </View>

          {allocationEntries.length > 0 ? (
            <>
              <View style={styles.chartWrap}>
                <Svg width={chartSize} height={chartSize}>
                  <Circle cx={radius} cy={radius} r={radius} fill="#2a3140" />

                  {allocationEntries.map((item, index) => {
                    const sweepAngle =
                      index === allocationEntries.length - 1
                        ? 360 - currentAngle
                        : (item.percent / 100) * 360;

                    const startAngle = currentAngle;
                    const endAngle = currentAngle + sweepAngle;
                    currentAngle = endAngle;

                    const path = describeSector(radius, radius, radius, startAngle, endAngle);

                    if (!path) {
                      return (
                        <Circle
                          key={item.key}
                          cx={radius}
                          cy={radius}
                          r={radius}
                          fill={item.color}
                        />
                      );
                    }

                    return <Path key={item.key} d={path} fill={item.color} />;
                  })}
                </Svg>
              </View>

              <View style={styles.allocationList}>
                {allocationEntries.map((item) => (
                  <View key={item.key} style={styles.allocationRow}>
                    <View style={styles.allocationLeft}>
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={styles.allocationName}>{item.label}</Text>
                    </View>

                    <View style={styles.allocationRight}>
                      <Text style={styles.allocationPercent}>{item.percent.toFixed(1)}%</Text>
                      <Text style={styles.allocationAmount}>
                        {item.value.toFixed(2)} {displayCurrency}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>{t(language, "noAssetsYet")}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f1218",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: "#1b2130",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  heroLabel: {
    color: "#8b93a7",
    fontSize: 14,
    marginBottom: 8,
  },
  heroValue: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  sectionCard: {
    backgroundColor: "#1b2130",
    borderRadius: 18,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  helpButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#151b26",
    alignItems: "center",
    justifyContent: "center",
  },
  helpButtonText: {
    color: "#8b93a7",
    fontSize: 14,
    fontWeight: "700",
  },
  chartWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  allocationList: {
    gap: 10,
    marginTop: 4,
  },
  allocationRow: {
    backgroundColor: "#151b26",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  allocationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  allocationName: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  allocationRight: {
    alignItems: "flex-end",
  },
  allocationPercent: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  allocationAmount: {
    color: "#8b93a7",
    fontSize: 13,
  },
  emptyText: {
    color: "#8b93a7",
    fontSize: 14,
  },
});
