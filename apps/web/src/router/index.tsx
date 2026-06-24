import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { BottomNav } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';
import { SplashPage } from '@/pages/user/auth/SplashPage';
import { OnboardingPage } from '@/pages/user/auth/OnboardingPage';
import { LoginPage } from '@/pages/user/auth/LoginPage';
import { OTPPage } from '@/pages/user/auth/OTPPage';
import { RegisterPage } from '@/pages/user/auth/RegisterPage';
import { HomePage } from '@/pages/user/home/HomePage';
import { WalletPage } from '@/pages/user/wallet/WalletPage';
import { DepositPage } from '@/pages/user/wallet/DepositPage';
import { VehiclesPage } from '@/pages/user/vehicle/VehiclesPage';
import { AddVehiclePage } from '@/pages/user/vehicle/AddVehiclePage';
import { VehicleDetailPage } from '@/pages/user/vehicle/VehicleDetailPage';
import { SelectBridgePage } from '@/pages/user/toll/SelectBridgePage';
import { SelectVehiclePage } from '@/pages/user/toll/SelectVehiclePage';
import { PaymentMethodPage } from '@/pages/user/toll/PaymentMethodPage';
import { PaymentConfirmPage } from '@/pages/user/toll/PaymentConfirmPage';
import { PaymentSuccessPage } from '@/pages/user/toll/PaymentSuccessPage';
import { HistoryPage } from '@/pages/user/history/HistoryPage';
import { ReceiptPage } from '@/pages/user/history/ReceiptPage';
import { MyQRPage } from '@/pages/user/qr/MyQRPage';
import { ScanPage } from '@/pages/user/qr/ScanPage';
import { ProfilePage } from '@/pages/user/profile/ProfilePage';
import { NotificationSettingsPage } from '@/pages/user/profile/NotificationSettingsPage';

const Page = ({ title }: { title: string }) => (
  <main className="min-h-screen bg-bg px-5 py-8 font-bengali text-text-primary">
    <section className="mx-auto flex max-w-md flex-col gap-3">
      <div className="text-sm font-semibold text-primary">TollBD</div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-text-secondary">এই admin screen পরের prompt-এ পূর্ণ করা হবে।</p>
    </section>
  </main>
);

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/home" replace />;
};

const UserLayout = () => (
  <div className="min-h-screen bg-bg text-text-primary">
    <Outlet />
    <BottomNav />
  </div>
);

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/splash" replace /> },
  { path: '/splash', element: <SplashPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/otp', element: <OTPPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/admin/login', element: <Page title="Admin Login" /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: '/home', element: <HomePage /> },
          { path: '/wallet', element: <WalletPage /> },
          { path: '/vehicles', element: <VehiclesPage /> },
          { path: '/history', element: <HistoryPage /> },
          { path: '/qr', element: <MyQRPage /> },
          { path: '/profile', element: <ProfilePage /> }
        ]
      },
      { path: '/wallet/deposit', element: <DepositPage /> },
      { path: '/wallet/deposit/success', element: <DepositPage /> },
      { path: '/vehicles/add', element: <AddVehiclePage /> },
      { path: '/vehicles/:id', element: <VehicleDetailPage /> },
      { path: '/toll', element: <Navigate to="/toll/select-bridge" replace /> },
      { path: '/toll/select-bridge', element: <SelectBridgePage /> },
      { path: '/toll/vehicle', element: <SelectVehiclePage /> },
      { path: '/toll/select-vehicle', element: <SelectVehiclePage /> },
      { path: '/toll/method', element: <PaymentMethodPage /> },
      { path: '/toll/payment-method', element: <PaymentMethodPage /> },
      { path: '/toll/confirm', element: <PaymentConfirmPage /> },
      { path: '/toll/success', element: <PaymentSuccessPage /> },
      { path: '/history/:id', element: <ReceiptPage /> },
      { path: '/qr/scan', element: <ScanPage /> },
      { path: '/profile/settings', element: <NotificationSettingsPage /> }
    ]
  },
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
      { path: '/admin/dashboard', element: <Page title="Admin Dashboard" /> },
      { path: '/admin/users', element: <Page title="Admin Users" /> },
      { path: '/admin/users/:id', element: <Page title="Admin User Detail" /> },
      { path: '/admin/vehicles', element: <Page title="Admin Vehicles" /> },
      { path: '/admin/bridges', element: <Page title="Admin Bridges" /> },
      { path: '/admin/toll-rates', element: <Page title="Admin Toll Rates" /> },
      { path: '/admin/transactions', element: <Page title="Admin Transactions" /> },
      { path: '/admin/scanner', element: <ScanPage /> },
      { path: '/admin/announcements', element: <Page title="Admin Announcements" /> }
    ]
  },
  { path: '*', element: <Navigate to="/splash" replace /> }
]);

export const AppRouter = () => <RouterProvider router={router} />;
