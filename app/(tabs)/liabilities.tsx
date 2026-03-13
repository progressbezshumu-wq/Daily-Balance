import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";

import { useLiabilityStore } from "../../src/store/liabilityStore";
import { useSettingsStore } from "../../src/store/settingsStore";
import { t } from "../../src/i18n";

function toSafeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getYearlyPayment(liability: any) {
  const paymentAmount = toSafeNumber(liability?.paymentAmount);
  const paymentPeriod = liability?.paymentPeriod;

  if (paymentPeriod === "daily") return paymentAmount * 365;
  if (paymentPeriod === "monthly") return paymentAmount * 12;
  if (paymentPeriod === "yearly") return paymentAmount;

  return toSafeNumber(liability?.yearlyPayment);
}

export default function LiabilitiesScreen() {
  const liabilities = useLiabilityStore((state) => state.liabilities);
  const deleteLiability = useLiabilityStore((state) => state.deleteLiability);
  const language = useSettingsStore((state) => state.language) ?? "en";

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t(language, "liabilities")}</Text>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/add-liability")}
        >
          <Text style={styles.addButtonText}>{t(language, "addLiability")}</Text>
        </Pressable>
      </View>

      {liabilities.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t(language, "noLiabilitiesYet")}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {liabilities.map((liability) => (
            <View key={liability.id} style={styles.card}>
              <Text style={styles.name}>{liability.name}</Text>

              <Text style={styles.detail}>
                {t(language, "paymentAmount")}:{" "}
                {toSafeNumber(liability.paymentAmount).toFixed(2)} EUR
              </Text>

              <Text style={styles.detail}>
                {t(language, "paymentPeriod")}:{" "}
                {t(language, liability.paymentPeriod)}
              </Text>

              <Text style={styles.detail}>
                {t(language, "yearlyPayment")}:{" "}
                {getYearlyPayment(liability).toFixed(2)} EUR
              </Text>

              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.editButton}
                  onPress={() =>
                    router.push({
                      pathname: "/add-liability",
                      params: { liabilityId: liability.id },
                    })
                  }
                >
                  <Text style={styles.actionButtonText}>{t(language, "edit")}</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteLiability(liability.id)}
                >
                  <Text style={styles.actionButtonText}>{t(language, "delete")}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1218",
    padding: 20,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },

  addButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  addButtonText: {
    color: "white",
    fontWeight: "600",
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#8b93a7",
    fontSize: 16,
  },

  list: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#1b2130",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
  },

  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  detail: {
    color: "#c9d1d9",
    fontSize: 14,
    marginBottom: 6,
  },

  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  editButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1d4ed8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 10,
  },

  deleteButton: {
    alignSelf: "flex-start",
    backgroundColor: "#7f1d1d",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  actionButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
