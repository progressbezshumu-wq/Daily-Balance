import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart } from "react-native-chart-kit";
import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { t } from "../../src/i18n";

const screenWidth = Dimensions.get("window").width;

const allocationColors: Record<string, string> = {
  crypto: "#2f6fed",
  stock: "#3fb950",
  etf: "#f59e0b",
  staking: "#a855f7",
  deposit: "#06b6d4",
  cash: "#ef4444",
};

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getCategoryLabel(category: string, language: string) {
  if (category === "crypto") return t(language, "crypto");
  if (category === "stock") return t(language, "stocks");
  if (category === "etf") return t(language, "etf");
  if (category === "staking") return t(language, "staking");
  if (category === "deposit") return t(language, "deposits");
  if (category === "cash") return t(language, "cash");
  return category;
}

export default function PortfolioScreen() {
  const assets = useFinanceStore((state) => state.assets);
  const language = useSettingsStore((state) => state.language) ?? "en";
  const [refreshing, setRefreshing] = useState(false);

  let portfolioValue = 0;
  let buyValue = 0;

  for (const asset of assets) {
    const quantity = toSafeNumber(asset.quantity);
    const currentPrice = toSafeNumber(asset.currentPrice ?? asset.buyPrice);
    const buyPrice = toSafeNumber(asset.buyPrice);

    portfolioValue += quantity * currentPrice;
    buyValue += quantity * buyPrice;
  }

  const profit = portfolioValue - buyValue;
  const profitPercent = buyValue === 0 ? 0 : (profit / buyValue) * 100;
  const profitColor = profit >= 0 ? "#3fb950" : "#ff4d4f";

  const categoryTotals: Record<string, number> = {
    crypto: 0,
    stock: 0,
    etf: 0,
    staking: 0,
    deposit: 0,
    cash: 0,
  };

  for (const asset of assets) {
    const quantity = toSafeNumber(asset.quantity);
    const currentPrice = toSafeNumber(asset.currentPrice ?? asset.buyPrice);
    const value = quantity * currentPrice;
    const category = asset.category;

    if (categoryTotals[category] !== undefined) {
      categoryTotals[category] += value;
    }
  }

  const categoryItems = Object.keys(categoryTotals)
    .map((category) => {
      const value = categoryTotals[category];
      const percent = portfolioValue === 0 ? 0 : (value / portfolioValue) * 100;

      return {
        category,
        label: getCategoryLabel(category, language),
        value,
        percent,
        color: allocationColors[category],
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const chartData = categoryItems.map((item) => ({
    name: item.label,
    population: item.value,
    color: item.color,
    legendFontColor: "#c9d1d9",
    legendFontSize: 12,
  }));

  function handleRefresh() {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        bounces
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.title}>{t(language, "portfolio")}</Text>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>{t(language, "portfolioAllocation")}</Text>

          <Text style={styles.categoryCount}>
            {categoryItems.length} {language === "de" ? "Kategorien" : language === "uk" ? "категорій" : "categories"}
          </Text>

          {chartData.length > 0 ? (
            <View style={styles.chartWrap}>
              <PieChart
                data={chartData}
                width={screenWidth - 72}
                height={220}
                chartConfig={{
                  backgroundColor: "#1b2130",
                  backgroundGradientFrom: "#1b2130",
                  backgroundGradientTo: "#1b2130",
                  color: () => "#ffffff",
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"12"}
                absolute
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>{t(language, "noAssetsYet")}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t(language, "currentValue")}</Text>
          <Text style={styles.value}>{portfolioValue.toFixed(2)} EUR</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t(language, "profitLoss")}</Text>
          <Text style={[styles.value, { color: profitColor }]}>
            {profit.toFixed(2)} EUR
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t(language, "profitLoss")} %</Text>
          <Text style={[styles.value, { color: profitColor }]}>
            {profitPercent.toFixed(2)} %
          </Text>
        </View>

        {categoryItems.length > 0 ? (
          <View style={styles.card}>
            {categoryItems.map((item) => (
              <View key={item.category} style={styles.allocationItem}>
                <View style={styles.allocationHeader}>
                  <View style={styles.categoryTitleWrap}>
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.assetName}>{item.label}</Text>
                  </View>

                  <Text style={styles.assetPercentStrong}>
                    {item.percent.toFixed(1)}%
                  </Text>
                </View>

                <Text style={styles.categoryValue}>
                  {item.value.toFixed(2)} EUR
                </Text>

                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}
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
    paddingBottom: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#1b2130",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },

  chartCard: {
    backgroundColor: "#1b2130",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },

  label: {
    color: "#8b93a7",
    fontSize: 14,
    marginBottom: 6,
  },

  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  categoryCount: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 12,
  },

  chartWrap: {
    alignItems: "center",
    marginBottom: 6,
  },

  value: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
  },

  emptyText: {
    color: "#8b93a7",
    fontSize: 15,
    marginTop: 8,
  },

  allocationItem: {
    marginTop: 14,
  },

  allocationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  categoryTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },

  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 8,
  },

  assetName: {
    color: "white",
    fontSize: 15,
    flex: 1,
  },

  assetPercentStrong: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  categoryValue: {
    color: "#c9d1d9",
    fontSize: 14,
    marginBottom: 8,
  },

  barBackground: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#111827",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 999,
  },
});


