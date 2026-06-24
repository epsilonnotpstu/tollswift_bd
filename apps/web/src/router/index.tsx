import { Suspense, lazy } from 'react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { BottomNav } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';

// ── Eager (tiny, always needed) ─────────────────────────────────────────────
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';

// ── Lazy admin ───────────────────────────────────────────────────────────────
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminVehiclesPage = lazy(() => import('@/pages/admin/AdminVehiclesPage').then((m) => ({ default: m.AdminVehiclesPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminBridgesPage = lazy(() => import('@/pages/admin/AdminBridgesPage').then((m) => ({ default: m.AdminBridgesPage })));
const AdminTransactionsPage = lazy(() => import('@/pages/admin/AdminTransactionsPage').then((m) => ({ default: m.AdminTransactionsPage })));
const AdminAnnouncementsPage = lazy(() => import('@/pages/admin/AdminAnnouncementsPage').then((m) => ({ default: m.AdminAnnouncementsPage })));
const UserDetailPage = lazy(() => import('@/pages/admin/UserDetailPage').then((m) => ({ default: m.UserDetailPage })));
const ScannerPage = lazy(() => import('@/pages/admin/ScannerPage').then((m) => ({ default: m.ScannerPage })));

// ── Lazy user ─────────────────────────────────────────────────────────────────
const SplashPage = lazy(() => import('@/pages/user/auth/SplashPage').then((m) => ({ default: m.SplashPage })));
const OnboardingPage = lazy(() => import('@/pages/user/auth/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const LoginPage = lazy(() => import('@/pages/user/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const OTPPage = lazy(() => import('@/pages/user/auth/OTPPage').then((m) => ({ default: m.OTPPage })));
const RegisterPage = lazy(() => import('@/pages/user/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const HomePage = lazy(() => import('@/pages/user/home/HomePage').then((m) => ({ default: m.HomePage })));
const WalletPage = lazy(() => import('@/pages/user/wallet/WalletPage').then((m) => ({ default: m.WalletPage })));
const DepositPage = lazy(() => import('@/pages/user/wallet/DepositPage').then((m) => ({ default: m.DepositPage })));
const VehiclesPage = lazy(() => import('@/pages/user/vehicle/VehiclesPage').then((m) => ({ default: m.VehiclesPage })));
const AddVehiclePage = lazy(() => import('@/pages/user/vehicle/AddVehiclePage').then((m) => ({ default: m.AddVehiclePage })));
const VehicleDetailPage = lazy(() => import('@/pages/user/vehicle/VehicleDetailPage').then((m) => ({ default: m.VehicleDetailPage })));
const SelectBridgePage = lazy(() => import('@/pages/user/toll/SelectBridgePage').then((m) => ({ default: m.SelectBridgePage })));
const SelectVehiclePage = lazy(() => import('@/pages/user/toll/SelectVehiclePage').then((m) => ({ default: m.SelectVehiclePage })));
const PaymentMethodPage = lazy(() => import('@/pages/user/toll/PaymentMethodPage').then((m) => ({ default: m.PaymentMethodPage })));
const PaymentConfirmPage = lazy(() => import('@/pages/user/toll/PaymentConfirmPage').then((m) => ({ default: m.PaymentConfirmPage })));
const PaymentSuccessPage = lazy(() => import('@/pages/user/toll/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })));
const HistoryPage = lazy(() => import('@/pages/user/history/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const ReceiptPage = lazy(() => import('@/pages/user/history/ReceiptPage').then((m) => ({ default: m.ReceiptPage })));
const MyQRPage = lazy(() => import('@/pages/user/qr/MyQRPage').then((m) => ({ default: m.MyQRPage })));
const ScanPage = lazy(() => import('@/pages/user/qr/ScanPage').then((m) => ({ default: m.ScanPage })));
const ProfilePage = lazy(() => import('@/pages/user/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const NotificationSettingsPage = lazy(() => import('@/pages/user/profile/NotificationSettingsPage').then((m) => ({ default: m.NotificationSettingsPage })));

// ── Loading fallback ──────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-bg">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
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
  { path: '/splash', element: <Suspense fallback={<PageLoader />}><SplashPage /></Suspense> },
  { path: '/onboarding', element: <Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense> },
  { path: '/login', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
  { path: '/otp', element: <Suspense fallback={<PageLoader />}><OTPPage /></Suspense> },
  { path: '/register', element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: '/home', element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },
          { path: '/wallet', element: <Suspense fallback={<PageLoader />}><WalletPage /></Suspense> },
          { path: '/vehicles', element: <Suspense fallback={<PageLoader />}><VehiclesPage /></Suspense> },
          { path: '/history', element: <Suspense fallback={<PageLoader />}><HistoryPage /></Suspense> },
          { path: '/qr', element: <Suspense fallback={<PageLoader />}><MyQRPage /></Suspense> },
          { path: '/profile', element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> }
        ]
      },
      { path: '/wallet/deposit', element: <Suspense fallback={<PageLoader />}><DepositPage /></Suspense> },
      { path: '/wallet/deposit/success', element: <Suspense fallback={<PageLoader />}><DepositPage /></Suspense> },
      { path: '/vehicles/add', element: <Suspense fallback={<PageLoader />}><AddVehiclePage /></Suspense> },
      { path: '/vehicles/:id', element: <Suspense fallback={<PageLoader />}><VehicleDetailPage /></Suspense> },
      { path: '/toll', element: <Navigate to="/toll/select-bridge" replace /> },
      { path: '/toll/select-bridge', element: <Suspense fallback={<PageLoader />}><SelectBridgePage /></Suspense> },
      { path: '/toll/vehicle', element: <Suspense fallback={<PageLoader />}><SelectVehiclePage /></Suspense> },
      { path: '/toll/select-vehicle', element: <Suspense fallback={<PageLoader />}><SelectVehiclePage /></Suspense> },
      { path: '/toll/method', element: <Suspense fallback={<PageLoader />}><PaymentMethodPage /></Suspense> },
      { path: '/toll/payment-method', element: <Suspense fallback={<PageLoader />}><PaymentMethodPage /></Suspense> },
      { path: '/toll/confirm', element: <Suspense fallback={<PageLoader />}><PaymentConfirmPage /></Suspense> },
      { path: '/toll/success', element: <Suspense fallback={<PageLoader />}><PaymentSuccessPage /></Suspense> },
      { path: '/history/:id', element: <Suspense fallback={<PageLoader />}><ReceiptPage /></Suspense> },
      { path: '/qr/scan', element: <Suspense fallback={<PageLoader />}><ScanPage /></Suspense> },
      { path: '/profile/settings', element: <Suspense fallback={<PageLoader />}><NotificationSettingsPage /></Suspense> }
    ]
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>,
        children: [
          { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
          { path: '/admin/dashboard', element: <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense> },
          { path: '/admin/users', element: <Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense> },
          { path: '/admin/users/:id', element: <Suspense fallback={<PageLoader />}><UserDetailPage /></Suspense> },
          { path: '/admin/vehicles', element: <Suspense fallback={<PageLoader />}><AdminVehiclesPage /></Suspense> },
          { path: '/admin/bridges', element: <Suspense fallback={<PageLoader />}><AdminBridgesPage /></Suspense> },
          { path: '/admin/transactions', element: <Suspense fallback={<PageLoader />}><AdminTransactionsPage /></Suspense> },
          { path: '/admin/scanner', element: <Suspense fallback={<PageLoader />}><ScannerPage /></Suspense> },
          { path: '/admin/announcements', element: <Suspense fallback={<PageLoader />}><AdminAnnouncementsPage /></Suspense> }
        ]
      }
    ]
  },
  { path: '*', element: <Navigate to="/splash" replace /> }
]);

export const AppRouter = () => <RouterProvider router={router} />;
