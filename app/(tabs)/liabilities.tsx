import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLiabilityStore } from "../../src/store/liabilityStore";
import { useSettingsStore } from "../../src/store/settingsStore";

function toSafeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value: number, currency: string) {
  return `${value.toFixed(2)} ${currency}`;
}

export default function LiabilitiesScreen() {
  const liabilities = useLiabilityStore((state) => state.liabilities ?? []);
  const currency = useSettingsStore((state) => state.displayCurrency) ?? "EUR";
  const language = useSettingsStore((state) => state.language) ?? "en";

  const copy =
    language === "uk"
      ? {
          title: "Зобовʼязання",
          subtitle: "Усі пасиви в одному місці",
          total: "ЗАГАЛЬНЕ НАВАНТАЖЕННЯ",
          yearly: "НА РІК",
          monthly: "НА МІСЯЦЬ",
          empty: "Поки зобовʼязань немає",
        }
      : language === "de"
      ? {
          title: "Verbindlichkeiten",
          subtitle: "Alle Passiva an einem Ort",
          total: "GESAMTBELASTUNG",
          yearly: "PRO JAHR",
          monthly: "PRO MONAT",
          empty: "Noch keine Verbindlichkeiten",
        }
      : {
          title: "Liabilities",
          subtitle: "All obligations in one place",
          total: "TOTAL LOAD",
          yearly: "PER YEAR",
          monthly: "PER MONTH",
          empty: "No liabilities yet",
        };

  const yearlyTotal = liabilities.reduce((sum, item) => {
    return sum + toSafeNumber((item as { yearlyPayment?: number }).yearlyPayment);
  }, 0);

  const monthlyTotal = yearlyTotal / 12;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#050816", "#0A1020", "#0C1425"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroLabel}>{copy.total}</Text>
          <Text style={styles.heroValue}>{formatMoney(yearlyTotal, currency)}</Text>
          <Text style={styles.heroSub}>{copy.yearly}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>{copy.yearly}</Text>
            <Text style={styles.smallValue}>{formatMoney(yearlyTotal, currency)}</Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>{copy.monthly}</Text>
            <Text style={styles.smallValue}>{formatMoney(monthlyTotal, currency)}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          {liabilities.length === 0 ? (
            <Text style={styles.emptyText}>{copy.empty}</Text>
          ) : (
            liabilities.map((item, index) => {
              const yearly = toSafeNumber((item as { yearlyPayment?: number }).yearlyPayment);
              const amount = toSafeNumber((item as { amount?: number }).amount);
              const title =
                (item as { name?: string }).name || `Liability ${index + 1}`;

              return (
                <View key={`${title}-${index}`} style={styles.itemCard}>
                  <View style={styles.itemTop}>
                    <View style={styles.itemLeft}>
                      <View style={styles.iconWrap}>
                        <MaterialCommunityIcons
                          name="credit-card-outline"
                          size={20}
                          color="#F87171"
                        />
                      </View>

                      <View>
                        <Text style={styles.itemTitle}>{title}</Text>
                        <Text style={styles.itemMeta}>
                          {formatMoney(amount, currency)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.itemRight}>
                      <Text style={styles.itemValue}>{formatMoney(yearly, currency)}</Text>
                      <Text style={styles.itemSub}>{copy.yearly}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050816",
  },
  content: {
    padding: 20,
    paddingBottom: 150,
    gap: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(17, 24, 39, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.16)",
  },
  heroGlow: {
    position: "absolute",
    top: -24,
    right: -24,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(248,113,113,0.10)",
  },
  heroLabel: {
    fontSize: 12,
    letterSpacing: 1.8,
    color: "#94A3B8",
    marginBottom: 12,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F87171",
  },
  heroSub: {
    marginTop: 6,
    fontSize: 14,
    color: "#CBD5E1",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  smallCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  smallLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 8,
  },
  smallValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  sectionCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  itemCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(17, 24, 39, 0.70)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
    marginBottom: 12,
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248,113,113,0.12)",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  itemMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#94A3B8",
  },
  itemRight: {
    alignItems: "flex-end",
  },
  itemValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  itemSub: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },
});
