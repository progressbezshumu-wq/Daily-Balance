import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";

import { useFinanceStore } from "../src/store/financeStore";
import { useSettingsStore } from "../src/store/settingsStore";
import { translations } from "../src/i18n/translations";
import { assetLogos } from "../src/constants/assetLogos";

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getCryptoCoinId(symbol: string | undefined) {
  if (symbol === "BTC") return "bitcoin";
  if (symbol === "ETH") return "ethereum";
  if (symbol === "USDT") return "tether";
  return null;
}

function formatUpdatedAt(unixSeconds: number | null) {
  if (!unixSeconds) return "—";
  return new Date(unixSeconds * 1000).toLocaleString();
}

export default function AssetDetailsScreen() {
  const router = useRouter();
  const { assetId } = useLocalSearchParams<{ assetId?: string }>();

  const assets = useFinanceStore((state) => state.assets);
  const updateAsset = useFinanceStore((state) => state.updateAsset);

  const language = useSettingsStore((state) => state.language) ?? "en";
  const t = translations[language];

  const asset = assets.find((item) => item.id === assetId);

  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSuccessPrice, setLastSuccessPrice] = useState<number | null>(null);

  const lastRequestTimeRef = useRef(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const coinId = useMemo(() => getCryptoCoinId(asset?.symbol), [asset?.symbol]);
  const canRefreshLivePrice = asset?.category === "crypto" && Boolean(coinId);

  function startRotation() {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }

  function stopRotation() {
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
  }

  async function refreshLivePrice() {
    if (!asset || !coinId) return;

    const now = Date.now();
    if (now - lastRequestTimeRef.current < 10000) return;
    lastRequestTimeRef.current = now;

    try {
      setIsRefreshing(true);
      startRotation();

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=eur&include_last_updated_at=true`
      );

      const data = await response.json();

      const nextPrice = Number(data?.[coinId]?.eur);
      const nextUpdatedAt = Number(data?.[coinId]?.last_updated_at);

      if (Number.isFinite(nextPrice) && nextPrice > 0) {
        setLivePrice(nextPrice);
        setLastSuccessPrice(nextPrice);
        setUpdatedAt(Number.isFinite(nextUpdatedAt) ? nextUpdatedAt : null);
        updateAsset(asset.id, { currentPrice: nextPrice });
      }
    } catch {
      // ignore, fallback will handle
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
  const currentPrice = livePrice ?? lastSuccessPrice ?? storedPrice;

  const currentValue = quantity * currentPrice;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
        </Pressable>

        {canRefreshLivePrice ? (
          <View style={styles.liveCard}>
            <Text style={styles.liveLabel}>{t.livePrice}</Text>
            <Text style={styles.liveValue}>{currentPrice.toFixed(2)} EUR</Text>
            <Text style={styles.liveMeta}>
              {t.lastUpdated}: {formatUpdatedAt(updatedAt)}
            </Text>

            <Pressable
              style={styles.refreshButton}
              onPress={refreshLivePrice}
            >
              <Animated.View style={{ transform: [{ rotate }] }}>
                <MaterialCommunityIcons name="refresh" size={20} color="white" />
              </Animated.View>
            </Pressable>
          </View>
        ) : (
          <View style={styles.liveCard}>
            <Text style={styles.liveMeta}>{t.livePriceUnavailable}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1115" },
  container: { flex: 1, padding: 24, backgroundColor: "#0f1115" },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1c2230",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: { color: "white", fontSize: 28, fontWeight: "700" },
  text: { color: "#c9d1d9" },

  liveCard: {
    backgroundColor: "#1c2230",
    borderRadius: 16,
    padding: 18,
  },

  liveLabel: { color: "#8b93a7" },
  liveValue: { color: "white", fontSize: 24, fontWeight: "700" },
  liveMeta: { color: "#8b93a7", marginTop: 4 },

  refreshButton: {
    marginTop: 12,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2f6fed",
    alignItems: "center",
    justifyContent: "center",
  },
});
