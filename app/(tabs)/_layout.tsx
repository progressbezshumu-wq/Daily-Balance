import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { t } from "../../src/i18n";
import { useSettingsStore } from "../../src/store/settingsStore";

export default function TabsLayout() {
  const language = useSettingsStore((state) => state.language) ?? "en";

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2f6fed",
        tabBarInactiveTintColor: "#8b93a7",
        tabBarStyle: {
          backgroundColor: "#151922",
          borderTopColor: "#232938",
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse";

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "assets") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "liabilities") {
            iconName = focused ? "card" : "card-outline";
          } else if (route.name === "trends") {
            iconName = focused ? "trending-up" : "trending-up-outline";
          } else if (route.name === "settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: t(language, "overview") }} />
      <Tabs.Screen name="assets" options={{ title: t(language, "assets") }} />
      <Tabs.Screen
        name="liabilities"
        options={{ title: t(language, "liabilities") }}
      />
      <Tabs.Screen name="trends" options={{ title: t(language, "trends") }} />
      <Tabs.Screen name="settings" options={{ title: t(language, "settings") }} />
    </Tabs>
  );
}
