import { getAssetSnapshot } from "@/src/api/marketApi";

type Snapshot = {
  price: number;
  changePercent24h: number;
};

const cache: Record<string, { data: Snapshot; ts: number }> = {};
const TTL = 60 * 1000;

export const getCachedSnapshot = async (asset: any): Promise<Snapshot> => {
  try {
    if (!asset) return { price: 0, changePercent24h: 0 };

    const key =
      asset.type === "crypto"
        ? asset.id || asset.symbol
        : asset.symbol;

    if (!key) return { price: 0, changePercent24h: 0 };

    const now = Date.now();

    if (cache[key] && now - cache[key].ts < TTL) {
      return cache[key].data;
    }

    const res = await getAssetSnapshot(asset);

    const safe = {
      price: Number(res?.price || 0),
      changePercent24h: Number(res?.changePercent24h || 0),
    };

    cache[key] = { data: safe, ts: now };

    return safe;
  } catch {
    return { price: 0, changePercent24h: 0 };
  }
};
