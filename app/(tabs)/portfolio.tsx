import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { convertCurrencySync, fetchLiveRates } from "../../src/utils/currency";

function toSafeNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function format(v: number, c: string) {
  return `${toSafeNumber(v).toFixed(2)} ${c}`;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describePieSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function pct(v: number) {
  return `${toSafeNumber(v).toFixed(1)}%`;
}

type CollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.card}>
      <Pressable style={styles.sectionHeader} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#94A3B8"
        />
      </Pressable>

      {open ? children : null}
    </View>
  );
}

type DonutSegment = {
  key: string;
  label: string;
  value: number;
  share: number;
  color: string;
};



function PortfolioDonut({
  segments,
}: {
  segments: DonutSegment[];
}) {
  const size = 240;
  const cx = 120;
  const cy = 116;
  const r = 82;
  const depth = 10;

  let angleCursor = 0;

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size + depth}>
        <Circle
          cx={cx}
          cy={cy + depth}
          r={r}
          fill="rgba(8,12,22,0.95)"
        />

        <Circle
          cx={cx}
          cy={cy + depth}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="2"
        />

        {segments.map((seg) => {
          const sweep = (seg.share / 100) * 360;
          const startAngle = angleCursor;
          const endAngle = angleCursor + sweep;
          angleCursor = endAngle;

          return (
            <Path
              key={seg.key}
              d={describePieSlice(cx, cy, r, startAngle, endAngle)}
              fill={seg.color}
            />
          );
        })}

        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
}

export default function PortfolioScreen() {
  const assets = useFinanceStore((s) => s.assets);
  const history = useFinanceStore((s) => s.history);
  const recordTodaySnapshot = useFinanceStore((s) => s.recordTodaySnapshot);
  const activeIncomePerYear = useFinanceStore((s) => s.activeIncomePerYear);
  const activeExpensesPerYear = useFinanceStore((s) => s.activeExpensesPerYear);

  const language = useSettingsStore((s) => s.language) ?? "en";
  const currency = useSettingsStore((s) => s.displayCurrency) ?? "EUR";

  const copy =
    language === "uk"
      ? {
          title: "Портфель",
          distribution: "Розподіл портфеля",
          assetsTitle: "Мої активи",
          stats: "Статистика",
          totalValue: "Загальна вартість",
          invested: "Інвестовано",
          profit: "Прибуток / Збиток",
          dailyBalance: "Денний баланс",
          empty: "Поки активів немає",
          qty: "К-сть",
          avgBuy: "Сер. ціна",
          totalAssets: "К-сть активів",
          positive: "Позитивні",
          negative: "Негативні",
        }
      : language === "de"
      ? {
          title: "Portfolio",
          distribution: "Portfolio-Verteilung",
          assetsTitle: "Meine Assets",
          stats: "Statistik",
          totalValue: "Gesamtwert",
          invested: "Investiert",
          profit: "Gewinn / Verlust",
          dailyBalance: "Tagesbilanz",
          empty: "Noch keine Assets",
          qty: "Menge",
          avgBuy: "Ø Kaufpreis",
          totalAssets: "Anzahl Assets",
          positive: "Positiv",
          negative: "Negativ",
        }
      : {
          title: "Portfolio",
          distribution: "Portfolio Distribution",
          assetsTitle: "My Assets",
          stats: "Statistics",
          totalValue: "Total Value",
          invested: "Invested",
          profit: "Profit / Loss",
          dailyBalance: "Daily Balance",
          empty: "No assets yet",
          qty: "Qty",
          avgBuy: "Avg buy",
          totalAssets: "Assets count",
          positive: "Positive",
          negative: "Negative",
        };

  useEffect(() => {
    fetchLiveRates().catch(() => {});
  }, []);

  useEffect(() => {
    recordTodaySnapshot();
  }, [assets, activeIncomePerYear, activeExpensesPerYear, recordTodaySnapshot]);

  const assetRows = useMemo(() => {
    return assets.map((asset) => {
      const nativeValue =
        toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
      const nativeBuyValue =
        toSafeNumber(asset.quantity) * toSafeNumber(asset.buyPrice);
      const nativeProfit = nativeValue - nativeBuyValue;

      const value = convertCurrencySync(nativeValue, asset.currency, currency);
      const buyValue = convertCurrencySync(nativeBuyValue, asset.currency, currency);
      const currentPrice = convertCurrencySync(
        toSafeNumber(asset.currentPrice),
        asset.currency,
        currency
      );
      const buyPrice = convertCurrencySync(
        toSafeNumber(asset.buyPrice),
        asset.currency,
        currency
      );
      const profit = convertCurrencySync(nativeProfit, asset.currency, currency);

      return {
        ...asset,
        value,
        buyValue,
        currentPrice,
        buyPrice,
        profit,
      };
    });
  }, [assets, currency]);

  const portfolioValue = assetRows.reduce((sum, a) => sum + a.value, 0);
  const buyValue = assetRows.reduce((sum, a) => sum + a.buyValue, 0);
  const profit = portfolioValue - buyValue;
  const profitColor = profit >= 0 ? "#22C55E" : "#EF4444";

  const distributionColors = [
    "#3B82F6",
    "#A855F7",
    "#FB7185",
    "#22C55E",
    "#F59E0B",
    "#06B6D4",
    "#8B5CF6",
  ];

  const distribution = useMemo(() => {
    const total = portfolioValue || 1;

    return [...assetRows]
      .map((asset, index) => ({
        ...asset,
        share: (asset.value / total) * 100,
        color: distributionColors[index % distributionColors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [assetRows, portfolioValue]);

  const donutSegments: DonutSegment[] = distribution.map((item) => ({
    key: item.id,
    label: item.symbol || item.name,
    value: item.value,
    share: item.share,
    color: item.color,
  }));

  const positiveCount = assetRows.filter((a) => a.profit >= 0).length;
  const negativeCount = assetRows.filter((a) => a.profit < 0).length;

  const todayDailyBalance =
    history.length > 0 ? toSafeNumber(history[history.length - 1]?.dailyBalance) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{copy.totalValue}</Text>
          <Text style={styles.heroValue}>{format(portfolioValue, currency)}</Text>

          <View style={styles.heroMetaRow}>
            <View>
              <Text style={styles.heroMetaLabel}>{copy.invested}</Text>
              <Text style={styles.heroMetaValue}>{format(buyValue, currency)}</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.heroMetaLabel}>{copy.profit}</Text>
              <Text style={[styles.heroMetaValue, { color: profitColor }]}>
                {format(profit, currency)}
              </Text>
            </View>
          </View>

          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>
              {copy.dailyBalance}: {format(todayDailyBalance, currency)}
            </Text>
          </View>

          <View style={styles.heroChartRow}>
            <PortfolioDonut
              segments={donutSegments}
            />

            <View style={styles.heroLegend}>
              {distribution.slice(0, 5).map((item, index) => (
                <View key={`${item.id}-legend-${index}`} style={styles.heroLegendRow}>
                  <View
                    style={[
                      styles.heroLegendDot,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <View style={styles.heroLegendTextWrap}>
                    <Text style={styles.heroLegendTicker} numberOfLines={1}>
                      {item.symbol || item.name}
                    </Text>
                    <Text style={styles.heroLegendPercent}>
                      {pct(item.share)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <CollapsibleSection title={copy.distribution} defaultOpen>
          <View style={styles.distributionBar}>
            {distribution.map((item, index) => (
              <View
                key={`${item.id}-bar-${index}`}
                style={{
                  width: `${item.share}%`,
                  backgroundColor: item.color,
                  height: 18,
                }}
              />
            ))}
          </View>

          <View style={styles.distributionList}>
            {distribution.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.distributionRow}>
                <View style={styles.distributionLeft}>
                  <View
                    style={[
                      styles.distributionDot,
                      {
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.distributionName}>
                      {item.symbol || item.name}
                    </Text>
                    <Text style={styles.distributionPercent}>{pct(item.share)}</Text>
                  </View>
                </View>

                <Text style={styles.distributionValue}>{format(item.value, currency)}</Text>
              </View>
            ))}
          </View>
        </CollapsibleSection>

        <CollapsibleSection title={copy.assetsTitle} defaultOpen>
          {assetRows.length === 0 ? (
            <Text style={styles.emptyText}>{copy.empty}</Text>
          ) : (
            assetRows.map((asset, index) => (
              <View key={`${asset.id}-${index}`} style={styles.assetRow}>
                <View>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetMeta}>
                    {copy.qty}: {toSafeNumber(asset.quantity).toFixed(4)} · {copy.avgBuy}:{" "}
                    {format(asset.buyPrice, currency)}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.assetValue}>{format(asset.value, currency)}</Text>
                  <Text
                    style={[
                      styles.assetProfit,
                      { color: asset.profit >= 0 ? "#22C55E" : "#EF4444" },
                    ]}
                  >
                    {format(asset.currentPrice, currency)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </CollapsibleSection>

        <CollapsibleSection title={copy.stats} defaultOpen={false}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{copy.totalAssets}</Text>
              <Text style={styles.statValue}>{assetRows.length}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{copy.positive}</Text>
              <Text style={styles.statValue}>{positiveCount}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{copy.negative}</Text>
              <Text style={styles.statValue}>{negativeCount}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{copy.dailyBalance}</Text>
              <Text style={styles.statValue}>{format(todayDailyBalance, currency)}</Text>
            </View>
          </View>
        </CollapsibleSection>
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
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F8FAFC",
    paddingHorizontal: 16,
  },
  heroCard: {
    backgroundColor: "#0b1220",
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  heroLabel: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  heroMetaRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroMetaLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
  },
  heroMetaValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  dailyBadge: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.14)",
  },
  dailyBadgeText: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "800",
  },
  heroChartRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  donutWrap: {
    width: "58%",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingBottom: 12,
    marginLeft: -8,
  },
  heroLegend: {
    width: "38%",
    gap: 12,
    paddingRight: 4,
  },
  heroLegendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  heroLegendTextWrap: {
    flex: 1,
  },
  heroLegendTicker: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
  },
  heroLegendPercent: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#0b1220",
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  distributionBar: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 14,
    overflow: "hidden",
    borderRadius: 8,
  },
  distributionList: {
    gap: 12,
  },
  distributionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distributionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  distributionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  distributionName: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  distributionPercent: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  distributionValue: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  assetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.08)",
  },
  assetName: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
  },
  assetMeta: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },
  assetValue: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
  },
  assetProfit: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(15,23,42,0.7)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },
});
