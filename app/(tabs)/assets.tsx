import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { translations } from "../../src/i18n/translations";

export default function AssetsScreen() {
  const router = useRouter();

  const assets = useFinanceStore((state) => state.assets);
  const language = useSettingsStore((state) => state.language) ?? "en";

  const t = translations[language];
  const total = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.assets}</Text>

      <Text style={styles.total}>
        {t.totalAssets}: {total}
      </Text>

      {assets.length === 0 && (
        <Text style={styles.empty}>{t.noAssetsYet}</Text>
      )}

      {assets.map((asset) => (
        <View key={asset.id} style={styles.card}>
          <Text style={styles.cardTitle}>{asset.name}</Text>
          <Text style={styles.cardValue}>{asset.value}</Text>
        </View>
      ))}

      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/add-asset")}
      >
        <Text style={styles.addText}>{t.addAsset}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0f1115",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    color: "white",
  },

  total: {
    fontSize: 20,
    marginBottom: 24,
    color: "white",
  },

  empty: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 24,
    color: "white",
  },

  card: {
    backgroundColor: "#1c2230",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  cardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  cardValue: {
    color: "#8b93a7",
    marginTop: 4,
  },

  addButton: {
    backgroundColor: "#2f6fed",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },

  addText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
