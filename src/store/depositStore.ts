import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Deposit = {
  id: string;
  name: string;
  principal: number;
  annualRate: number;
  startDate: string;
  reviewDate: string;
  notes?: string;
  calendarEventId?: string;
};

type NewDeposit = Omit<Deposit, "id">;

type DepositStore = {
  deposits: Deposit[];
  addDeposit: (deposit: NewDeposit) => void;
  updateDeposit: (id: string, updatedFields: Partial<NewDeposit>) => void;
  deleteDeposit: (id: string) => void;
  clearDeposits: () => void;
};

export const useDepositStore = create<DepositStore>()(
  persist(
    (set) => ({
      deposits: [],

      addDeposit: (deposit) =>
        set((state) => ({
          deposits: [
            ...state.deposits,
            {
              ...deposit,
              id: Math.random().toString(36).slice(2, 11),
            },
          ],
        })),

      updateDeposit: (id, updatedFields) =>
        set((state) => ({
          deposits: state.deposits.map((deposit) =>
            deposit.id === id ? { ...deposit, ...updatedFields } : deposit
          ),
        })),

      deleteDeposit: (id) =>
        set((state) => ({
          deposits: state.deposits.filter((deposit) => deposit.id !== id),
        })),

      clearDeposits: () => set({ deposits: [] }),
    }),
    {
      name: "daily-balance-deposit-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
