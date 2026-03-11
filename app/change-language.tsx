import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import type { AppLanguage } from "../src/store/settingsStore";
import { useSettingsStore } from "../src/store/settingsStore";

export default function ChangeLanguageScreen() {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const handleSelect = async (nextLanguage: AppLanguage) => {
    await setLanguage(nextLanguage);
    router.back();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f1115",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 28,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        Change language
      </Text>

      <Pressable
        onPress={() => handleSelect("en")}
        style={{
          backgroundColor: language === "en" ? "#2f6fed" : "#1c2230",
          paddingVertical: 16,
          borderRadius: 16,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          English
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleSelect("de")}
        style={{
          backgroundColor: language === "de" ? "#2f6fed" : "#1c2230",
          paddingVertical: 16,
          borderRadius: 16,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          Deutsch
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleSelect("uk")}
        style={{
          backgroundColor: language === "uk" ? "#2f6fed" : "#1c2230",
          paddingVertical: 16,
          borderRadius: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          Українська
        </Text>
      </Pressable>
    </View>
  );
}
