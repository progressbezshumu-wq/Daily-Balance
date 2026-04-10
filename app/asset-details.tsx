import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";

import { useFinanceStore } from "../src/store/financeStore";
import { useSettingsStore } from "../src/store/settingsStore";
import { translations } from "../src/i18n/translations";
import { assetLogos } from "../src/constants/assetLogos";
import { getCachedSnapshot } from "../src/utils/priceCache";

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getCryptoCoinId(symbol: string | undefined) {
  const map: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    USDT: "tether",
    BNB: "binancecoin",
    SOL: "solana",
    XRP: "ripple",
    ADA: "cardano",
    DOGE: "dogecoin",
    TON: "the-open-network",
    TRX: "tron",
    AVAX: "avalanche-2",
    DOT: "polkadot",
    MATIC: "matic-network",
    LINK: "chainlink",
    LTC: "litecoin",
    BCH: "bitcoin-cash",
  };
  return symbol ? map[String(symbol).toUpperCase()] ?? null : null;
}

function formatUpdatedAt(unixSeconds: number | null) {
  if (!unixSeconds) return "—";
  return new Date(unixSeconds * 1000).toLocaleString();
}

function formatCompact(value: number | null | undefined, suffix = "") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T${suffix}`;
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B${suffix}`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M${suffix}`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K${suffix}`;
  return `${n.toFixed(2)}${suffix}`;
}

function getAssetLogo(symbol?: string) {
  if (!symbol) return null;
  const key = String(symbol).toUpperCase() as keyof typeof assetLogos;
  return assetLogos[key] ?? null;
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function AssetDetailsScreen() {
  const router = useRouter();
  const { assetId } = useLocalSearchParams<{ assetId?: string }>();

  const assets = useFinanceStore((state) => state.assets);
  const updateAsset = useFinanceStore((state) => state.updateAsset);

  const language = useSettingsStore((state) => state.language) ?? "en";
  const t = translations[language];

  const copy =
    language === "uk"
      ? {
          position: "Позиція",
          marketData: "Ринкові дані",
          value: "Вартість",
          qty: "К-сть",
          avgBuy: "Сер. ціна",
          current: "Поточна",
          marketCap: "Капіталізація",
          volume24h: "Обсяг 24г",
          high24h: "Макс. 24г",
          low24h: "Мін. 24г",
        }
      : language === "de"
      ? {
          position: "Position",
          marketData: "Marktdaten",
          value: "Wert",
          qty: "Menge",
          avgBuy: "Ø Kaufpreis",
          current: "Aktuell",
          marketCap: "Marktkapitalisierung",
          volume24h: "24h Volumen",
          high24h: "24h Hoch",
          low24h: "24h Tief",
        }
      : {
          position: "Position",
          marketData: "Market data",
          value: "Value",
          qty: "Qty",
          avgBuy: "Avg buy",
          current: "Current",
          marketCap: "Market cap",
          volume24h: "24h volume",
          high24h: "24h high",
          low24h: "24h low",
        };

  const asset = assets.find((item) => item.id === assetId);

  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSuccessPrice, setLastSuccessPrice] = useState<number | null>(null);
  const [marketCap, setMarketCap] = useState<number | null>(null);
  const [volume24h, setVolume24h] = useState<number | null>(null);
  const [high24h, setHigh24h] = useState<number | null>(null);
  const [low24h, setLow24h] = useState<number | null>(null);

  const lastRequestTimeRef = useRef(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const coinId = useMemo(() => getCryptoCoinId(asset?.symbol), [asset?.symbol]);
  const canRefreshLivePrice = Boolean(asset?.symbol);

  function startRotation() {
    rotateAnim.setValue(0);
    scaleAnim.setValue(1);

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

  function stopRotation() {
    rotateAnim.stopAnimation();
    scaleAnim.stopAnimation();
    rotateAnim.setValue(0);
    scaleAnim.setValue(1);
  }

  async function refreshLivePrice() {
    if (!asset) return;

    const now = Date.now();
    if (now - lastRequestTimeRef.current < 10000) return;
    lastRequestTimeRef.current = now;

    try {
      setIsRefreshing(true);
      startRotation();

      const snapshot = await getCachedSnapshot(asset);
      const nextPrice = Number(snapshot?.price);

      if (Number.isFinite(nextPrice) && nextPrice > 0) {
        setLivePrice(nextPrice);
        setLastSuccessPrice(nextPrice);
        setUpdatedAt(Math.floor(Date.now() / 1000));
        updateAsset(asset.id, { currentPrice: nextPrice });
      }

      if (asset.category === "crypto" && coinId) {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${coinId}&price_change_percentage=24h`
          );

          const data = await response.json();
          const row = Array.isArray(data) ? data[0] : null;

          setMarketCap(Number.isFinite(Number(row?.market_cap)) ? Number(row.market_cap) : null);
          setVolume24h(Number.isFinite(Number(row?.total_volume)) ? Number(row.total_volume) : null);
          setHigh24h(Number.isFinite(Number(row?.high_24h)) ? Number(row.high_24h) : null);
          setLow24h(Number.isFinite(Number(row?.low_24h)) ? Number(row.low_24h) : null);
        } catch {
          setMarketCap(null);
          setVolume24h(null);
          setHigh24h(null);
          setLow24h(null);
        }
      } else {
        setMarketCap(null);
        setVolume24h(null);
        setHigh24h(null);
        setLow24h(null);
      }
    } catch {
    } finally {
      setIsRefreshing(false);
      stopRotation();
    }
  }

  useEffect(() => {
    if (canRefreshLivePrice) {
      refreshLivePrice();
    }
  }, [canRefreshLivePrice]);

  if (!asset) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>{t.assetDetails}</Text>
          <Text style={styles.text}>{t.assetNotFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const quantity = toSafeNumber(asset.quantity);
  const storedPrice = toSafeNumber(asset.currentPrice);
  const buyPrice = toSafeNumber(asset.buyPrice);
  const currentPrice = livePrice ?? lastSuccessPrice ?? storedPrice;
  const currentValue = quantity * currentPrice;
  const investedValue = quantity * buyPrice;
  const profit = currentValue - investedValue;
  const profitColor = profit >= 0 ? "#22C55E" : "#EF4444";
  const logo = getAssetLogo(asset.symbol);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const refreshOpacity = isRefreshing ? 0.92 : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#050816", "#0A1020", "#0C1425"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={18} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={styles.refreshButton}
            onPress={refreshLivePrice}
            disabled={!canRefreshLivePrice || isRefreshing}
          >
            <Animated.View style={{ opacity: refreshOpacity, transform: [{ rotate }, { scale: scaleAnim }] }}>
              <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
            </Animated.View>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.assetRow}>
            <View style={styles.assetLeft}>
              <View style={styles.logoWrap}>
                {logo ? (
                  <Image source={logo} style={styles.logo} resizeMode="contain" />
                ) : (
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={24}
                    color="#60A5FA"
                  />
                )}
              </View>

              <View>
                <Text style={styles.symbol}>{asset.symbol || asset.category?.toUpperCase() || "ASSET"}</Text>
                <Text style={styles.name}>{asset.name || asset.symbol || "Asset"}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.price}>{currentPrice.toFixed(2)} {asset.currency || "EUR"}</Text>
          <Text style={[styles.profit, { color: profitColor }]}>
            {profit >= 0 ? "+" : ""}{profit.toFixed(2)} {asset.currency || "EUR"}
          </Text>

          <Text style={styles.updated}>
            {livePrice != null || lastSuccessPrice != null ? `${t.lastUpdated}: ${formatUpdatedAt(updatedAt)}` : t.livePriceUnavailable}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.position}</Text>
          <View style={styles.statsGrid}>
            <Stat label={copy.value} value={`${currentValue.toFixed(2)} ${asset.currency || "EUR"}`} />
            <Stat label={copy.qty} value={quantity.toFixed(4)} />
            <Stat label={copy.avgBuy} value={`${buyPrice.toFixed(2)} ${asset.currency || "EUR"}`} />
            <Stat label={copy.current} value={`${currentPrice.toFixed(2)} ${asset.currency || "EUR"}`} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.marketData}</Text>
          <View style={styles.statsGrid}>
            <Stat label={copy.marketCap} value={formatCompact(marketCap, " €")} />
            <Stat label={copy.volume24h} value={formatCompact(volume24h, " €")} />
            <Stat label={copy.high24h} value={high24h != null ? `${high24h.toFixed(2)} €` : "—"} />
            <Stat label={copy.low24h} value={low24h != null ? `${low24h.toFixed(2)} €` : "—"} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050816",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(15,23,42,0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(37,99,235,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  hero: {
    backgroundColor: "rgba(10, 14, 28, 0.78)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.12)",
    padding: 16,
    marginBottom: 14,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.10)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logo: {
    width: 24,
    height: 24,
  },
  symbol: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },
  name: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  profit: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
  },
  updated: {
    marginTop: 8,
    color: "#7C8AA5",
    fontSize: 12,
  },
  section: {
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.14)",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  statBox: {
    width: "48%",
    backgroundColor: "rgba(10,14,28,0.72)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
  },
  statLabel: {
    color: "#7C8AA5",
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
  },
  text: {
    color: "#c9d1d9",
  },
});
