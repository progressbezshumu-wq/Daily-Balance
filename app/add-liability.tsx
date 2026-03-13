import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { useLiabilityStore } from "../src/store/liabilityStore";

function parseNumber(value: string) {
  return Number(value.replace(",", ".").trim());
}

export default function AddLiabilityScreen() {
  const addLiability = useLiabilityStore((state) => state.addLiability);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [yearlyPayment, setYearlyPayment] = useState("");

  function handleAdd() {
    const parsedAmount = parseNumber(amount);
    const parsedRate = parseNumber(rate);
    const parsedPayment = parseNumber(yearlyPayment);

    if (!name || Number.isNaN(parsedAmount)) return;

    addLiability({
      id: Date.now().toString(),
      name,
      amount: parsedAmount,
      rate: parsedRate || 0,
      yearlyPayment: parsedPayment || 0,
    });

    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Liability</Text>

      <TextInput
        style={styles.input}
        placeholder="Name (Mortgage, Loan...)"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Total amount"
        placeholderTextColor="#888"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Interest rate %"
        placeholderTextColor="#888"
        keyboardType="decimal-pad"
        value={rate}
        onChangeText={setRate}
      />

      <TextInput
        style={styles.input}
        placeholder="Yearly payment"
        placeholderTextColor="#888"
        keyboardType="decimal-pad"
        value={yearlyPayment}
        onChangeText={setYearlyPayment}
      />

      <Pressable style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1218",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 24,
  },

  input: {
    backgroundColor: "#1b2130",
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    color: "white",
  },

  button: {
    backgroundColor: "#2f6fed",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
