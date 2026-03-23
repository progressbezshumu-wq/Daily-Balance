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

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  rate: number;
  category: AssetCategory;
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

  clearAssets: () => void;
};

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      assets: [],

      activeIncomePerYear: 0,
      activeExpensesPerYear: 0,

      addAsset: (asset) =>
        set((state) => ({
          assets: [
            ...state.assets,
            {
              ...asset,
              category: asset.category ?? "crypto",
              id: Math.random().toString(36).slice(2, 11),
            },
          ],
        })),

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
