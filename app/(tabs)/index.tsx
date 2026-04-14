import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { Stack } from "expo-router";
import { useFinanceStore } from "../../src/store/financeStore";
import { useLiabilityStore } from "../../src/store/liabilityStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { t } from "../../src/i18n";

const BG = "#050816";
const CARD = "rgba(10, 14, 28, 0.78)";
const CARD_STRONG = "rgba(10, 16, 32, 0.94)";
const BORDER = "rgba(96, 165, 250, 0.16)";
const BORDER_SOFT = "rgba(148, 163, 184, 0.10)";
const TEXT = "#EAF2FF";
const MUTED = "#7C8AA5";
const ACCENT = "#3B82F6";
const POSITIVE = "#22C55E";
const NEGATIVE = "#EF4444";
const PINK = "#EC4899";
const VIOLET = "#8B5CF6";
const CYAN = "#22D3EE";

type AppLanguage = "en" | "de" | "uk";

function toSafeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getLiabilityYearlyValue(liability: any): number {
  if (toSafeNumber(liability?.yearlyPayment) > 0) {
    return toSafeNumber(liability.yearlyPayment);
  }

  if (toSafeNumber(liability?.paymentAmount) > 0) {
    const amount = toSafeNumber(liability.paymentAmount);
    const period = String(liability?.paymentPeriod ?? "").toLowerCase();

    if (period === "daily") return amount * 365;
    if (period === "monthly") return amount * 12;
    if (period === "yearly") return amount;
  }

  if (
    toSafeNumber(liability?.amount) > 0 &&
    String(liability?.period ?? "").toLowerCase() === "yearly"
  ) {
    return toSafeNumber(liability.amount);
  }

  return 0;
}


function buildChartPath(values: number[], width: number, height: number, pad = 10) {
  if (!values.length) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = values.map((value, index) => {
    const x = pad + (values.length === 1 ? innerW / 2 : (index / (values.length - 1)) * innerW);
    const y = pad + innerH - ((value - min) / range) * innerH;
    return { x, y };
  });

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    const midX = (prev.x + curr.x) / 2;

    d += ` Q ${midX} ${prev.y}, ${curr.x} ${curr.y}`;
  }

  return d;
}

function formatMoney(value: number, currency: string) {
  const sign = value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(2)} ${currency}`;
}

export default function OverviewScreen() {
  const assets = useFinanceStore((state: any) => state.assets ?? []);
  const activeIncomePerYear = useFinanceStore((state: any) => state.activeIncomePerYear ?? 0);
  const activeExpensesPerYear = useFinanceStore((state: any) => state.activeExpensesPerYear ?? 0);
  const liabilities = useLiabilityStore((state: any) => state.liabilities ?? []);
  const history = useFinanceStore((state: any) => state.history ?? []);
  const recordTodaySnapshot = useFinanceStore((state: any) => state.recordTodaySnapshot);

  React.useEffect(() => {
    recordTodaySnapshot();
  }, []);
  const language = (useSettingsStore((state: any) => state.language) ?? "en") as AppLanguage;
  const displayCurrency = useSettingsStore((state: any) => state.displayCurrency ?? "EUR");
  const [showNetWorth, setShowNetWorth] = useState(false);
  const [showPassive, setShowPassive] = useState(false);

  const [showAnalytics, setShowAnalytics] = useState(true);


  const copy = useMemo(
    () => ({
      badge: "DAILY BALANCE",
      hero:
        language === "uk"
          ? "Чистий денний баланс"
          : language === "de"
          ? "Netto-Tagesbilanz"
          : "Net daily balance",
      capital: t(language, "capital"),
      passiveIncome:
        language === "uk"
          ? "Пасивний дохід"
          : language === "de"
          ? "Passives Einkommen"
          : "Passive income",
      activeIncome:
        language === "uk"
          ? "Активний дохід"
          : language === "de"
          ? "Aktives Einkommen"
          : "Active income",
      activeExpenses:
        language === "uk"
          ? "Активні витрати"
          : language === "de"
          ? "Aktive Ausgaben"
          : "Active expenses",
      liabilities: t(language, "liabilities"),
      yearly:
        language === "uk"
          ? "за рік"
          : language === "de"
          ? "pro Jahr"
          : "per year",
      financialBase:
        language === "uk"
          ? "Фінансова база"
          : language === "de"
          ? "Finanzielle Basis"
          : "Financial base",
      breakdown:
        language === "uk"
          ? "Структура доходу"
          : language === "de"
          ? "Einkommensstruktur"
          : "Income structure",
      staking:
        language === "uk"
          ? "Стейкінг"
          : language === "de"
          ? "Staking"
          : "Staking",
      deposits: t(language, "deposits"),
      other:
        language === "uk"
          ? "Інше"
          : language === "de"
          ? "Sonstiges"
          : "Other",
      inflow: t(language, "inflow"),
      outflow: t(language, "outflow"),
      status:
        language === "uk"
          ? "Стан"
          : language === "de"
          ? "Status"
          : "Status",
      stable:
        language === "uk"
          ? "Стабільно"
          : language === "de"
          ? "Stabil"
          : "Stable",
      warning:
        language === "uk"
          ? "Увага"
          : language === "de"
          ? "Achtung"
          : "Warning",
      strong:
        language === "uk"
          ? "Сильна позиція"
          : language === "de"
          ? "Starke Position"
          : "Strong position",
      noteGood:
        language === "uk"
          ? "Баланс позитивний. Система працює в плюс."
          : language === "de"
          ? "Die Bilanz ist positiv. Das System arbeitet im Plus."
          : "Balance is positive. The system is running in the green.",
      noteMid:
        language === "uk"
          ? "Баланс близький до нуля. Варто трохи посилити запас."
          : language === "de"
          ? "Die Bilanz liegt nahe null. Ein kleiner Puffer wäre gut."
          : "Balance is near zero. A bit more buffer would help.",
      noteBad:
        language === "uk"
          ? "Баланс негативний. Потрібно зменшити річний відтік."
          : language === "de"
          ? "Die Bilanz ist negativ. Der jährliche Abfluss sollte reduziert werden."
          : "Balance is negative. Yearly outflow should be reduced.",
    }),
    [language]
  );

  const metrics = useMemo(() => {
    const netWorth = assets.reduce((sum: number, asset: any) => {
      const quantity = toSafeNumber(asset?.quantity);
      const currentPrice = toSafeNumber(asset?.currentPrice);
      return sum + quantity * currentPrice;
    }, 0);

    const stakingIncome = assets
      .filter((asset: any) => String(asset?.category) === "staking")
      .reduce((sum: number, asset: any) => {
        const value = toSafeNumber(asset?.quantity) * toSafeNumber(asset?.currentPrice);
        const rate = toSafeNumber(asset?.rate);
        return sum + (value * rate) / 100;
      }, 0);

    const depositIncome = assets
      .filter((asset: any) => String(asset?.category) === "deposit")
      .reduce((sum: number, asset: any) => {
        const value = toSafeNumber(asset?.quantity) * toSafeNumber(asset?.currentPrice);
        const rate = toSafeNumber(asset?.rate);
        return sum + (value * rate) / 100;
      }, 0);

    const totalPassiveIncome = assets.reduce((sum: number, asset: any) => {
      const value = toSafeNumber(asset?.quantity) * toSafeNumber(asset?.currentPrice);
      const rate = toSafeNumber(asset?.rate);
      return sum + (value * rate) / 100;
    }, 0);

    const liabilitiesPerYear = liabilities.reduce((sum: number, liability: any) => {
      return sum + getLiabilityYearlyValue(liability);
    }, 0);

    const otherPassiveIncome = Math.max(0, totalPassiveIncome - stakingIncome - depositIncome);
    const yearlyInflow = toSafeNumber(activeIncomePerYear) + totalPassiveIncome;
    const yearlyOutflow = toSafeNumber(activeExpensesPerYear) + liabilitiesPerYear;
    const dailyBalance = (yearlyInflow - yearlyOutflow) / 365;

    return {
      netWorth,
      stakingIncome,
      depositIncome,
      otherPassiveIncome,
      totalPassiveIncome,
      liabilitiesPerYear,
      yearlyInflow,
      yearlyOutflow,
      dailyBalance,
    };
  }, [assets, liabilities, activeIncomePerYear, activeExpensesPerYear]);

  const balanceColor =
    metrics.dailyBalance > 0 ? POSITIVE : metrics.dailyBalance < 0 ? NEGATIVE : TEXT;

  const statusText =
    metrics.dailyBalance > 5
      ? copy.strong
      : metrics.dailyBalance >= -5
      ? copy.stable
      : copy.warning;

  const noteText =
    metrics.dailyBalance > 5
      ? copy.noteGood
      : metrics.dailyBalance >= -5
      ? copy.noteMid
      : copy.noteBad;

  const flowTotal = Math.max(metrics.yearlyInflow + metrics.yearlyOutflow, 1);
  const inflowPercent = `${(metrics.yearlyInflow / flowTotal) * 100}%`;
  const outflowPercent = `${(metrics.yearlyOutflow / flowTotal) * 100}%`;
  const chartHistory = history.slice(-20);

  const dailyBalancePath = useMemo(
    () =>
      buildChartPath(
        chartHistory.map((item: any) => toSafeNumber(item?.dailyBalance)),
        320,
        150
      ),
    [chartHistory]
  );

  const netWorthPath = useMemo(
    () =>
      buildChartPath(
        chartHistory.map((item: any) => toSafeNumber(item?.netWorth)),
        320,
        150
      ),
    [chartHistory]
  );


  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.bgOrb, styles.bgBlue]} />
      <View style={[styles.bgOrb, styles.bgGreen]} />
      <View style={[styles.bgOrb, styles.bgPink]} />
      <View style={[styles.bgOrb, styles.bgViolet]} />
      <View style={[styles.bgLine, styles.bgLineA]} />
      <View style={[styles.bgLine, styles.bgLineB]} />
      <View style={[styles.gridOverlay, styles.gridHorizontal]} />
      <View style={[styles.gridOverlay, styles.gridVertical]} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />
          <View style={styles.heroGlowC} />

          <View style={styles.heroTopRow}>
            <Text style={styles.badge}>{copy.badge}</Text>
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: metrics.dailyBalance >= 0 ? POSITIVE : NEGATIVE },
                ]}
              />
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>

          <Text style={styles.heroLabel}>{copy.hero}</Text>
          <Text style={[styles.heroValue, { color: balanceColor }]}>
            {formatMoney(metrics.dailyBalance, displayCurrency)}
          </Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.miniMetric}>
              <Text style={styles.miniMetricLabel}>{copy.inflow}</Text>
              <Text style={[styles.miniMetricValue, { color: POSITIVE }]}>
                {formatMoney(metrics.yearlyInflow, displayCurrency)}
              </Text>
            </View>

            <View style={styles.miniMetricDivider} />

            <View style={styles.miniMetric}>
              <Text style={styles.miniMetricLabel}>{copy.outflow}</Text>
              <Text style={[styles.miniMetricValue, { color: NEGATIVE }]}>
                {formatMoney(metrics.yearlyOutflow, displayCurrency)}
              </Text>
            </View>
          </View>

          <View style={styles.flowShell}>
            <View style={[styles.flowIn, { width: inflowPercent }]} />
            <View style={[styles.flowOut, { width: outflowPercent }]} />
          </View>
        </View>
<View style={styles.capitalCard}>
          <View style={styles.capitalGlowBlue} />
          <View style={styles.capitalGlowGreen} />
          <View style={styles.capitalGlowPink} />
          <Text style={styles.capitalLabel}>{copy.capital}</Text>
          <Text style={styles.capitalValue}>
            {formatMoney(metrics.netWorth, displayCurrency)}
          </Text>
          <Text style={styles.capitalSub}>{copy.financialBase}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{copy.passiveIncome}</Text>
            <Text style={[styles.statValue, styles.greenText]}>
              {formatMoney(metrics.totalPassiveIncome, displayCurrency)}
            </Text>
            <Text style={styles.statSub}>{copy.yearly}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{copy.activeIncome}</Text>
            <Text style={[styles.statValue, styles.greenText]}>
              {formatMoney(toSafeNumber(activeIncomePerYear), displayCurrency)}
            </Text>
            <Text style={styles.statSub}>{copy.yearly}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{copy.activeExpenses}</Text>
            <Text style={[styles.statValue, styles.redText]}>
              {formatMoney(toSafeNumber(activeExpensesPerYear), displayCurrency)}
            </Text>
            <Text style={styles.statSub}>{copy.yearly}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{copy.liabilities}</Text>
            <Text style={[styles.statValue, styles.redText]}>
              {formatMoney(metrics.liabilitiesPerYear, displayCurrency)}
            </Text>
            <Text style={styles.statSub}>{copy.yearly}</Text>
          </View>
        </View>

        {showAnalytics ? (
          <>
            <View style={styles.panel}>
              <View style={styles.panelGlow} />
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>{copy.breakdown}</Text>
                <Pressable
                  onPress={() => setShowAnalytics((v) => !v)}
                  style={styles.analyticsToggle}
                >
                  <Text style={styles.analyticsToggleText}>▾</Text>
                </Pressable>
              </View>

              <View style={styles.dataRow}>
                <View style={styles.dataRowLeft}>
                  <View style={[styles.lineDot, { backgroundColor: POSITIVE }]} />
                  <Text style={styles.dataRowLabel}>{copy.staking}</Text>
                </View>
                <Text style={[styles.dataRowValue, styles.greenText]}>
                  {formatMoney(metrics.stakingIncome, displayCurrency)}
                </Text>
              </View>

              <View style={styles.dataRow}>
                <View style={styles.dataRowLeft}>
                  <View style={[styles.lineDot, { backgroundColor: ACCENT }]} />
                  <Text style={styles.dataRowLabel}>{copy.deposits}</Text>
                </View>
                <Text style={styles.dataRowValue}>
                  {formatMoney(metrics.depositIncome, displayCurrency)}
                </Text>
              </View>

              <View style={styles.dataRow}>
                <View style={styles.dataRowLeft}>
                  <View style={[styles.lineDot, { backgroundColor: CYAN }]} />
                  <Text style={styles.dataRowLabel}>{copy.other}</Text>
                </View>
                <Text style={styles.dataRowValue}>
                  {formatMoney(metrics.otherPassiveIncome, displayCurrency)}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.panel}>
            <View style={styles.panelGlow} />
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{copy.breakdown}</Text>
              <Pressable
                onPress={() => setShowAnalytics((v) => !v)}
                style={styles.analyticsToggle}
              >
                <Text style={styles.analyticsToggleText}>▸</Text>
              </Pressable>
            </View>
          </View>
        )}

        {showAnalytics ? (
        <View style={styles.chartCard}>
          <View style={styles.chartCardHeader}>
            <Text style={styles.chartTitle}>Статистика</Text>
            <Text style={styles.chartHint}>Денний баланс</Text>
          </View>

          <Svg width="100%" height="150" viewBox="0 0 320 150">
            <Path d="M 10 20 L 310 20" stroke="rgba(148,163,184,0.10)" strokeWidth="1" fill="none" />
            <Path d="M 10 50 L 310 50" stroke="rgba(148,163,184,0.10)" strokeWidth="1" fill="none" />
            <Path d="M 10 80 L 310 80" stroke="rgba(148,163,184,0.10)" strokeWidth="1" fill="none" />
            <Path d="M 10 110 L 310 110" stroke="rgba(148,163,184,0.10)" strokeWidth="1" fill="none" />
            <Path d="M 10 140 L 310 140" stroke="rgba(148,163,184,0.16)" strokeWidth="1" fill="none" />

            <Path d="M 10 20 L 10 140" stroke="rgba(148,163,184,0.08)" strokeWidth="1" fill="none" />
            <Path d="M 85 20 L 85 140" stroke="rgba(148,163,184,0.08)" strokeWidth="1" fill="none" />
            <Path d="M 160 20 L 160 140" stroke="rgba(148,163,184,0.08)" strokeWidth="1" fill="none" />
            <Path d="M 235 20 L 235 140" stroke="rgba(148,163,184,0.08)" strokeWidth="1" fill="none" />
            <Path d="M 310 20 L 310 140" stroke="rgba(148,163,184,0.08)" strokeWidth="1" fill="none" />

            <>
              <Path d={dailyBalancePath} stroke="rgba(34,197,94,0.25)" strokeWidth="6" fill="none" />
              <Path d={dailyBalancePath} stroke="#22C55E" strokeWidth="2.5" fill="none" />
            </>
            {showNetWorth ? (
              <>
                <Path d={netWorthPath} stroke="rgba(96,165,250,0.25)" strokeWidth="6" fill="none" />
                <Path d={netWorthPath} stroke="#60A5FA" strokeWidth="2.5" fill="none" />
              </>
            ) : null}
          </Svg>

          <View style={styles.chartToggles}>
            <Pressable
              onPress={() => setShowNetWorth((v) => !v)}
              style={styles.toggleOption}
            >
              <Text style={styles.toggleCheckbox}>
                {showNetWorth ? "☑" : "☐"}
              </Text>
              <Text style={styles.toggleText}>Капітал</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowPassive((v) => !v)}
              style={styles.toggleOption}
            >
              <Text style={styles.toggleCheckbox}>
                {showPassive ? "☑" : "☐"}
              </Text>
              <Text style={styles.toggleText}>Пасивний дохід</Text>
            </Pressable>
          </View>
        </View>
        ) : null}
        <View style={styles.noteCard}>
          <View style={styles.noteGlow} />
          <Text style={styles.noteTitle}>{copy.status}</Text>
          <Text style={styles.noteText}>{noteText}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: "rgba(10, 14, 28, 0.7)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
    padding: 16,
  },
  chartTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  chartCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chartHint: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  chartToggles: {
    marginTop: 10,
    gap: 10,
  },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  toggleCheckbox: {
    color: "#BFDBFE",
    fontSize: 15,
    fontWeight: "800",
    width: 20,
  },
  toggleRow: {
    paddingVertical: 4,
  },
  toggleRowDisabled: {
    opacity: 0.45,
  },
  toggleText: {
    color: "#C7D2E3",
    fontSize: 13,
    fontWeight: "700",
  },
  toggleTextDisabled: {
    color: "#64748B",
  },
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  bgOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  bgBlue: {
    top: -110,
    right: -70,
    width: 250,
    height: 250,
    backgroundColor: "rgba(59,130,246,0.15)",
  },
  bgGreen: {
    top: 220,
    left: -100,
    width: 200,
    height: 200,
    backgroundColor: "rgba(34,197,94,0.09)",
  },
  bgPink: {
    bottom: 180,
    right: -70,
    width: 220,
    height: 220,
    backgroundColor: "rgba(236,72,153,0.08)",
  },
  bgViolet: {
    bottom: 60,
    left: -80,
    width: 230,
    height: 230,
    backgroundColor: "rgba(139,92,246,0.08)",
  },
  bgLine: {
    position: "absolute",
    height: 1,
    borderRadius: 999,
  },
  bgLineA: {
    top: 170,
    left: 30,
    right: 60,
    backgroundColor: "rgba(34,211,238,0.12)",
  },
  bgLineB: {
    top: 520,
    left: 70,
    right: 20,
    backgroundColor: "rgba(236,72,153,0.10)",
  },
  gridOverlay: {
    position: "absolute",
    opacity: 0.06,
  },
  gridHorizontal: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#60A5FA",
  },
  gridVertical: {
    top: 0,
    bottom: 0,
    left: 40,
    width: 1,
    backgroundColor: "#60A5FA",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
    gap: 14,
  },

  heroCard: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    overflow: "hidden",
    shadowColor: ACCENT,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  heroGlowA: {
    position: "absolute",
    top: -60,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.22)",
  },
  heroGlowB: {
    position: "absolute",
    bottom: -55,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(139,92,246,0.14)",
  },
  heroGlowC: {
    position: "absolute",
    top: 70,
    left: 140,
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.08)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  analyticsToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(12, 18, 34, 0.78)",
    borderWidth: 1,
    borderColor: BORDER_SOFT,
  },
  analyticsToggleText: {
    color: "#BFDBFE",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 16,
  },
  badge: {
    color: "#A5D8FF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(12, 18, 34, 0.78)",
    borderWidth: 1,
    borderColor: BORDER_SOFT,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  statusText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: "700",
  },
  heroLabel: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 18,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "rgba(8, 12, 24, 0.54)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    padding: 12,
  },
  miniMetric: {
    flex: 1,
  },
  miniMetricDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: BORDER_SOFT,
    marginHorizontal: 12,
  },
  miniMetricLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  miniMetricValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  flowShell: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: CARD_STRONG,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    flexDirection: "row",
  },
  flowIn: {
    height: "100%",
    backgroundColor: POSITIVE,
  },
  flowOut: {
    height: "100%",
    backgroundColor: NEGATIVE,
  },

  capitalCard: {
    backgroundColor: "rgba(12, 18, 36, 0.92)",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.22)",
    padding: 20,
    overflow: "hidden",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  capitalGlowBlue: {
    position: "absolute",
    top: -70,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.24)",
  },
  capitalGlowGreen: {
    position: "absolute",
    bottom: -70,
    left: -30,
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  capitalGlowPink: {
    position: "absolute",
    top: 50,
    left: 120,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(236,72,153,0.08)",
  },
  capitalLabel: {
    color: "#D6E8FF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  capitalValue: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    marginBottom: 8,
    textShadowColor: "rgba(96,165,250,0.25)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  capitalSub: {
    color: "#B7C7DE",
    fontSize: 12,
    fontWeight: "500",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48.2%",
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  statLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  statValue: {
    color: TEXT,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  statSub: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "500",
  },
  greenText: {
    color: POSITIVE,
  },
  redText: {
    color: NEGATIVE,
  },

  panel: {
    backgroundColor: CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER_SOFT,
    padding: 16,
    overflow: "hidden",
    shadowColor: VIOLET,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  panelGlow: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(139,92,246,0.08)",
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  panelTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  panelHint: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "600",
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.08)",
  },
  dataRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lineDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  dataRowLabel: {
    color: "#D5E0EF",
    fontSize: 14,
    fontWeight: "600",
  },
  dataRowValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
  },

  noteCard: {
    backgroundColor: "rgba(19, 26, 48, 0.86)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.16)",
    padding: 15,
    overflow: "hidden",
    shadowColor: PINK,
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  noteGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 999,
    right: -30,
    bottom: -50,
    backgroundColor: "rgba(236,72,153,0.08)",
  },
  noteTitle: {
    color: "#BFDBFE",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  noteText: {
    color: "#D8E4F5",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
});
