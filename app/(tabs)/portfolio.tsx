import { View, Text, StyleSheet } from "react-native";
import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { t } from "../../src/i18n";

const allocationColors = [
  "#2f6fed",
  "#3fb950",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
];

export default function PortfolioScreen() {
  const assets = useFinanceStore((state) => state.assets);
  const language = useSettingsStore((state) => state.language) ?? "en";

  let portfolioValue = 0;
  let buyValue = 0;

  for (const asset of assets) {
    const quantity = Number(asset.quantity) || 0;
    const currentPrice = Number(asset.currentPrice ?? asset.buyPrice) || 0;
    const buyPrice = Number(asset.buyPrice) || 0;

    portfolioValue += quantity * currentPrice;
    buyValue += quantity * buyPrice;
  }

  const profit = portfolioValue - buyValue;
  const profitPercent = buyValue === 0 ? 0 : (profit / buyValue) * 100;
  const profitColor =
    profit >= 0 ? "#3fb950" : "#ff4d4f";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t(language, "portfolio")}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t(language, "currentValue")}</Text>
        <Text style={styles.value}>{portfolioValue.toFixed(2)} €</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t(language, "profitLoss")}</Text>
        <Text style={[styles.value, { color: profitColor }]}>
          {profit.toFixed(2)} €
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t(language, "profitLoss")} %</Text>
        <Text style={[styles.value, { color: profitColor }]}>
          {profitPercent.toFixed(2)} %
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Allocation</Text>

        {assets.map((asset, index) => {
          const quantity = Number(asset.quantity) || 0;
          const currentPrice = Number(asset.currentPrice ?? asset.buyPrice) || 0;
          const value = quantity * currentPrice;
          const percent =
            portfolioValue === 0 ? 0 : (value / portfolioValue) * 100;

          return (
            <View key={asset.id} style={styles.allocationItem}>
              <View style={styles.allocationHeader}>
                <Text style={styles.assetName}>
                  {asset.symbol} — {asset.name}
                </Text>
                <Text style={styles.assetPercent}>{percent.toFixed(1)}%</Text>
              </View>

              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${percent}%`,
                      backgroundColor:
                        allocationColors[index % allocationColors.length],
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1218",
    padding: 20,
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

  label: {
    color: "#8b93a7",
    fontSize: 14,
    marginBottom: 6,
  },

  value: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
  },

  allocationItem: {
    marginTop: 14,
  },

  allocationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  assetName: {
    color: "white",
    fontSize: 15,
    flex: 1,
    marginRight: 12,
  },

  assetPercent: {
    color: "#8b93a7",
    fontSize: 15,
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
