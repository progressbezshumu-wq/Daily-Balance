import { router } from "expo-router";
import { Pressable, Text, View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { t } from "../../src/i18n";
import { useSettingsStore } from "../../src/store/settingsStore";

export default function SettingsScreen() {
  const language = useSettingsStore((state) => state.language) ?? "en";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        bounces
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t(language, "settings")}</Text>

          <Pressable
            onPress={() => router.push("/change-language")}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>
              {t(language, "changeLanguage")}
            </Text>

            <Text style={styles.cardSubtext}>
              {t(language, "currentLanguage")}: {language}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#1c2230",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  cardSubtext: {
    color: "#98a2b3",
    fontSize: 14,
    marginTop: 6,
  },
});
