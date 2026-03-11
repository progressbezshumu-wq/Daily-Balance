import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import type { AppLanguage } from "../src/store/settingsStore";
import { useSettingsStore } from "../src/store/settingsStore";

export default function LanguageScreen() {
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const handleSelect = async (language: AppLanguage) => {
    await setLanguage(language);
    router.replace("/(tabs)");
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
        Choose your language
      </Text>

      <Pressable
        onPress={() => handleSelect("en")}
        style={{
          backgroundColor: "#1c2230",
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
          backgroundColor: "#1c2230",
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
          backgroundColor: "#1c2230",
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
