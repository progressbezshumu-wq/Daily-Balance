import { View, Text, TextInput, StyleSheet, Pressable, FlatList } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { assetsCatalog } from "../src/constants/assetsCatalog";
import { useFinanceStore } from "../src/store/financeStore";
import { useSettingsStore } from "../src/store/settingsStore";
import { translations } from "../src/i18n/translations";

function parseLocaleNumber(value: string): number {
  return Number(value.replace(",", ".").trim());
}

export default function AddAssetScreen() {
  const addAsset = useFinanceStore((state) => state.addAsset);
  const language = useSettingsStore((state) => state.language) ?? "en";
  const t = translations[language];

  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [rate, setRate] = useState("");

  const filteredAssets = assetsCatalog.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    if (!selectedAsset || !quantity || !buyPrice) return;

    const parsedQuantity = parseLocaleNumber(quantity);
    const parsedBuyPrice = parseLocaleNumber(buyPrice);
    const parsedRate = rate ? parseLocaleNumber(rate) : 0;

    if (
      Number.isNaN(parsedQuantity) ||
      Number.isNaN(parsedBuyPrice) ||
      Number.isNaN(parsedRate)
    ) {
      return;
    }

    addAsset({
      id: Date.now().toString(),
      assetId: selectedAsset.id,
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      type: selectedAsset.type,
      quantity: parsedQuantity,
      buyPrice: parsedBuyPrice,
      currentPrice: selectedAsset.price,
      currency: "EUR",
      rate: parsedRate,
    });

    router.back();
  }

  const currentPrice = selectedAsset?.price ?? 0;

  const parsedQuantity = parseLocaleNumber(quantity);
  const parsedBuyPrice = parseLocaleNumber(buyPrice);

  const currentValue =
    selectedAsset && !Number.isNaN(parsedQuantity)
      ? parsedQuantity * currentPrice
      : 0;

  const buyValue =
    !Number.isNaN(parsedQuantity) && !Number.isNaN(parsedBuyPrice)
      ? parsedQuantity * parsedBuyPrice
      : 0;

  const profit = currentValue - buyValue;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.addAsset}</Text>

      {!selectedAsset && (
        <>
          <TextInput
            style={styles.input}
            placeholder={t.searchAsset + " (BTC, Apple...)"}
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />

          <FlatList
            data={filteredAssets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.assetItem}
                onPress={() => setSelectedAsset(item)}
              >
                <Text style={styles.assetText}>
                  {item.symbol} — {item.name}
                </Text>
              </Pressable>
            )}
          />
        </>
      )}

      {selectedAsset && (
        <>
          <Text style={styles.selected}>
            {selectedAsset.symbol} — {selectedAsset.name}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t.quantity}
            placeholderTextColor="#888"
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
          />

          <TextInput
            style={styles.input}
            placeholder={t.buyPricePerUnit}
            placeholderTextColor="#888"
            keyboardType="decimal-pad"
            value={buyPrice}
            onChangeText={setBuyPrice}
          />

          <TextInput
            style={styles.input}
            placeholder={t.annualRateOptional}
            placeholderTextColor="#888"
            keyboardType="decimal-pad"
            value={rate}
            onChangeText={setRate}
          />

          <Text style={styles.info}>
            {t.currentPrice}: {currentPrice} EUR
          </Text>

          <Text style={styles.info}>
            {t.currentValue}: {currentValue.toFixed(2)} EUR
          </Text>

          <Text style={styles.info}>
            {t.profitLoss}: {profit.toFixed(2)} EUR
          </Text>

          <Pressable style={styles.button} onPress={handleAdd}>
            <Text style={styles.buttonText}>{t.addAsset}</Text>
          </Pressable>
        </>
      )}
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
    marginBottom: 20,
    color: "white",
  },

  input: {
    backgroundColor: "#1c2230",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    color: "white",
  },

  assetItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },

  assetText: {
    color: "white",
    fontSize: 16,
  },

  selected: {
    fontSize: 20,
    marginBottom: 16,
    color: "white",
  },

  info: {
    color: "#8b93a7",
    marginBottom: 8,
  },

  button: {
    backgroundColor: "#2f6fed",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
