import { useState } from "react";
import { Toaster } from "sonner";
import { UserApp } from "./components/user/UserApp";
import { AdminApp } from "./components/admin/AdminApp";
import { AdminLogin } from "./components/admin/AdminLogin";

type AppMode = "user" | "admin-login" | "admin";

export default function App() {
  const [mode, setMode] = useState<AppMode>("user");

  return (
    <div className="w-full h-screen overflow-hidden bg-[#F8F9FD] font-['Inter',sans-serif]">
      {mode === "user" && (
        <UserApp onAdminLogin={() => setMode("admin-login")} />
      )}
      {mode === "admin-login" && (
        <AdminLogin
          onLogin={() => setMode("admin")}
          onBack={() => setMode("user")}
        />
      )}
      {mode === "admin" && (
        <AdminApp onLogout={() => setMode("user")} />
      )}
      <Toaster position="bottom-center" richColors />
    </div>
  );
}
