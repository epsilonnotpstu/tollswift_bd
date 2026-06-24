import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const Page = ({ title }: { title: string }) => (
  <main className="min-h-screen bg-bg px-5 py-8 font-bengali text-text-primary">
    <section className="mx-auto flex max-w-md flex-col gap-3">
      <div className="text-sm font-semibold text-primary">TollBD</div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-text-secondary">এই পেজের পূর্ণ UI পরের implementation prompt-এ যুক্ত হবে।</p>
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

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/splash" replace /> },
  { path: '/splash', element: <Page title="Splash" /> },
  { path: '/onboarding', element: <Page title="Onboarding" /> },
  { path: '/login', element: <Page title="Login" /> },
  { path: '/otp', element: <Page title="OTP Verification" /> },
  { path: '/register', element: <Page title="Register" /> },
  { path: '/admin/login', element: <Page title="Admin Login" /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/home', element: <Page title="Home" /> },
      { path: '/wallet', element: <Page title="Wallet" /> },
      { path: '/wallet/deposit', element: <Page title="Deposit" /> },
      { path: '/vehicles', element: <Page title="Vehicles" /> },
      { path: '/vehicles/add', element: <Page title="Add Vehicle" /> },
      { path: '/vehicles/:id', element: <Page title="Vehicle Detail" /> },
      { path: '/toll', element: <Navigate to="/toll/select-bridge" replace /> },
      { path: '/toll/select-bridge', element: <Page title="Select Bridge" /> },
      { path: '/toll/select-vehicle', element: <Page title="Select Vehicle" /> },
      { path: '/toll/payment-method', element: <Page title="Payment Method" /> },
      { path: '/toll/confirm', element: <Page title="Confirm Payment" /> },
      { path: '/toll/success', element: <Page title="Payment Success" /> },
      { path: '/history', element: <Page title="History" /> },
      { path: '/history/:id', element: <Page title="Receipt" /> },
      { path: '/qr', element: <Page title="My QR" /> },
      { path: '/qr/scan', element: <Page title="QR Scan" /> },
      { path: '/profile', element: <Page title="Profile" /> },
      { path: '/profile/settings', element: <Page title="Settings" /> }
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
      { path: '/admin/scanner', element: <Page title="Admin Scanner" /> },
      { path: '/admin/announcements', element: <Page title="Admin Announcements" /> }
    ]
  },
  { path: '*', element: <Navigate to="/splash" replace /> }
]);

export const AppRouter = () => <RouterProvider router={router} />;
