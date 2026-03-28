import Purchases from "react-native-purchases";

export async function initPurchases() {
  try {
    await Purchases.configure({
      apiKey: "YOUR_REVENUECAT_API_KEY",
    });
  } catch (e) {
    console.log("Purchases init error", e);
  }
}
