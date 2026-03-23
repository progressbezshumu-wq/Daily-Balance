import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LiabilityPaymentPeriod = "daily" | "monthly" | "yearly";

export type Liability = {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  paymentAmount: number;
  paymentPeriod: LiabilityPaymentPeriod;
  yearlyPayment?: number;
};

type NewLiability = Omit<Liability, "id">;

type LiabilityStore = {
  liabilities: Liability[];
  addLiability: (liability: NewLiability) => void;
  deleteLiability: (id: string) => void;
  updateLiability: (id: string, updatedFields: Partial<NewLiability>) => void;
  clearLiabilities: () => void;
};

export const useLiabilityStore = create<LiabilityStore>()(
  persist(
    (set) => ({
      liabilities: [],

      addLiability: (liability) =>
        set((state) => ({
          liabilities: [
            ...state.liabilities,
            {
              ...liability,
              id: Math.random().toString(36).slice(2, 11),
            },
          ],
        })),

      deleteLiability: (id) =>
        set((state) => ({
          liabilities: state.liabilities.filter((liability) => liability.id !== id),
        })),

      updateLiability: (id, updatedFields) =>
        set((state) => ({
          liabilities: state.liabilities.map((liability) =>
            liability.id === id ? { ...liability, ...updatedFields } : liability
          ),
        })),

      clearLiabilities: () => set({ liabilities: [] }),
    }),
    {
      name: "daily-balance-liability-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
