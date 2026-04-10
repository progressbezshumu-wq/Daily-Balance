import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { searchAssets } from "../api/marketApi";

const CARD = "rgba(10, 14, 28, 0.78)";
const BORDER = "rgba(96, 165, 250, 0.16)";
const TEXT = "#EAF2FF";
const MUTED = "#7C8AA5";

type SearchItem = {
  symbol: string;
  name: string;
  type?: string;
  id?: string;
};

type Props = {
  onSelect: (asset: SearchItem) => void;
};

export default function AssetSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const data = await searchAssets(query.trim());
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <View style={styles.wrap}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search asset..."
        placeholderTextColor={MUTED}
        autoCapitalize="characters"
        style={styles.input}
      />

      {loading ? <ActivityIndicator style={styles.loader} /> : null}

      {results.length > 0 ? (
        <View style={styles.dropdown}>
          {results.map((item, index) => (
            <Pressable
              key={`${item.symbol}-${item.id ?? index}`}
              onPress={() => {
                onSelect(item);
                setQuery(item.symbol);
                setResults([]);
              }}
              style={styles.item}
            >
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.name}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
    color: TEXT,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loader: {
    marginTop: 6,
  },
  dropdown: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
    overflow: "hidden",
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.08)",
  },
  symbol: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  name: {
    color: MUTED,
    fontSize: 13,
    marginTop: 2,
  },
});
