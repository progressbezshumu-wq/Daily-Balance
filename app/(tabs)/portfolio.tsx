import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";

function toSafeNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function format(v: number, c: string) {
  return `${v.toFixed(2)} ${c}`;
}

export default function PortfolioScreen() {
  const assets = useFinanceStore((s) => s.assets);
  const currency = useSettingsStore((s) => s.displayCurrency) ?? "EUR";

  const portfolioValue = assets.reduce((sum, a) => {
    return sum + toSafeNumber(a.quantity) * toSafeNumber(a.currentPrice);
  }, 0);

  const buyValue = assets.reduce((sum, a) => {
    return sum + toSafeNumber(a.quantity) * toSafeNumber(a.buyPrice);
  }, 0);

  const profit = portfolioValue - buyValue;
  const profitColor = profit >= 0 ? "#22C55E" : "#EF4444";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Portfolio</Text>

        <View style={styles.card}>
          <Text style={styles.label}>TOTAL VALUE</Text>
          <Text style={styles.value}>{format(portfolioValue, currency)}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.cardSmall}>
            <Text style={styles.label}>INVESTED</Text>
            <Text style={styles.valueSmall}>{format(buyValue, currency)}</Text>
          </View>

          <View style={styles.cardSmall}>
            <Text style={styles.label}>P/L</Text>
            <Text style={[styles.valueSmall, { color: profitColor }]}>
              {format(profit, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>ASSETS</Text>

          {assets.map((a, i) => {
            const value = toSafeNumber(a.quantity) * toSafeNumber(a.currentPrice);

            return (
              <View key={`${a.id ?? a.symbol}-${i}`} style={styles.assetRow}>
                <Text style={styles.assetName}>{a.name}</Text>
                <Text style={styles.assetValue}>{format(value, currency)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#060912",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  card: {
    backgroundColor: "#0b1220",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  cardSmall: {
    flex: 1,
    backgroundColor: "#0b1220",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  label: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  valueSmall: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  assetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  assetName: {
    color: "#E5E7EB",
  },
  assetValue: {
    color: "#E5E7EB",
    fontWeight: "600",
  },
});
