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

export type FinanceHistoryEntry = {
  date: string;
  dailyBalance: number;
  netWorth: number;
};

type NewAsset = Omit<Asset, "id">;

type FinanceStore = {
  activeIncomePerYear: number;
  activeExpensesPerYear: number;

  setActiveIncomePerYear: (value: number) => void;
  setActiveExpensesPerYear: (value: number) => void;

  assets: Asset[];
  history: FinanceHistoryEntry[];

  addAsset: (asset: NewAsset) => void;
  deleteAsset: (id: string) => void;
  updateAsset: (id: string, updatedFields: Partial<NewAsset>) => void;
  updateAssetPrice: (id: string, currentPrice: number) => void;
  clearAssets: () => void;

  recordTodaySnapshot: () => void;
};

export const MERGEABLE_TYPES: AssetCategory[] = ["stock", "etf", "crypto"];

function makeId() {
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function toSafeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function calculateNetWorth(assets: Asset[]) {
  return assets.reduce((sum, asset) => {
    return sum + toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
  }, 0);
}

function calculateDailyBalance(
  assets: Asset[],
  activeIncomePerYear: number,
  activeExpensesPerYear: number
) {
  const passiveIncomePerYear = assets.reduce((sum, asset) => {
    const rate = toSafeNumber(asset.rate);
    if (rate <= 0) return sum;

    const value = toSafeNumber(asset.quantity) * toSafeNumber(asset.currentPrice);
    return sum + value * (rate / 100);
  }, 0);

  return (
    (toSafeNumber(activeIncomePerYear) +
      passiveIncomePerYear -
      toSafeNumber(activeExpensesPerYear)) / 365
  );
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      assets: [],
      history: [],
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
                  id: makeId(),
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
                  id: makeId(),
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

      recordTodaySnapshot: () => {
        const state = get();
        const today = getTodayKey();

        const netWorth = calculateNetWorth(state.assets);
        const dailyBalance = calculateDailyBalance(
          state.assets,
          state.activeIncomePerYear,
          state.activeExpensesPerYear
        );

        const hasToday = state.history.some((item) => item.date === today);

        if (hasToday) {
          set((current) => ({
            history: current.history.map((item) =>
              item.date === today
                ? { ...item, netWorth, dailyBalance }
                : item
            ),
          }));
          return;
        }

        set((current) => ({
          history: [
            ...current.history,
            {
              date: today,
              netWorth,
              dailyBalance,
            },
          ],
        }));
      },
    }),
    {
      name: "daily-balance-finance-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
