import { Text, View } from "react-native";

export default function LiabilitiesScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f1115",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 24, fontWeight: "700" }}>
        Liabilities
      </Text>
    </View>
  );
}
