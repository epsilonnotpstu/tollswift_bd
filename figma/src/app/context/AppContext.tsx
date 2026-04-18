import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockUser, mockVehicles } from '../data/mockData';

type Language = 'en' | 'bn';

interface AppContextType {
  user: typeof mockUser;
  balance: number;
  setBalance: (b: number) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  activeVehicleId: string;
  setActiveVehicleId: (id: string) => void;
  pendingToll: {
    gateId: string;
    gateName: string;
    gateNamebn: string;
    amount: number;
    road: string;
  } | null;
  setPendingToll: (toll: AppContextType['pendingToll']) => void;
  biometricEnabled: boolean;
  setBiometricEnabled: (v: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(mockUser.wallet_balance);
  const [language, setLanguage] = useState<Language>('en');
  const [activeVehicleId, setActiveVehicleId] = useState(mockVehicles[0].id);
  const [pendingToll, setPendingToll] = useState<AppContextType['pendingToll']>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AppContext.Provider
      value={{
        user: mockUser,
        balance,
        setBalance,
        language,
        setLanguage,
        activeVehicleId,
        setActiveVehicleId,
        pendingToll,
        setPendingToll,
        biometricEnabled,
        setBiometricEnabled,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
