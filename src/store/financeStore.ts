import { create } from "zustand";

export type AssetType = "crypto" | "stock" | "cash";

export type Asset = {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currency: "EUR";
  rate: number;
};

type FinanceState = {
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
};

export const useFinanceStore = create<FinanceState>((set) => ({
  assets: [],

  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, asset],
    })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),
}));
