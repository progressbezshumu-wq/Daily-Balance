import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import { useLiabilityStore } from "../src/store/liabilityStore";
import { useSettingsStore } from "../src/store/settingsStore";
import { t } from "../src/i18n";

export default function AddLiabilityScreen() {
  const { liabilityId } = useLocalSearchParams<{ liabilityId?: string }>();

  const liabilities = useLiabilityStore((state) => state.liabilities);
  const addLiability = useLiabilityStore((state) => state.addLiability);
  const updateLiability = useLiabilityStore((state) => state.updateLiability);
  const language = useSettingsStore((state) => state.language) ?? "en";

  const existingLiability = useMemo(() => {
    return liabilities.find((item) => item.id === liabilityId);
  }, [liabilities, liabilityId]);

  const isEditMode = Boolean(existingLiability);

  const [name, setName] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentPeriod, setPaymentPeriod] = useState<"daily" | "monthly" | "yearly">("monthly");

  useEffect(() => {
    if (!existingLiability) return;

    setName(existingLiability.name ?? "");
    setPaymentAmount(String(existingLiability.paymentAmount ?? ""));
    setPaymentPeriod(existingLiability.paymentPeriod ?? "monthly");
  }, [existingLiability]);

  function handleSave() {
    const amount = parseFloat(paymentAmount);

    if (!name.trim() || isNaN(amount)) return;

    if (isEditMode && existingLiability) {
      updateLiability(existingLiability.id, {
        name: name.trim(),
        amount,
        interestRate: existingLiability.interestRate ?? 0,
        paymentAmount: amount,
        paymentPeriod,
      });
    } else {
      addLiability({
        name: name.trim(),
        amount,
        interestRate: 0,
        paymentAmount: amount,
        paymentPeriod,
      });
    }

    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isEditMode ? t(language, "edit") : t(language, "addLiability")}
      </Text>

      <TextInput
        placeholder={t(language, "assetName")}
        placeholderTextColor="#6b7280"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder={t(language, "paymentAmount")}
        placeholderTextColor="#6b7280"
        style={styles.input}
        keyboardType="numeric"
        value={paymentAmount}
        onChangeText={setPaymentAmount}
      />

      <Text style={styles.label}>{t(language, "paymentPeriod")}</Text>

      <View style={styles.periodRow}>
        {["daily", "monthly", "yearly"].map((period) => (
          <Pressable
            key={period}
            onPress={() => setPaymentPeriod(period as "daily" | "monthly" | "yearly")}
            style={[
              styles.periodButton,
              paymentPeriod === period && styles.periodButtonActive,
            ]}
          >
            <Text style={styles.periodText}>{t(language, period)}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.addButton} onPress={handleSave}>
        <Text style={styles.addButtonText}>
          {isEditMode ? t(language, "edit") : t(language, "addLiability")}
        </Text>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    color: "white",
  },

  label: {
    color: "#8b93a7",
    marginBottom: 8,
  },

  periodRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  periodButton: {
    backgroundColor: "#1b2130",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
  },

  periodButtonActive: {
    backgroundColor: "#2563eb",
  },

  periodText: {
    color: "white",
  },

  addButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
