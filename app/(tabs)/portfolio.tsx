import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart } from "react-native-chart-kit";

import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { t } from "../../src/i18n";
import { fetchLiveRates, convertCurrency } from "../../src/utils/currency";

const screenWidth = Dimensions.get("window").width;

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
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

  let portfolioValue = 0;
  let buyValue = 0;

  for (const asset of assets) {
    const quantity = toSafeNumber(asset.quantity);
    const currentPrice = toSafeNumber(asset.currentPrice ?? asset.buyPrice);
    const buyPrice = toSafeNumber(asset.buyPrice);

    const currentValue = quantity * currentPrice;
    const buyVal = quantity * buyPrice;

    const convertedCurrent = rates
      ? convertCurrency(currentValue, "EUR", displayCurrency, rates)
      : currentValue;

    const convertedBuy = rates
      ? convertCurrency(buyVal, "EUR", displayCurrency, rates)
      : buyVal;

    portfolioValue += convertedCurrent;
    buyValue += convertedBuy;
  }

  const profit = portfolioValue - buyValue;
  const profitPercent = buyValue === 0 ? 0 : (profit / buyValue) * 100;
  const profitColor = profit >= 0 ? "#3fb950" : "#ff4d4f";

  function handleRefresh() {
    setRefreshing(true);
    fetchLiveRates().then((r) => {
      setRates(r);
      setRefreshing(false);
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Text style={styles.title}>{t(language, "portfolio")}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t(language, "currentValue")}</Text>
          <Text style={styles.value}>
            {portfolioValue.toFixed(2)} {displayCurrency}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t(language, "profitLoss")}</Text>
          <Text style={[styles.value, { color: profitColor }]}>
            {profit.toFixed(2)} {displayCurrency}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t(language, "profitLoss")} %</Text>
          <Text style={[styles.value, { color: profitColor }]}>
            {profitPercent.toFixed(2)} %
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1218" },
  scrollContent: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700", color: "white", marginBottom: 24 },
  card: { backgroundColor: "#1b2130", padding: 18, borderRadius: 14, marginBottom: 16 },
  label: { color: "#8b93a7", fontSize: 14, marginBottom: 6 },
  value: { color: "white", fontSize: 22, fontWeight: "600" },
});
