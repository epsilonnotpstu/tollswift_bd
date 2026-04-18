import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Fingerprint, Bell, Shield, Smartphone, ChevronRight, Lock } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';

export function Settings() {
  const navigate = useNavigate();
  const { language, biometricEnabled, setBiometricEnabled } = useApp();
  const [notifications, setNotifications] = useState({
    tollPaid: true,
    lowBalance: true,
    promotions: false,
    nearbyGates: true,
  });

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ToggleSwitch = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="relative w-12 h-6 rounded-full transition-all"
      style={{ background: value ? '#006A4E' : '#D1D5DB' }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{ left: value ? '26px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
      />
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: '#F7F8FA' }}>
      <div style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '24px' }}>
        <StatusBar dark />
        <div className="px-6 pt-1 flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
            {language === 'bn' ? 'সেটিংস' : 'Settings'}
          </h1>
        </div>
      </div>

      <div className="px-6 pt-5 pb-10 flex flex-col gap-5">
        {/* Security */}
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Security
          </p>
          <div className="bg-white rounded-3xl divide-y divide-gray-50" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#E8F5F1' }}>
                <Fingerprint size={18} color="#006A4E" />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>Biometric Login</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>Touch ID / Face ID</p>
              </div>
              <ToggleSwitch value={biometricEnabled} onToggle={() => setBiometricEnabled(!biometricEnabled)} />
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F3F4F6' }}>
                <Lock size={18} color="#374151" />
              </div>
              <div className="flex-1 text-left">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>Change PIN</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>Update your 4-digit PIN</p>
              </div>
              <ChevronRight size={16} color="#D1D5DB" />
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F3F4F6' }}>
                <Shield size={18} color="#374151" />
              </div>
              <div className="flex-1 text-left">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>Linked Accounts</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>bKash, Nagad, bank cards</p>
              </div>
              <ChevronRight size={16} color="#D1D5DB" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Notifications
          </p>
          <div className="bg-white rounded-3xl divide-y divide-gray-50" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {[
              { key: 'tollPaid' as const, label: 'Toll Payment Alerts', desc: 'When toll is deducted' },
              { key: 'lowBalance' as const, label: 'Low Balance Warning', desc: 'When balance < ৳200' },
              { key: 'nearbyGates' as const, label: 'Nearby Toll Gates', desc: 'Route-based alerts' },
              { key: 'promotions' as const, label: 'Promotions & Offers', desc: 'Pass deals and discounts' },
            ].map(item => (
              <div key={item.key} className="flex items-center gap-3 px-4 py-3.5">
                <Bell size={16} color="#6B7280" className="flex-shrink-0" />
                <div className="flex-1">
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1A1A2E' }}>{item.label}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>{item.desc}</p>
                </div>
                <ToggleSwitch value={notifications[item.key]} onToggle={() => toggleNotif(item.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Device */}
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            About
          </p>
          <div className="bg-white rounded-3xl divide-y divide-gray-50" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {[
              { label: 'App Version', value: 'v2.4.1' },
              { label: 'Build', value: '2026.04.18' },
              { label: 'Developer', value: 'BRTA Digital' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3.5">
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#374151' }}>{item.label}</span>
                <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '12px', color: '#9CA3AF' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
