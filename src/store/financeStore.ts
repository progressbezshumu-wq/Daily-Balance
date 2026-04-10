import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AssetCategory =
  | "stock"
  | "etf"
  | "crypto"
  | "staking"
  | "deposit"
  | "cash";

export type Currency = "EUR" | "USD" | "UAH";

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  rate: number;
  category: AssetCategory;
  currency: Currency;
};

type NewAsset = Omit<Asset, "id">;

type FinanceStore = {
  activeIncomePerYear: number;
  activeExpensesPerYear: number;

  setActiveIncomePerYear: (value: number) => void;
  setActiveExpensesPerYear: (value: number) => void;

  assets: Asset[];
  addAsset: (asset: NewAsset) => void;
  deleteAsset: (id: string) => void;
  updateAsset: (id: string, updatedFields: Partial<NewAsset>) => void;
  updateAssetPrice: (id: string, currentPrice: number) => void;
  clearAssets: () => void;
};

export const MERGEABLE_TYPES: AssetCategory[] = ["stock", "etf", "crypto"];

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      assets: [],
      activeIncomePerYear: 0,
      activeExpensesPerYear: 0,

      addAsset: (asset) =>
        set((state) => {
          const isMergeable = MERGEABLE_TYPES.includes(asset.category);

          if (!isMergeable) {
            return {
              assets: [
                ...state.assets,
                {
                  ...asset,
                  id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9),
                },
              ],
            };
          }

          const existing = state.assets.find(
            (a) => a.symbol === asset.symbol && a.category === asset.category
          );

          if (!existing) {
            return {
              assets: [
                ...state.assets,
                {
                  ...asset,
                  id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9),
                },
              ],
            };
          }

          const oldQ = Number(existing.quantity || 0);
          const newQ = Number(asset.quantity || 0);

          const oldPrice = Number(existing.buyPrice || 0);
          const newPrice = Number(asset.buyPrice || 0);

          const totalQ = oldQ + newQ;

          const avgPrice =
            totalQ > 0
              ? (oldQ * oldPrice + newQ * newPrice) / totalQ
              : oldPrice;

          const updated = state.assets.map((a) =>
            a.id === existing.id
              ? {
                  ...a,
                  quantity: totalQ,
                  buyPrice: avgPrice,
                }
              : a
          );

          return { assets: updated };
        }),

      deleteAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== id),
        })),

      updateAsset: (id, updatedFields) =>
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === id ? { ...asset, ...updatedFields } : asset
          ),
        })),

      updateAssetPrice: (id, currentPrice) =>
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === id ? { ...asset, currentPrice } : asset
          ),
        })),

      clearAssets: () => set({ assets: [] }),

      setActiveIncomePerYear: (value) =>
        set(() => ({ activeIncomePerYear: value })),

      setActiveExpensesPerYear: (value) =>
        set(() => ({ activeExpensesPerYear: value })),
    }),
    {
      name: "daily-balance-finance-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
