import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck, Bell, Globe, HelpCircle, Settings, LogOut,
  ChevronRight, Fingerprint, Car, Wallet, Ticket
} from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const { user, language, setLanguage, balance } = useApp();

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: Wallet, label: 'Wallet', labelbn: 'ওয়ালেট', path: '/wallet', value: `৳${balance.toFixed(0)}`, valueColor: '#006A4E' },
        { icon: Car, label: 'My Vehicles', labelbn: 'আমার গাড়ি', path: '/vehicles', value: '3 vehicles', valueColor: '#6B7280' },
        { icon: Ticket, label: 'My Passes', labelbn: 'আমার পাস', path: '/my-passes', value: '1 active', valueColor: '#10B981' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', labelbn: 'বিজ্ঞপ্তি', path: '/notifications', value: null, valueColor: '#6B7280' },
        { icon: Fingerprint, label: 'Biometric Login', labelbn: 'বায়োমেট্রিক', path: '/settings', value: 'Enabled', valueColor: '#10B981' },
        { icon: Settings, label: 'Settings', labelbn: 'সেটিংস', path: '/settings', value: null, valueColor: '#6B7280' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Disputes', labelbn: 'সাহায্য ও অভিযোগ', path: '/help', value: null, valueColor: '#6B7280' },
      ],
    },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: '#F7F8FA' }}>
      {/* Green header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '32px' }}
      >
        <svg className="absolute bottom-0 right-0 opacity-10" width="160" height="100" viewBox="0 0 160 100" fill="none">
          <path d="M0 100 L60 15 L70 15 L80 15 L160 100 Z" fill="white" />
        </svg>
        <StatusBar dark />
        <div className="px-6 pt-2">
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
            {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
          </h1>
        </div>

        {/* Avatar + info */}
        <div className="px-6 mt-5 flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', fontSize: '28px' }}
          >
            👤
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'Hind Siliguri, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
              }}
            >
              {language === 'bn' ? user.namebn : user.name}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              {user.phone}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <ShieldCheck size={11} color="#4ADE80" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700, color: '#4ADE80' }}>
                  NID Verified
                </span>
              </div>
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>
                  Member since Jan 2024
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language toggle */}
      <div className="mx-6 -mt-4 bg-white rounded-2xl p-4 flex items-center justify-between z-10 relative" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center gap-3">
          <Globe size={20} color="#006A4E" />
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#1A1A2E' }}>Language</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF' }}>
              {language === 'bn' ? 'বাংলা' : 'English'}
            </p>
          </div>
        </div>
        <div className="flex bg-gray-100 rounded-full p-0.5">
          {(['en', 'bn'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className="px-3 py-1 rounded-full transition-all"
              style={{
                background: language === lang ? '#006A4E' : 'transparent',
                color: language === lang ? 'white' : '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'Hind Siliguri, sans-serif',
              }}
            >
              {lang === 'en' ? 'EN' : 'বাং'}
            </button>
          ))}
        </div>
      </div>

      {/* Menu sections */}
      <div className="px-6 mt-5 pb-28 flex flex-col gap-4">
        {menuSections.map((section, si) => (
          <div key={si}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px',
              }}
            >
              {section.title}
            </p>
            <div
              className="bg-white rounded-3xl overflow-hidden divide-y divide-gray-50"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            >
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path + item.label}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#F3F4F6' }}
                    >
                      <Icon size={18} color="#374151" />
                    </div>
                    <span
                      className="flex-1"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#1A1A2E' }}
                    >
                      {language === 'bn' ? item.labelbn : item.label}
                    </span>
                    {item.value && (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: item.valueColor }}>
                        {item.value}
                      </span>
                    )}
                    <ChevronRight size={16} color="#D1D5DB" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Admin access */}
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center justify-center gap-2 p-4 rounded-2xl"
          style={{ background: '#1A1A2E', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        >
          <span style={{ fontSize: '16px' }}>🛡️</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: 'white' }}>
            Admin / Operator Panel
          </span>
          <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
        </button>

        {/* Logout */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 p-4 rounded-2xl"
          style={{ background: '#FEF3F2', border: '1.5px solid #EF444420' }}
        >
          <LogOut size={18} color="#EF4444" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>
            {language === 'bn' ? 'লগ আউট' : 'Sign Out'}
          </span>
        </button>
      </div>
    </div>
  );
}
