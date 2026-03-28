import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

import { initPurchases } from "../src/services/purchaseService";
import { useSettingsStore } from "../src/store/settingsStore";

function RootNavigator() {
  const language = useSettingsStore((state) => state.language);
  const isReady = useSettingsStore((state) => state.isReady);
  const loadLanguage = useSettingsStore((state) => state.loadLanguage);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  if (!isReady) {
    return null;
  }

  if (!language) {
    return <Redirect href="/language" />;
  }

  return <Redirect href="/(tabs)" />;
}

export default function RootLayout() {
  useEffect(() => {
    initPurchases();
  }, []);

  return (
    <>
      <RootNavigator />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="language" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
