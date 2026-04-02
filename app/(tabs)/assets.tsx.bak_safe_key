import { View, Text, StyleSheet, Pressable, ScrollView, Image, TextInput, Modal, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";

import { useFinanceStore } from "../../src/store/financeStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { translations } from "../../src/i18n/translations";
import { assetLogos } from "../../src/constants/assetLogos";

const FX: Record<string, number> = {
  EUR: 1,
  USD: 1.1,
  UAH: 42,
};

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function convert(value: number, from: string, to: string) {
  const eur = value / (FX[from] ?? 1);
  return eur * (FX[to] ?? 1);
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

function getGroupTitle(category: string | undefined, t: any) {
  if (category === "crypto") return t.crypto;
  if (category === "stock") return t.stock;
  if (category === "etf") return t.etf;
  if (category === "staking") return t.staking;
  if (category === "deposit") return t.deposit;
  if (category === "cash") return t.cash;
  return t.other;
}

function parseLocaleNumber(value: string): number {
  return Number(value.replace(",", ".").trim());
}

export default function AssetsScreen() {
  const router = useRouter();

  const assets = useFinanceStore((state) => state.assets);
  const deleteAsset = useFinanceStore((state) => state.deleteAsset);
  const addAsset = useFinanceStore((state) => state.addAsset);
  const updateAsset = useFinanceStore((state) => state.updateAsset);

  const language = useSettingsStore((state) => state.language) ?? "en";
  const displayCurrency = useSettingsStore((state) => state.displayCurrency);
  const t = translations[language];

  const [cashInput, setCashInput] = useState("");
  const [showCashHelp, setShowCashHelp] = useState(false);

  const cashAsset = assets.find((a) => a.category === "cash");

  function handleAddCash() {
    const value = parseLocaleNumber(cashInput);
    if (Number.isNaN(value) || value <= 0) return;

    if (cashAsset) {
      updateAsset(cashAsset.id, {
        quantity: toSafeNumber(cashAsset.quantity) + value,
      });
    } else {
      addAsset({
        symbol: "EUR",
        name: "Cash",
        quantity: value,
        buyPrice: 1,
        currentPrice: 1,
        rate: 0,
        category: "cash",
        currency: "EUR",
      });
    }

    setCashInput("");
    Keyboard.dismiss();
  }

  const total = assets.reduce((sum, asset) => {
    const nativeValue =
      toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
    return sum + convert(nativeValue, asset.currency, displayCurrency);
  }, 0);

  const groupedAssets = ["crypto", "stock", "etf", "staking", "deposit", "cash"]
    .map((category) => {
      const items = assets
        .filter((asset) => (asset.category ?? "crypto") === category)
        .sort((a, b) => {
          const aValue = convert(
            toSafeNumber(a.quantity) * toSafeNumber(a.currentPrice),
            a.currency,
            displayCurrency
          );
          const bValue = convert(
            toSafeNumber(b.quantity) * toSafeNumber(b.currentPrice),
            b.currency,
            displayCurrency
          );
          return bValue - aValue;
        });

      return {
        category,
        title: getGroupTitle(category, t),
        items,
      };
    })
    .filter((group) => group.items.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.assets}</Text>

        <Text style={styles.total}>
          {t.totalAssets}: {total.toFixed(2)} {displayCurrency}
        </Text>

        <View style={styles.cashBox}>
          <View style={styles.cashHeader}>
            <Text style={styles.cashTitle}>{t.cash}</Text>

            <Pressable
              style={styles.helpButton}
              onPress={() => setShowCashHelp(true)}
              hitSlop={8}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </Pressable>
          </View>

          <View style={styles.cashRow}>
            <TextInput
              style={styles.cashInput}
              placeholder="1000"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              value={cashInput}
              onChangeText={setCashInput}
              returnKeyType="done"
              onSubmitEditing={handleAddCash}
            />

            <Pressable style={styles.cashButton} onPress={handleAddCash}>
              <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        <Modal visible={showCashHelp} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{t.cashHelpTitle}</Text>

              <Text style={styles.modalText}>{t.cashHelpText}</Text>

              <Pressable style={styles.modalCloseButton} onPress={() => setShowCashHelp(false)}>
                <Text style={styles.modalCloseButtonText}>{t.ok}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {assets.length === 0 ? (
          <Text style={styles.empty}>{t.noAssetsYet}</Text>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical
            bounces
          >
            {groupedAssets.map((group) => (
              <View key={group.category} style={styles.groupWrap}>
                <Text style={styles.groupTitle}>{group.title}</Text>

                {group.items.map((asset) => {
                  const quantity = toSafeNumber(asset.quantity);
                  const buyPrice = toSafeNumber(asset.buyPrice);
                  const currentPrice = toSafeNumber(asset.currentPrice);
                  const rate = toSafeNumber(asset.rate);

                  const currentValueNative = quantity * currentPrice;
                  const buyValueNative = quantity * buyPrice;

                  const currentValue = convert(
                    currentValueNative,
                    asset.currency,
                    displayCurrency
                  );
                  const buyValue = convert(
                    buyValueNative,
                    asset.currency,
                    displayCurrency
                  );
                  const convertedBuyPrice = convert(
                    buyPrice,
                    asset.currency,
                    displayCurrency
                  );
                  const convertedCurrentPrice = convert(
                    currentPrice,
                    asset.currency,
                    displayCurrency
                  );

                  const profit = currentValue - buyValue;
                  const profitPercent =
                    buyValue !== 0 ? (profit / buyValue) * 100 : 0;

                  const passiveIncomePerYearDisplay = currentValue * (rate / 100);
                  const passiveIncomeNativeStaking = quantity * (rate / 100);
                  const passiveIncomeNativeDeposit = quantity * (rate / 100);

                  const profitColor = profit >= 0 ? "#3fb950" : "#ff4d4f";
                  const logoSource =
                    assetLogos[asset.symbol as keyof typeof assetLogos] ?? null;

                  return (
                    <Pressable
                      key={asset.id}
                      style={styles.card}
                      onPress={() =>
                        router.push({
                          pathname: "/asset-details",
                          params: { assetId: asset.id },
                        })
                      }
                    >
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

                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={20}
                          color="#8b93a7"
                        />
                      </View>

                      {(asset.category === "stock" ||
                        asset.category === "etf" ||
                        asset.category === "crypto") && (
                        <>
                          <Text style={styles.cardLine}>
                            {t.quantity}: {quantity}
                          </Text>

                          <Text style={styles.cardLine}>
                            {t.buyPrice}: {convertedBuyPrice.toFixed(2)} {displayCurrency}
                          </Text>

                          <Text style={styles.cardLine}>
                            {t.currentPrice}: {convertedCurrentPrice.toFixed(2)} {displayCurrency}
                          </Text>

                          <Text style={styles.cardLine}>
                            {t.value}: {currentValue.toFixed(2)} {displayCurrency}
                          </Text>

                          <Text style={[styles.cardLine, { color: profitColor }]}>
                            {t.profitLoss}: {profit.toFixed(2)} {displayCurrency} ({profitPercent.toFixed(2)}%)
                          </Text>
                        </>
                      )}

                      {asset.category === "staking" && (
                        <>
                          <Text style={styles.cardLine}>
                            {t.quantity}: {quantity}
                          </Text>

                          <Text style={styles.cardLine}>
                            {t.currentPrice}: {convertedCurrentPrice.toFixed(2)} {displayCurrency}
                          </Text>

                          <Text style={styles.cardLine}>
                            {t.value}: {currentValue.toFixed(2)} {displayCurrency}
                          </Text>

                          <Text style={styles.cardLine}>
                            {t.annualRate}: {rate.toFixed(2)}%
                          </Text>

                          <Text style={[styles.cardLine, styles.incomeLine]}>
                            {t.passiveIncomePerYear}: {passiveIncomeNativeStaking.toFixed(2)} {asset.symbol}
                          </Text>

                          <Text style={[styles.cardLine, styles.incomeSubLine]}>
                            ~ {passiveIncomePerYearDisplay.toFixed(2)} {displayCurrency}
                          </Text>
                        </>
                      )}

                      {asset.category === "deposit" && (
                        <>
                          <Text style={styles.cardLine}>
                            {t.principalAmount}: {convert(quantity, asset.currency, displayCurrency).toFixed(2)} {displayCurrency}
                          </Text>

                          <Text style={styles.cardLine}>
                            {t.annualRate}: {rate.toFixed(2)}%
                          </Text>

                          <Text style={[styles.cardLine, styles.incomeLine]}>
                            {t.passiveIncomePerYear}: {passiveIncomeNativeDeposit.toFixed(2)} {asset.currency}
                          </Text>

                          <Text style={[styles.cardLine, styles.incomeSubLine]}>
                            ~ {passiveIncomePerYearDisplay.toFixed(2)} {displayCurrency}
                          </Text>
                        </>
                      )}

                      {asset.category === "cash" && (
                        <Text style={styles.cardLine}>
                          {t.principalAmount}: {convert(quantity, asset.currency, displayCurrency).toFixed(2)} {displayCurrency}
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
                    </Pressable>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1115" },
  container: { flex: 1, padding: 24, backgroundColor: "#0f1115" },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 16, color: "white" },
  total: { fontSize: 20, marginBottom: 16, color: "white" },

  cashBox: {
    backgroundColor: "#1c2230",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },

  cashHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  cashTitle: {
    color: "white",
    fontWeight: "600",
  },

  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3b4252",
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  helpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  cashRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cashInput: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 8,
    color: "white",
    marginRight: 10,
  },

  cashButton: {
    width: 44,
    height: 44,
    backgroundColor: "#2f6fed",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalBox: {
    width: "100%",
    backgroundColor: "#1c2230",
    padding: 20,
    borderRadius: 14,
  },

  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  modalText: {
    color: "#c9d1d9",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },

  modalCloseButton: {
    alignSelf: "flex-end",
    backgroundColor: "#2f6fed",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  modalCloseButtonText: {
    color: "white",
    fontWeight: "600",
  },

  empty: { fontSize: 16, opacity: 0.6, marginBottom: 24, color: "white" },

  list: { paddingBottom: 12 },
  groupWrap: { marginBottom: 18 },
  groupTitle: { color: "#c9d1d9", fontSize: 18, fontWeight: "700", marginBottom: 10 },

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
    marginBottom: 2,
  },

  incomeSubLine: {
    color: "#8fd19e",
    marginBottom: 4,
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
