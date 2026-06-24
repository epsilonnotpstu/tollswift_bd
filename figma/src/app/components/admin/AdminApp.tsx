import { AdminLayout } from "./AdminLayout";
import { AdminDashboard } from "./AdminDashboard";
import {
  AdminUsersPage,
  AdminVehiclesPage,
  AdminBridgesPage,
  AdminTransactionsPage,
  AdminQRScannerPage,
  AdminAnnouncementsPage,
} from "./AdminPages";

type AdminPage = "dashboard" | "users" | "vehicles" | "bridges" | "transactions" | "qrscanner" | "announcements" | "settings";

interface AdminAppProps {
  onLogout: () => void;
}

export function AdminApp({ onLogout }: AdminAppProps) {
  return (
    <AdminLayout onLogout={onLogout}>
      {(page, navigate) => {
        switch (page) {
          case "dashboard":
            return <AdminDashboard onNavigate={navigate} />;
          case "users":
            return <AdminUsersPage />;
          case "vehicles":
            return <AdminVehiclesPage />;
          case "bridges":
            return <AdminBridgesPage />;
          case "transactions":
            return <AdminTransactionsPage />;
          case "qrscanner":
            return <AdminQRScannerPage />;
          case "announcements":
            return <AdminAnnouncementsPage />;
          default:
            return (
              <div className="bg-white rounded-2xl border border-[#E4E9F5] p-12 flex flex-col items-center text-center">
                <div className="text-5xl mb-4">🚧</div>
                <h3 className="font-semibold text-[#0F1729] font-['Hind_Siliguri']">শীঘ্রই আসছে</h3>
                <p className="text-sm text-[#5C6B8A] mt-2">এই পেজটি নির্মাণাধীন</p>
              </div>
            );
        }
      }}
    </AdminLayout>
  );
}
