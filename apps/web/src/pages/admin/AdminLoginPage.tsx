import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authApi from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Email and password required');
    setLoading(true);
    try {
      const data = await authApi.loginEmail({ email, password });
      if (data.user.role !== 'ADMIN') {
        toast.error('Admin access only');
        return;
      }
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f1b3d] to-[#1B4FDB] p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TollBD Admin</h1>
          <p className="mt-1 text-sm text-white/60">Management Portal</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/70">Email Address</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 focus-within:border-white/60">
              <Mail className="h-4 w-4 shrink-0 text-white/50" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
                placeholder="admin@tollbd.com.bd"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/70">Password</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 focus-within:border-white/60">
              <Lock className="h-4 w-4 shrink-0 text-white/50" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShow((v) => !v)} className="text-white/50">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          <button
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-white py-3.5 text-sm font-bold text-[#1B4FDB] transition hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-white/40">TollBD Admin Portal · Authorized Personnel Only</p>
      </div>
    </main>
  );
};
