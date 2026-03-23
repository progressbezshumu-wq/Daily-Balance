import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl } from "react-native";
import { useState, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";

import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { t } from "../../src/i18n";
import { fetchLiveRates, convertCurrency } from "../../src/utils/currency";

const screenWidth = Dimensions.get("window").width;

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

const allocationColors = [
  "#3fb950",
  "#58a6ff",
  "#f2cc60",
  "#ff7b72",
  "#bc8cff",
  "#39c5cf",
  "#ffa657",
  "#7ee787",
];

const chartSize = Math.min(screenWidth - 96, 220);
const strokeWidth = 28;
const radius = (chartSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

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

    const holdings = assets
      .map((asset, index) => {
        const quantity = toSafeNumber(asset.quantity);
        const currentPrice = toSafeNumber(asset.currentPrice ?? asset.buyPrice);
        const currentValue = quantity * currentPrice;

        const convertedValue = rates
          ? convertCurrency(currentValue, asset.currency, displayCurrency, rates)
          : currentValue;

        portfolioValue += convertedValue;

        return {
          key: asset.id,
          label: asset.symbol || asset.name || `${t(language, asset.category as any)} ${index + 1}`,
          value: convertedValue,
          color: allocationColors[index % allocationColors.length],
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const allocationEntries = holdings.map((item) => ({
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

  let accumulatedPercent = 0;

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
          <Text style={styles.sectionTitle}>{t(language, "portfolioAllocation")}</Text>

          {allocationEntries.length > 0 ? (
            <>
              <View style={styles.chartWrap}>
                <Svg width={chartSize} height={chartSize}>
                  <G rotation="-90" origin={`${chartSize / 2}, ${chartSize / 2}`}>
                    <Circle
                      cx={chartSize / 2}
                      cy={chartSize / 2}
                      r={radius}
                      stroke="#2a3140"
                      strokeWidth={strokeWidth}
                      fill="none"
                    />

                    {allocationEntries.map((item) => {
                      const dash = (item.percent / 100) * circumference;
                      const offset = circumference - (accumulatedPercent / 100) * circumference;
                      accumulatedPercent += item.percent;

                      return (
                        <Circle
                          key={item.key}
                          cx={chartSize / 2}
                          cy={chartSize / 2}
                          r={radius}
                          stroke={item.color}
                          strokeWidth={strokeWidth}
                          fill="none"
                          strokeLinecap="butt"
                          strokeDasharray={`${dash} ${circumference - dash}`}
                          strokeDashoffset={offset}
                        />
                      );
                    })}
                  </G>
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
    color: "white",
    fontSize: 28,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#1b2130",
    borderRadius: 18,
    padding: 18,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
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
