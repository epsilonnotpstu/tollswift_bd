import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isOnline: boolean;
  selectedBridgeId: string | null;
  selectedVehicleId: string | null;
  selectedPaymentMethod: string | null;
  setOnline: (isOnline: boolean) => void;
  setTollSelection: (bridgeId?: string | null, vehicleId?: string | null, method?: string | null) => void;
  clearTollSelection: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      selectedBridgeId: null,
      selectedVehicleId: null,
      selectedPaymentMethod: null,
      setOnline: (isOnline) => set({ isOnline }),
      setTollSelection: (bridgeId, vehicleId, method) =>
        set((state) => ({
          selectedBridgeId: bridgeId === undefined ? state.selectedBridgeId : bridgeId,
          selectedVehicleId: vehicleId === undefined ? state.selectedVehicleId : vehicleId,
          selectedPaymentMethod: method === undefined ? state.selectedPaymentMethod : method
        })),
      clearTollSelection: () =>
        set({ selectedBridgeId: null, selectedVehicleId: null, selectedPaymentMethod: null })
    }),
    { name: 'tollbd-ui' }
  )
);
