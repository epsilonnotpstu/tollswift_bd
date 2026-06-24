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
          selectedBridgeId: bridgeId ?? state.selectedBridgeId,
          selectedVehicleId: vehicleId ?? state.selectedVehicleId,
          selectedPaymentMethod: method ?? state.selectedPaymentMethod
        })),
      clearTollSelection: () =>
        set({ selectedBridgeId: null, selectedVehicleId: null, selectedPaymentMethod: null })
    }),
    { name: 'tollbd-ui' }
  )
);
