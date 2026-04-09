import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSettingsStore } from "../../src/store/settingsStore";

export default function TabsLayout() {
  const language = useSettingsStore((state) => state.language) ?? "en";

  const labels =
    language === "uk"
      ? {
          overview: "Огляд",
          portfolio: "Портфель",
          assets: "Активи",
          liabilities: "Пасиви",
          settings: "Налашт.",
        }
      : language === "de"
      ? {
          overview: "Übersicht",
          portfolio: "Portfolio",
          assets: "Assets",
          liabilities: "Passiva",
          settings: "Einst.",
        }
      : {
          overview: "Overview",
          portfolio: "Portfolio",
          assets: "Assets",
          liabilities: "Liabilities",
          settings: "Settings",
        };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#60A5FA",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 22,
          backgroundColor: "#0B1220",
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(148,163,184,0.14)",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size + 2 : size;

          switch (route.name) {
            case "index":
              return <MaterialCommunityIcons name="view-dashboard-outline" size={iconSize} color={color} />;
            case "portfolio":
              return <MaterialCommunityIcons name="chart-pie" size={iconSize} color={color} />;
            case "assets":
              return <MaterialCommunityIcons name="wallet-outline" size={iconSize} color={color} />;
            case "liabilities":
              return <MaterialCommunityIcons name="credit-card-outline" size={iconSize} color={color} />;
            case "settings":
              return <MaterialCommunityIcons name="cog-outline" size={iconSize} color={color} />;
            default:
              return <MaterialCommunityIcons name="circle-outline" size={iconSize} color={color} />;
          }
        },
        sceneStyle: {
          backgroundColor: "#050816",
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: labels.overview }} />
      <Tabs.Screen name="portfolio" options={{ title: labels.portfolio }} />
      <Tabs.Screen name="assets" options={{ title: labels.assets }} />
      <Tabs.Screen name="liabilities" options={{ title: labels.liabilities }} />
      <Tabs.Screen name="settings" options={{ title: labels.settings }} />
    </Tabs>
  );
}
