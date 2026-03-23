import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useFinanceStore } from "@/src/store/financeStore";

export default function AddAssetModal({ onClose }: { onClose: () => void }) {
  const addAsset = useFinanceStore((s) => s.addAsset);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  function handleAdd() {
    if (!name || !quantity || !price) return;

    addAsset({
      id: Date.now().toString(),
      name,
      quantity: Number(quantity),
      buyPrice: Number(price),
      currentPrice: Number(price),
      category: "other",
    });

    onClose();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Asset</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#8b93a7"
        style={styles.input}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Quantity"
        placeholderTextColor="#8b93a7"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={setQuantity}
      />
      <TextInput
        placeholder="Price"
        placeholderTextColor="#8b93a7"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={setPrice}
      />

      <TouchableOpacity onPress={handleAdd} style={styles.button}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#1b2130",
    borderRadius: 16,
  },
  title: {
    color: "white",
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#0f1218",
    color: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#2f6fed",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
