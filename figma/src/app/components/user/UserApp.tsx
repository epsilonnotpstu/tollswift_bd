import { useState } from "react";
import { Home, Wallet, QrCode, Clock, User } from "lucide-react";
import { SplashScreen, OnboardingScreen, LoginScreen, OTPScreen, RegisterScreen } from "./AuthScreens";
import { HomeScreen } from "./HomeScreen";
import { WalletScreen, AddMoneyScreen } from "./WalletScreen";
import { VehiclesScreen, AddVehicleStep1, AddVehicleStep2 } from "./VehicleScreens";
import {
  SelectBridgeScreen,
  SelectVehicleScreen,
  PaymentMethodScreen,
  ConfirmPaymentScreen,
  PaymentSuccessScreen,
} from "./PaymentFlow";
import { HistoryScreen, ReceiptScreen, QRScreen, ProfileScreen } from "./HistoryQRProfile";

type Screen =
  | "splash"
  | "onboarding"
  | "login"
  | "otp"
  | "register"
  | "home"
  | "wallet"
  | "addmoney"
  | "vehicles"
  | "addvehicle"
  | "addvehicle2"
  | "pay"
  | "selectvehicle"
  | "paymethod"
  | "confirm"
  | "success"
  | "history"
  | "receipt"
  | "qr"
  | "profile";

type NavTab = "home" | "wallet" | "qr" | "history" | "profile";

interface UserAppProps {
  onAdminLogin: () => void;
}

export function UserApp({ onAdminLogin }: UserAppProps) {
  const [screen, setScreen] = useState<Screen>("splash");
  const [tab, setTab] = useState<NavTab>("home");
  const [selectedBridge, setSelectedBridge] = useState("");

  const isAuthScreen = ["splash", "onboarding", "login", "otp", "register"].includes(screen);
  const isFullScreen = [
    "success",
    "addvehicle",
    "addvehicle2",
    "pay",
    "selectvehicle",
    "paymethod",
    "confirm",
    "addmoney",
    "receipt",
  ].includes(screen);

  const navigate = (s: Screen) => setScreen(s);

  // Map navigation strings to screens
  const handleNavigate = (dest: string) => {
    const map: Record<string, Screen> = {
      pay: "pay",
      qr: "qr",
      vehicles: "vehicles",
      history: "history",
      addmoney: "addmoney",
      addvehicle: "addvehicle",
      receipt: "receipt",
      home: "home",
      wallet: "wallet",
      profile: "profile",
    };
    if (map[dest]) setScreen(map[dest]);
  };

  const handleTabPress = (t: NavTab) => {
    setTab(t);
    const tabScreenMap: Record<NavTab, Screen> = {
      home: "home",
      wallet: "wallet",
      qr: "qr",
      history: "history",
      profile: "profile",
    };
    setScreen(tabScreenMap[t]);
  };

  const renderScreen = () => {
    switch (screen) {
      case "splash":
        return <SplashScreen onFinish={() => navigate("onboarding")} />;
      case "onboarding":
        return <OnboardingScreen onFinish={() => navigate("login")} />;
      case "login":
        return (
          <LoginScreen
            onLogin={() => navigate("otp")}
            onRegister={() => navigate("register")}
            onAdminLogin={onAdminLogin}
          />
        );
      case "otp":
        return <OTPScreen onVerify={() => navigate("home")} onBack={() => navigate("login")} />;
      case "register":
        return <RegisterScreen onComplete={() => navigate("home")} onBack={() => navigate("login")} />;
      case "home":
        return <HomeScreen onNavigate={handleNavigate} />;
      case "wallet":
        return <WalletScreen onNavigate={handleNavigate} />;
      case "addmoney":
        return <AddMoneyScreen onBack={() => navigate("wallet")} onSuccess={() => { navigate("wallet"); }} />;
      case "vehicles":
        return <VehiclesScreen onNavigate={handleNavigate} />;
      case "addvehicle":
        return <AddVehicleStep1 onNext={() => navigate("addvehicle2")} onBack={() => navigate("vehicles")} />;
      case "addvehicle2":
        return <AddVehicleStep2 onSubmit={() => navigate("vehicles")} onBack={() => navigate("addvehicle")} />;
      case "pay":
        return (
          <SelectBridgeScreen
            onSelect={(b) => { setSelectedBridge(b); navigate("selectvehicle"); }}
            onBack={() => navigate("home")}
          />
        );
      case "selectvehicle":
        return (
          <SelectVehicleScreen
            bridge={selectedBridge}
            onSelect={() => navigate("paymethod")}
            onBack={() => navigate("pay")}
          />
        );
      case "paymethod":
        return <PaymentMethodScreen onConfirm={() => navigate("confirm")} onBack={() => navigate("selectvehicle")} />;
      case "confirm":
        return <ConfirmPaymentScreen onPay={() => navigate("success")} onBack={() => navigate("paymethod")} />;
      case "success":
        return (
          <PaymentSuccessScreen
            onHome={() => { setTab("home"); navigate("home"); }}
            onPayAnother={() => navigate("pay")}
            onReceipt={() => navigate("receipt")}
          />
        );
      case "history":
        return <HistoryScreen onNavigate={handleNavigate} />;
      case "receipt":
        return <ReceiptScreen onBack={() => navigate("history")} />;
      case "qr":
        return <QRScreen onNavigate={handleNavigate} />;
      case "profile":
        return <ProfileScreen onNavigate={handleNavigate} onLogout={() => navigate("login")} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  const navTabs: { id: NavTab; icon: typeof Home; label: string }[] = [
    { id: "home", icon: Home, label: "হোম" },
    { id: "wallet", icon: Wallet, label: "ওয়ালেট" },
    { id: "qr", icon: QrCode, label: "QR" },
    { id: "history", icon: Clock, label: "ইতিহাস" },
    { id: "profile", icon: User, label: "প্রোফাইল" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-hidden">
      {/* Screen content */}
      <div className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </div>

      {/* Bottom Nav */}
      {!isAuthScreen && !isFullScreen && (
        <nav className="bg-white border-t border-[#E4E9F5] flex items-center h-16 px-2 flex-shrink-0">
          {navTabs.map((navTab) => {
            const Icon = navTab.icon;
            const isQR = navTab.id === "qr";
            const isActive = tab === navTab.id;

            if (isQR) {
              return (
                <button
                  key={navTab.id}
                  onClick={() => handleTabPress(navTab.id)}
                  className="flex-1 flex flex-col items-center justify-center relative"
                >
                  <div className="absolute -top-5 w-14 h-14 bg-[#1B4FDB] rounded-full flex items-center justify-center shadow-lg shadow-[#1B4FDB]/40 active:scale-95 transition-transform">
                    <QrCode size={22} className="text-white" />
                  </div>
                  <span className="text-[9px] text-[#8A97B5] mt-7 font-['Hind_Siliguri']">QR</span>
                </button>
              );
            }

            return (
              <button
                key={navTab.id}
                onClick={() => handleTabPress(navTab.id)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative"
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-1 bg-[#1B4FDB] rounded-b-full" />
                )}
                <Icon size={20} className={isActive ? "text-[#1B4FDB]" : "text-[#8A97B5]"} />
                <span className={`text-[9px] font-medium font-['Hind_Siliguri'] ${isActive ? "text-[#1B4FDB]" : "text-[#8A97B5]"}`}>
                  {navTab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
