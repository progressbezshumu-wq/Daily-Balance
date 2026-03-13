import { View, Text, StyleSheet } from "react-native";

import { useFinanceStore } from "../../src/store/financeStore";
import { useLiabilityStore } from "../../src/store/liabilityStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { t } from "../../src/i18n";

function getDailyBalanceColor(value: number) {
  if (value > 0) return "#3fb950";
  if (value < 0) return "#ff4d4f";
  return "#c9d1d9";
}

function getNetWorthColor(value: number) {
  if (value >= 100000) return "#22c55e";
  if (value >= 10000) return "#3fb950";
  if (value > 0) return "#86efac";
  return "#c9d1d9";
}

function getPassiveIncomeColor(value: number) {
  if (value >= 10000) return "#22c55e";
  if (value >= 1000) return "#3fb950";
  if (value > 0) return "#86efac";
  return "#c9d1d9";
}

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getLiabilityYearlyValue(liability: any) {
  const paymentAmount = toSafeNumber(liability?.paymentAmount);
  const paymentPeriod = liability?.paymentPeriod;

  if (paymentPeriod === "daily") return paymentAmount * 365;
  if (paymentPeriod === "monthly") return paymentAmount * 12;
  if (paymentPeriod === "yearly") return paymentAmount;

  return toSafeNumber(liability?.yearlyPayment);
}

export default function OverviewScreen() {
  const assets = useFinanceStore((state) => state.assets);
  const liabilities = useLiabilityStore((state) => state.liabilities);
  const language = useSettingsStore((state) => state.language) ?? "en";

  const netWorth = assets.reduce((sum, asset) => {
    return sum + toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
  }, 0);

  const stakingIncomePerYear = assets.reduce((sum, asset) => {
    if (asset.category !== "staking") return sum;

    const value =
      toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);

    return sum + value * (toSafeNumber(asset.rate) / 100);
  }, 0);

  const depositIncomePerYear = assets.reduce((sum, asset) => {
    if (asset.category !== "deposit") return sum;

    const value =
      toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);

    return sum + value * (toSafeNumber(asset.rate) / 100);
  }, 0);

  const otherPassiveIncomePerYear = assets.reduce((sum, asset) => {
    if (asset.category === "staking" || asset.category === "deposit") {
      return sum;
    }

    const value =
      toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
    const rate = toSafeNumber(asset.rate);

    if (rate <= 0) return sum;

    return sum + value * (rate / 100);
  }, 0);

  const passiveIncomePerYear =
    stakingIncomePerYear + depositIncomePerYear + otherPassiveIncomePerYear;

  const liabilitiesPerYear = liabilities.reduce((sum, liability) => {
    return sum + getLiabilityYearlyValue(liability);
  }, 0);

  const dailyBalance = (passiveIncomePerYear - liabilitiesPerYear) / 365;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t(language, "overview")}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t(language, "netWorth")}</Text>
        <Text style={[styles.value, { color: getNetWorthColor(netWorth) }]}>
          {netWorth.toFixed(2)} EUR
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t(language, "passiveIncomePerYear")}</Text>
        <Text
          style={[
            styles.value,
            { color: getPassiveIncomeColor(passiveIncomePerYear) },
          ]}
        >
          {passiveIncomePerYear.toFixed(2)} EUR
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.breakdownTitle}>
          {t(language, "passiveIncomeSources")}
        </Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{t(language, "staking")}</Text>
          <Text style={styles.breakdownValue}>
            {stakingIncomePerYear.toFixed(2)} EUR
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{t(language, "deposits")}</Text>
          <Text style={styles.breakdownValue}>
            {depositIncomePerYear.toFixed(2)} EUR
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{t(language, "other")}</Text>
          <Text style={styles.breakdownValue}>
            {otherPassiveIncomePerYear.toFixed(2)} EUR
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t(language, "liabilitiesPerYear")}</Text>
        <Text style={[styles.value, { color: "#ff4d4f" }]}>
          {liabilitiesPerYear.toFixed(2)} EUR
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t(language, "dailyBalance")}</Text>
        <Text
          style={[
            styles.value,
            styles.dailyBalanceValue,
            { color: getDailyBalanceColor(dailyBalance) },
          ]}
        >
          {dailyBalance.toFixed(2)} EUR
        </Text>
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
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#1b2130",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },

  label: {
    color: "#8b93a7",
    fontSize: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  value: {
    fontSize: 26,
    fontWeight: "700",
  },

  dailyBalanceValue: {
    fontSize: 30,
  },

  breakdownTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  breakdownLabel: {
    color: "#8b93a7",
    fontSize: 15,
  },

  breakdownValue: {
    color: "#3fb950",
    fontSize: 15,
    fontWeight: "600",
  },
});
