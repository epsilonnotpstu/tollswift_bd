import { createBrowserRouter, Outlet } from 'react-router';
import { PhoneFrame } from './components/PhoneFrame';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { Splash } from './pages/Splash';
import { LanguageSelect } from './pages/LanguageSelect';
import { OTPScreen } from './pages/OTPScreen';
import { BiometricSetup } from './pages/BiometricSetup';
import { Home } from './pages/Home';
import { Wallet } from './pages/Wallet';
import { Notifications } from './pages/Notifications';
import { PayToll } from './pages/PayToll';
import { PaymentConfirm } from './pages/PaymentConfirm';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { Vehicles } from './pages/Vehicles';
import { AddVehicle } from './pages/AddVehicle';
import { AddMoney } from './pages/AddMoney';
import { PassStore } from './pages/PassStore';
import { MyPasses } from './pages/MyPasses';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { HelpDispute } from './pages/HelpDispute';
import { AdminDashboard } from './pages/AdminDashboard';
import { Settings } from './pages/Settings';

function Root() {
  return (
    <PhoneFrame>
      <Outlet />
    </PhoneFrame>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Splash },
      { path: 'language', Component: LanguageSelect },
      { path: 'otp', Component: OTPScreen },
      { path: 'biometric', Component: BiometricSetup },
      { path: 'admin', Component: AdminDashboard },
      {
        path: '',
        Component: AppLayout,
        children: [
          { path: 'home', Component: Home },
          { path: 'wallet', Component: Wallet },
          { path: 'notifications', Component: Notifications },
          { path: 'pay', Component: PayToll },
          { path: 'pay/confirm', Component: PaymentConfirm },
          { path: 'pay/success', Component: PaymentSuccess },
          { path: 'pay/failed', Component: PaymentFailed },
          { path: 'vehicles', Component: Vehicles },
          { path: 'vehicles/add', Component: AddVehicle },
          { path: 'add-money', Component: AddMoney },
          { path: 'passes', Component: PassStore },
          { path: 'my-passes', Component: MyPasses },
          { path: 'history', Component: History },
          { path: 'profile', Component: Profile },
          { path: 'settings', Component: Settings },
          { path: 'help', Component: HelpDispute },
        ],
      },
    ],
  },
]);