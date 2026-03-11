import { create } from "zustand";

export type Asset = {
  id: string;
  name: string;
  value: number;
};

type FinanceState = {
  assets: Asset[];
  addAsset: (name: string, value: number) => void;
  removeAsset: (id: string) => void;
};

export const useFinanceStore = create<FinanceState>((set) => ({
  assets: [],

  addAsset: (name, value) =>
    set((state) => ({
      assets: [
        ...state.assets,
        {
          id: Date.now().toString(),
          name,
          value,
        },
      ],
    })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),
}));
