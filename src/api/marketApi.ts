import axios from "axios";

const FINNHUB_API_KEY = process.env.EXPO_PUBLIC_FINNHUB_API_KEY;

const finnhub = axios.create({
  baseURL: "https://finnhub.io/api/v1",
  params: {
    token: FINNHUB_API_KEY,
  },
});

const coingecko = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
});

export const searchAssets = async (query: string) => {
  if (!query.trim()) return [];

  const q = query.trim();
  const upperQ = q.toUpperCase();
  const lowerQ = q.toLowerCase();

  const [stocksRes, cryptoRes] = await Promise.allSettled([
    FINNHUB_API_KEY
      ? finnhub.get("/search", { params: { q } })
      : Promise.resolve({ data: { result: [] } }),
    coingecko.get("/search", { params: { query: q } }),
  ]);

  const stockResults =
    stocksRes.status === "fulfilled"
      ? (stocksRes.value.data.result ?? [])
          .filter((item: any) => item.symbol && item.description)
          .map((item: any) => ({
            symbol: String(item.symbol ?? "").toUpperCase(),
            name: item.description,
            type: item.type?.toLowerCase() === "etf" ? "etf" : "stock",
          }))
      : [];

  const cryptoResults =
    cryptoRes.status === "fulfilled"
      ? (cryptoRes.value.data.coins ?? []).map((item: any) => ({
          symbol: String(item.symbol ?? "").toUpperCase(),
          name: item.name,
          id: item.id,
          type: "crypto",
          marketCapRank: item.market_cap_rank ?? 999999,
        }))
      : [];

  const scoreItem = (item: any) => {
    const symbol = String(item.symbol ?? "").toUpperCase();
    const name = String(item.name ?? "").toLowerCase();

    let score = 0;

    if (symbol === upperQ) score += 1000;
    else if (symbol.startsWith(upperQ)) score += 600;
    else if (symbol.includes(upperQ)) score += 250;

    if (name === lowerQ) score += 500;
    else if (name.startsWith(lowerQ)) score += 220;
    else if (name.includes(lowerQ)) score += 100;

    if (item.type === "crypto") {
      score += Math.max(0, 250 - Number(item.marketCapRank || 999999));
    }

    return score;
  };

  const merged = [...cryptoResults, ...stockResults]
    .map((item) => ({ ...item, _score: scoreItem(item) }))
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      if ((a.marketCapRank ?? 999999) !== (b.marketCapRank ?? 999999)) {
        return (a.marketCapRank ?? 999999) - (b.marketCapRank ?? 999999);
      }
      return String(a.symbol).localeCompare(String(b.symbol));
    });

  const seen = new Set();

  return merged
    .filter((item) => {
      const key = `${item.type}:${item.symbol}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8)
    .map(({ _score, ...item }) => item);
};

export const getAssetSnapshot = async (asset: any) => {
  if (asset?.type === "crypto" && asset?.id) {
    const res = await coingecko.get("/simple/price", {
      params: {
        ids: asset.id,
        vs_currencies: "usd",
        include_24hr_change: true,
      },
    });

    return {
      price: Number(res.data?.[asset.id]?.usd ?? 0),
      changePercent24h: Number(res.data?.[asset.id]?.usd_24h_change ?? 0),
    };
  }

  if (!FINNHUB_API_KEY) {
    return {
      price: 0,
      changePercent24h: 0,
    };
  }

  const res = await finnhub.get("/quote", {
    params: { symbol: asset.symbol },
  });

  return {
    price: Number(res.data?.c ?? 0),
    changePercent24h: Number(res.data?.dp ?? 0),
  };
};
