import { useState } from "react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-[#E4E9F5] p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1B4FDB] rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-[#1B4FDB]/30">
            🌉
          </div>
          <h1 className="text-xl font-bold text-[#0F1729]">TollBD Admin</h1>
          <p className="text-sm text-[#5C6B8A] mt-1 font-['Hind_Siliguri']">প্রশাসক লগ ইন</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">অ্যাডমিন ইমেইল</label>
            <div className="flex items-center bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] overflow-hidden focus-within:border-[#1B4FDB] focus-within:ring-2 focus-within:ring-[#1B4FDB]/10">
              <div className="px-3 py-3.5"><Mail size={18} className="text-[#8A97B5]" /></div>
              <input
                type="email"
                placeholder="admin@tollbd.gov.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent pr-3 py-3.5 text-sm text-[#0F1729] outline-none placeholder:text-[#8A97B5]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">পাসওয়ার্ড</label>
            <div className="flex items-center bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] overflow-hidden focus-within:border-[#1B4FDB] focus-within:ring-2 focus-within:ring-[#1B4FDB]/10">
              <div className="px-3 py-3.5"><Lock size={18} className="text-[#8A97B5]" /></div>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent py-3.5 text-sm text-[#0F1729] outline-none placeholder:text-[#8A97B5]"
              />
              <button onClick={() => setShowPass(!showPass)} className="px-3 py-3.5">
                {showPass ? <EyeOff size={18} className="text-[#8A97B5]" /> : <Eye size={18} className="text-[#8A97B5]" />}
              </button>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full bg-[#1B4FDB] text-white py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform mt-2"
          >
            লগ ইন করুন
          </button>
        </div>

        <button onClick={onBack} className="w-full text-center text-xs text-[#8A97B5] mt-5 underline">
          ← ব্যবহারকারী অ্যাপে ফিরুন
        </button>
      </div>

      {/* Demo credentials note */}
      <div className="mt-4 bg-[#EEF2FF] border border-[#C7D4FF] rounded-xl px-4 py-3 text-xs text-[#1B4FDB] max-w-sm w-full">
        <p className="font-semibold mb-1">Demo Credentials</p>
        <p>Email: admin@tollbd.gov.bd</p>
        <p>Password: admin123</p>
      </div>
    </div>
  );
}
