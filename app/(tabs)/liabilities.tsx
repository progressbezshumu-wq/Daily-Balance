import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

import { useLiabilityStore } from "../../src/store/liabilityStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { t } from "../../src/i18n";

export default function LiabilitiesScreen() {
  const liabilities = useLiabilityStore((state) => state.liabilities);
  const language = useSettingsStore((state) => state.language) ?? "en";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t(language, "liabilities")}</Text>

      {liabilities.length === 0 && (
        <Text style={styles.empty}>No liabilities yet</Text>
      )}

      {liabilities.map((l) => (
        <View key={l.id} style={styles.card}>
          <Text style={styles.name}>{l.name}</Text>

          <Text style={styles.line}>
            Amount: {l.amount.toFixed(2)} EUR
          </Text>

          <Text style={styles.line}>
            Rate: {l.rate} %
          </Text>

          <Text style={styles.line}>
            Yearly payment: {l.yearlyPayment.toFixed(2)} EUR
          </Text>
        </View>
      ))}

      <Pressable
        style={styles.button}
        onPress={() => router.push("/add-liability")}
      >
        <Text style={styles.buttonText}>Add liability</Text>
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
    marginBottom: 20,
  },

  empty: {
    color: "#8b93a7",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#1b2130",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
  },

  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  line: {
    color: "#8b93a7",
  },

  button: {
    marginTop: 20,
    backgroundColor: "#2f6fed",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
