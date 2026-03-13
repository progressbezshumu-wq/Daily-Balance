import { View, Text, StyleSheet, Pressable, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { translations } from "../../src/i18n/translations";
import { assetLogos } from "../../src/constants/assetLogos";

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getCategoryIconName(category: string | undefined) {
  if (category === "stock") return "chart-line";
  if (category === "etf") return "finance";
  if (category === "crypto") return "currency-btc";
  if (category === "staking") return "lock-outline";
  if (category === "deposit") return "bank-outline";
  if (category === "cash") return "cash";
  return "help-circle-outline";
}

function getGroupTitle(category: string | undefined) {
  if (category === "crypto") return "Cryptocurrency";
  if (category === "stock") return "Stocks";
  if (category === "etf") return "Index funds";
  if (category === "staking") return "Staking";
  if (category === "deposit") return "Deposits";
  if (category === "cash") return "Cash";
  return "Other";
}

export default function AssetsScreen() {
  const router = useRouter();

  const assets = useFinanceStore((state) => state.assets);
  const deleteAsset = useFinanceStore((state) => state.deleteAsset);
  const language = useSettingsStore((state) => state.language) ?? "en";

  const t = translations[language];

  const total = assets.reduce(
    (sum, asset) => sum + toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice),
    0
  );

  const groupedAssets = ["crypto", "stock", "etf", "staking", "deposit", "cash"]
    .map((category) => {
      const items = assets
        .filter((asset) => (asset.category ?? "crypto") === category)
        .sort((a, b) => {
          const aValue = toSafeNumber(a.quantity) * toSafeNumber(a.currentPrice);
          const bValue = toSafeNumber(b.quantity) * toSafeNumber(b.currentPrice);
          return bValue - aValue;
        });

      return {
        category,
        title: getGroupTitle(category),
        items,
      };
    })
    .filter((group) => group.items.length > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.assets}</Text>

      <Text style={styles.total}>
        {t.totalAssets}: {total.toFixed(2)} EUR
      </Text>

      {assets.length === 0 ? (
        <Text style={styles.empty}>{t.noAssetsYet}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {groupedAssets.map((group) => (
            <View key={group.category} style={styles.groupWrap}>
              <Text style={styles.groupTitle}>{group.title}</Text>

              {group.items.map((asset) => {
                const quantity = toSafeNumber(asset.quantity);
                const buyPrice = toSafeNumber(asset.buyPrice);
                const currentPrice = toSafeNumber(asset.currentPrice);
                const rate = toSafeNumber(asset.rate);

                const currentValue = quantity * currentPrice;
                const buyValue = quantity * buyPrice;
                const profit = currentValue - buyValue;
                const profitPercent =
                  buyValue !== 0 ? (profit / buyValue) * 100 : 0;
                const passiveIncomePerYear = currentValue * (rate / 100);

                const profitColor = profit >= 0 ? "#3fb950" : "#ff4d4f";
                const logoSource =
                  assetLogos[asset.symbol as keyof typeof assetLogos] ?? null;

                return (
                  <View key={asset.id} style={styles.card}>
                    <View style={styles.headerRow}>
                      <View style={styles.logoWrap}>
                        {logoSource ? (
                          <Image source={logoSource} style={styles.logo} />
                        ) : (
                          <MaterialCommunityIcons
                            name={getCategoryIconName(asset.category)}
                            size={22}
                            color="white"
                          />
                        )}
                      </View>

                      <View style={styles.headerTextWrap}>
                        <Text style={styles.cardTitle}>
                          {asset.symbol} — {asset.name}
                        </Text>
                      </View>
                    </View>

                    {(asset.category === "stock" ||
                      asset.category === "etf" ||
                      asset.category === "crypto") && (
                      <>
                        <Text style={styles.cardLine}>
                          {t.quantity}: {quantity}
                        </Text>

                        <Text style={styles.cardLine}>
                          {t.buyPrice}: {buyPrice.toFixed(2)} EUR
                        </Text>

                        <Text style={styles.cardLine}>
                          {t.currentPrice}: {currentPrice.toFixed(2)} EUR
                        </Text>

                        <Text style={styles.cardLine}>
                          {t.value}: {currentValue.toFixed(2)} EUR
                        </Text>

                        <Text style={[styles.cardLine, { color: profitColor }]}>
                          {t.profitLoss}: {profit.toFixed(2)} EUR ({profitPercent.toFixed(2)}%)
                        </Text>
                      </>
                    )}

                    {asset.category === "staking" && (
                      <>
                        <Text style={styles.cardLine}>
                          {t.quantity}: {quantity}
                        </Text>

                        <Text style={styles.cardLine}>
                          {t.currentPrice}: {currentPrice.toFixed(2)} EUR
                        </Text>

                        <Text style={styles.cardLine}>
                          {t.value}: {currentValue.toFixed(2)} EUR
                        </Text>

                        <Text style={styles.cardLine}>
                          {t.annualRate}: {rate.toFixed(2)}%
                        </Text>

                        <Text style={[styles.cardLine, styles.incomeLine]}>
                          {t.passiveIncomePerYear}: {passiveIncomePerYear.toFixed(2)} EUR
                        </Text>
                      </>
                    )}

                    {asset.category === "deposit" && (
                      <>
                        <Text style={styles.cardLine}>
                          {t.principalAmount}: {quantity.toFixed(2)} EUR
                        </Text>

                        <Text style={styles.cardLine}>
                          {t.annualRate}: {rate.toFixed(2)}%
                        </Text>

                        <Text style={[styles.cardLine, styles.incomeLine]}>
                          {t.passiveIncomePerYear}: {passiveIncomePerYear.toFixed(2)} EUR
                        </Text>
                      </>
                    )}

                    {asset.category === "cash" && (
                      <Text style={styles.cardLine}>
                        {t.principalAmount}: {quantity.toFixed(2)} EUR
                      </Text>
                    )}

                    <View style={styles.actionsRow}>
                      <Pressable
                        style={styles.editButton}
                        onPress={() =>
                          router.push({
                            pathname: "/add-asset",
                            params: { assetId: asset.id },
                          })
                        }
                      >
                        <Text style={styles.actionText}>{t.edit}</Text>
                      </Pressable>

                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => deleteAsset(asset.id)}
                      >
                        <Text style={styles.actionText}>{t.delete}</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

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

  list: {
    paddingBottom: 12,
  },

  groupWrap: {
    marginBottom: 18,
  },

  groupTitle: {
    color: "#c9d1d9",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#1c2230",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  logo: {
    width: 28,
    height: 28,
  },

  headerTextWrap: {
    flex: 1,
  },

  cardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  cardLine: {
    color: "#8b93a7",
    marginBottom: 4,
  },

  incomeLine: {
    color: "#3fb950",
  },

  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  editButton: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 10,
  },

  deleteButton: {
    backgroundColor: "#7f1d1d",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  actionText: {
    color: "white",
    fontWeight: "600",
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
