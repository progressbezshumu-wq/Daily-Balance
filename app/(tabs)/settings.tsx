import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { t } from "../../src/i18n";
import { useSettingsStore } from "../../src/store/settingsStore";

export default function SettingsScreen() {
  const language = useSettingsStore((state) => state.language) ?? "en";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f1115",
        padding: 24,
        justifyContent: "center",
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
        {t(language, "settings")}
      </Text>

      <Pressable
        onPress={() => router.push("/change-language")}
        style={{
          backgroundColor: "#1c2230",
          paddingVertical: 18,
          paddingHorizontal: 18,
          borderRadius: 16,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          {t(language, "changeLanguage")}
        </Text>

        <Text
          style={{
            color: "#98a2b3",
            fontSize: 14,
            marginTop: 6,
          }}
        >
          {t(language, "currentLanguage")}: {language}
        </Text>
      </Pressable>
    </View>
  );
}
