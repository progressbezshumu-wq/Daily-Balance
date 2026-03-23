import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getLiabilityYearlyValue(liability: any) {
  return toSafeNumber(liability?.yearlyPayment);
}

function getOverviewAdvice(
  language: "en" | "de" | "uk",
  dailyBalance: number,
  passiveIncomePerDay: number,
  activeIncomePerDay: number,
  passiveExpensesPerYear: number
) {
  if (language === "uk") {
    if (dailyBalance <= -50) {
      return {
        title: "Порада",
        text: "Баланс сильно негативний. Спершу зменш пасиви або річні витрати, а вже потім нарощуй нові активи.",
      };
    }

    if (dailyBalance < 0) {
      return {
        title: "Порада",
        text: "Баланс нижче нуля. Спробуй підняти активний дохід або додати більше активів із пасивним доходом.",
      };
    }

    if (passiveIncomePerDay < activeIncomePerDay * 0.25) {
      return {
        title: "Порада",
        text: "Пасивний дохід поки займає малу частку. Зверни увагу на інструменти, які дають стабільний дохід щодня.",
      };
    }

    if (passiveExpensesPerYear > 0 && dailyBalance > 0) {
      return {
        title: "Порада",
        text: "Баланс уже позитивний. Наступний сильний крок — поступово зменшувати пасиви, щоб прискорити зростання.",
      };
    }

    return {
      title: "Порада",
      text: "Баланс виглядає добре. Продовжуй укріплювати капітал і збільшувати частку пасивного доходу.",
    };
  }

  if (language === "de") {
    if (dailyBalance <= -50) {
      return {
        title: "Hinweis",
        text: "Die Bilanz ist stark negativ. Reduziere zuerst Verbindlichkeiten oder Jahresausgaben und baue dann neue Vermögenswerte aus.",
      };
    }

    if (dailyBalance < 0) {
      return {
        title: "Hinweis",
        text: "Die Bilanz ist unter null. Versuche das aktive Einkommen zu erhöhen oder mehr Vermögenswerte mit passivem Einkommen aufzubauen.",
      };
    }

    if (passiveIncomePerDay < activeIncomePerDay * 0.25) {
      return {
        title: "Hinweis",
        text: "Das passive Einkommen ist noch klein. Konzentriere dich auf Instrumente, die jeden Tag stabilen Ertrag bringen.",
      };
    }

    if (passiveExpensesPerYear > 0 && dailyBalance > 0) {
      return {
        title: "Hinweis",
        text: "Die Bilanz ist bereits positiv. Der nächste starke Schritt ist, Verbindlichkeiten schrittweise zu senken.",
      };
    }

    return {
      title: "Hinweis",
      text: "Die Bilanz sieht gut aus. Stärke weiter dein Kapital und erhöhe den Anteil des passiven Einkommens.",
    };
  }

  if (dailyBalance <= -50) {
    return {
      title: "Insight",
      text: "Your balance is deeply negative. First reduce liabilities or yearly expenses, then focus on growing new assets.",
    };
  }

  if (dailyBalance < 0) {
    return {
      title: "Insight",
      text: "Your balance is below zero. Try increasing active income or adding more assets that generate passive income.",
    };
  }

  if (passiveIncomePerDay < activeIncomePerDay * 0.25) {
    return {
      title: "Insight",
      text: "Passive income is still a small share. Focus on tools that can generate steadier income every day.",
    };
  }

  if (passiveExpensesPerYear > 0 && dailyBalance > 0) {
    return {
      title: "Insight",
      text: "Your balance is already positive. The next strong move is to gradually reduce liabilities.",
    };
  }

  return {
    title: "Insight",
    text: "Your balance looks healthy. Keep strengthening capital and growing the passive income share.",
  };
}

export default function OverviewScreen() {
  const assets = useFinanceStore((state) => state.assets);
  const activeIncomePerYear = useFinanceStore((state) => state.activeIncomePerYear);
  const activeExpensesPerYear = useFinanceStore((state) => state.activeExpensesPerYear);
  const liabilities = useLiabilityStore((state) => state.liabilities);
  const language = (useSettingsStore((state) => state.language) ?? "en") as "en" | "de" | "uk";

  const netWorth = assets.reduce((sum, asset) => {
    return sum + toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
  }, 0);

  const stakingIncomePerYear = assets.reduce((sum, asset) => {
    if (asset.category !== "staking") return sum;
    const value = toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
    return sum + value * (toSafeNumber(asset.rate) / 100);
  }, 0);

  const depositIncomePerYear = assets.reduce((sum, asset) => {
    if (asset.category !== "deposit") return sum;
    const value = toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
    return sum + value * (toSafeNumber(asset.rate) / 100);
  }, 0);

  const otherPassiveIncomePerYear = assets.reduce((sum, asset) => {
    if (asset.category === "staking" || asset.category === "deposit") return sum;

    const value = toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
    const rate = toSafeNumber(asset.rate);

    if (rate <= 0) return sum;
    return sum + value * (rate / 100);
  }, 0);

  const passiveIncomePerYear =
    stakingIncomePerYear + depositIncomePerYear + otherPassiveIncomePerYear;

  const passiveExpensesPerYear = liabilities.reduce((sum, liability) => {
    return sum + getLiabilityYearlyValue(liability);
  }, 0);

  const totalIncomePerYear = activeIncomePerYear + passiveIncomePerYear;
  const totalExpensesPerYear = activeExpensesPerYear + passiveExpensesPerYear;

  const activeIncomePerDay = activeIncomePerYear / 365;
  const passiveIncomePerDay = passiveIncomePerYear / 365;
  const dailyBalance = (totalIncomePerYear - totalExpensesPerYear) / 365;
  const dailyBalanceColor = getDailyBalanceColor(dailyBalance);

  const incomeBase = activeIncomePerDay + passiveIncomePerDay;
  const activeIncomePercent = incomeBase > 0 ? (activeIncomePerDay / incomeBase) * 100 : 0;
  const passiveIncomePercent = incomeBase > 0 ? (passiveIncomePerDay / incomeBase) * 100 : 0;

  const advice = getOverviewAdvice(
    language,
    dailyBalance,
    passiveIncomePerDay,
    activeIncomePerDay,
    passiveExpensesPerYear
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        bounces
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t(language, "overview")}</Text>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>{t(language, "dailyBalance")}</Text>

            <View style={styles.coinWrap}>
              <View style={[styles.coinOuter, { borderColor: dailyBalanceColor }]}>
                <View style={styles.coinGlossPrimary} />
                <View style={styles.coinGlossSecondary} />
                <View style={styles.coinInner}>
                  <Text style={styles.coinCurrency}>EUR</Text>
                  <Text style={[styles.coinValue, { color: dailyBalanceColor }]}>
                    {dailyBalance.toFixed(2)}
                  </Text>
                  <Text style={styles.coinSubtext}>{t(language, "dailyBalance")}</Text>
                </View>
              </View>
            </View>

            <View style={styles.incomeSplitCard}>
              <Text style={styles.incomeSplitTitle}>{t(language, "incomePerDay")}</Text>

              <View style={styles.splitRow}>
                <View style={[styles.splitHalf, styles.splitHalfLeft]}>
                  <Text style={styles.splitLabel}>{t(language, "active")}</Text>
                  <Text style={[styles.splitValue, { color: "#4f8cff" }]}>
                    {activeIncomePerDay.toFixed(2)} EUR
                  </Text>
                  <Text style={styles.splitPercent}>
                    {activeIncomePercent.toFixed(0)}%
                  </Text>
                </View>

                <View style={[styles.splitHalf, styles.splitHalfRight]}>
                  <Text style={styles.splitLabel}>{t(language, "passive")}</Text>
                  <Text style={[styles.splitValue, { color: "#3fb950" }]}>
                    {passiveIncomePerDay.toFixed(2)} EUR
                  </Text>
                  <Text style={styles.splitPercent}>
                    {passiveIncomePercent.toFixed(0)}%
                  </Text>
                </View>
              </View>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barActive,
                    { width: `${Math.max(0, Math.min(100, activeIncomePercent))}%` },
                  ]}
                />
                <View
                  style={[
                    styles.barPassive,
                    { width: `${Math.max(0, Math.min(100, passiveIncomePercent))}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.capitalCard}>
              <View style={styles.capitalHeader}>
                <Text style={styles.capitalTitle}>{t(language, "capital")}</Text>
                <Text style={styles.capitalSubtitle}>{t(language, "yourFinancialBase")}</Text>
              </View>

              <Text style={[styles.capitalValue, { color: getNetWorthColor(netWorth) }]}>
                {netWorth.toFixed(2)} EUR
              </Text>
            </View>

            <View style={styles.adviceCard}>
              <Text style={styles.adviceTitle}>{advice.title}</Text>
              <Text style={styles.adviceText}>{advice.text}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b0f14",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    backgroundColor: "#0b0f14",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: "#151b26",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#202938",
  },
  heroLabel: {
    color: "#8b93a7",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 18,
  },
  coinWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  coinOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#1a2231",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coinInner: {
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: "#111723",
    borderWidth: 1,
    borderColor: "#2d384c",
    alignItems: "center",
    justifyContent: "center",
  },
  coinGlossPrimary: {
    position: "absolute",
    top: 22,
    left: 24,
    width: 120,
    height: 58,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    transform: [{ rotate: "-18deg" }],
  },
  coinGlossSecondary: {
    position: "absolute",
    bottom: 34,
    right: 26,
    width: 78,
    height: 30,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    transform: [{ rotate: "-18deg" }],
  },
  coinCurrency: {
    color: "#8b93a7",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  coinValue: {
    fontSize: 36,
    fontWeight: "800",
  },
  coinSubtext: {
    color: "#8b93a7",
    fontSize: 13,
    marginTop: 8,
  },
  incomeSplitCard: {
    marginTop: 22,
    backgroundColor: "#101722",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#202938",
  },
  incomeSplitTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  splitRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  splitHalf: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#151e2b",
  },
  splitHalfLeft: {
    borderWidth: 1,
    borderColor: "#2d436d",
  },
  splitHalfRight: {
    borderWidth: 1,
    borderColor: "#244b31",
  },
  splitLabel: {
    color: "#8b93a7",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  splitValue: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  splitPercent: {
    color: "#c9d1d9",
    fontSize: 13,
    fontWeight: "600",
  },
  barTrack: {
    height: 12,
    backgroundColor: "#0e141d",
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#243041",
  },
  barActive: {
    height: "100%",
    backgroundColor: "#4f8cff",
  },
  barPassive: {
    height: "100%",
    backgroundColor: "#3fb950",
  },
  capitalCard: {
    marginTop: 18,
    backgroundColor: "#101722",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#202938",
  },
  capitalHeader: {
    marginBottom: 10,
  },
  capitalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  capitalSubtitle: {
    color: "#8b93a7",
    fontSize: 13,
  },
  capitalValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  adviceCard: {
    marginTop: 18,
    backgroundColor: "#16141f",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2a2840",
  },
  adviceTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  adviceText: {
    color: "#c9d1d9",
    fontSize: 14,
    lineHeight: 22,
  },
});