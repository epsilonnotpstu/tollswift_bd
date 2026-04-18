import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Eye, EyeOff, Plus, QrCode, Clock, Ticket, MapPin, ChevronRight, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { TransactionRow } from '../components/shared/TransactionRow';
import { LicensePlate } from '../components/shared/LicensePlate';
import { useApp } from '../context/AppContext';
import { mockTransactions, mockVehicles, mockTollGates, mockNotifications } from '../data/mockData';

export function Home() {
  const navigate = useNavigate();
  const { user, balance, language } = useApp();
  const [balanceHidden, setBalanceHidden] = useState(false);

  const activeVehicle = mockVehicles[0];
  const recentTx = mockTransactions.slice(0, 3);
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  const isLowBalance = balance < 200;

  const quickActions = [
    { icon: QrCode, label: 'Pay Toll', labelbn: 'টোল দিন', color: '#006A4E', bg: '#E8F5F1', path: '/pay' },
    { icon: Plus, label: 'Add Money', labelbn: 'টাকা যোগ', color: '#F42A41', bg: '#FEF3F2', path: '/add-money' },
    { icon: Clock, label: 'History', labelbn: 'ইতিহাস', color: '#3B82F6', bg: '#EFF6FF', path: '/history' },
    { icon: Ticket, label: 'Pass', labelbn: 'পাস', color: '#8B5CF6', bg: '#F5F3FF', path: '/passes' },
  ];

  return (
    <div
      className="w-full flex flex-col overflow-y-auto"
      style={{ background: '#F7F8FA', fontFamily: 'Inter, sans-serif', minHeight: '100%' }}
    >
      {/* Green header area */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '70px' }}
      >
        {/* Highway watermark */}
        <svg
          className="absolute bottom-0 right-0 opacity-10"
          width="180" height="120" viewBox="0 0 180 120" fill="none"
        >
          <path d="M0 120 L70 20 L80 20 L90 20 L180 120 Z" fill="white" />
          <rect x="87" y="25" width="6" height="15" rx="3" fill="white" opacity="0.8" />
          <rect x="87" y="50" width="6" height="15" rx="3" fill="white" opacity="0.6" />
          <rect x="87" y="75" width="6" height="15" rx="3" fill="white" opacity="0.4" />
        </svg>

        <StatusBar dark />

        {/* Top row */}
        <div className="px-6 pt-2 flex items-center justify-between">
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              Good morning 🌤️
            </p>
            <h2
              style={{
                fontFamily: 'Hind Siliguri, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
                marginTop: '2px',
              }}
            >
              {language === 'bn' ? user.namebn : user.name}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Bell size={18} color="white" />
              {unreadCount > 0 && (
                <div
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#F42A41', fontSize: '9px', color: 'white', fontWeight: 700 }}
                >
                  {unreadCount}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-6 mt-5 p-5 rounded-3xl relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          {/* Glassmorphism inner glow */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))' }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                Wallet Balance
              </span>
              <button onClick={() => setBalanceHidden(h => !h)}>
                {balanceHidden ? <EyeOff size={16} color="rgba(255,255,255,0.7)" /> : <Eye size={16} color="rgba(255,255,255,0.7)" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={balanceHidden ? 'hidden' : 'shown'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {balanceHidden ? (
                  <div className="flex gap-2 my-2">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-white opacity-60" />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      fontFamily: 'Roboto Mono, monospace',
                      fontSize: '34px',
                      fontWeight: 700,
                      color: 'white',
                      letterSpacing: '-1px',
                    }}
                  >
                    ৳{balance.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} color="rgba(255,255,255,0.6)" />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                  ৳1,040 this month
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={12} color="#F59E0B" />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                  Monthly pass active
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="px-6 -mt-10 z-10 relative">
        <div
          className="bg-white rounded-3xl p-4"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
        >
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: action.bg }}
                  >
                    <Icon size={20} style={{ color: action.color }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151', textAlign: 'center' }}>
                    {language === 'bn' ? action.labelbn : action.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low balance warning */}
      {isLowBalance && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mx-6 mt-4 p-3 rounded-2xl flex items-center gap-3"
          style={{ background: '#FFF8E6', border: '1.5px solid #F59E0B40' }}
        >
          <AlertTriangle size={18} color="#F59E0B" />
          <div className="flex-1">
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>Low Balance</p>
            <p style={{ fontSize: '11px', color: '#B45309', marginTop: '1px' }}>
              Add money to avoid toll disruption
            </p>
          </div>
          <button
            onClick={() => navigate('/add-money')}
            className="px-3 py-1.5 rounded-xl"
            style={{ background: '#F59E0B', fontSize: '11px', fontWeight: 700, color: 'white' }}
          >
            Add
          </button>
        </motion.div>
      )}

      {/* Active vehicle */}
      <div className="mx-6 mt-4">
        <div
          className="flex items-center gap-3 p-3 rounded-2xl"
          style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#E8F5F1' }}
          >
            <span style={{ fontSize: '20px' }}>🚗</span>
          </div>
          <div className="flex-1">
            <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>Active Vehicle</p>
            <LicensePlate plate={activeVehicle.platebn} size="sm" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Verified</span>
          </div>
        </div>
      </div>

      {/* Nearby toll gates */}
      <div className="mx-6 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '16px', fontWeight: 700, color: '#1A1A2E' }}>
            {language === 'bn' ? 'কাছের টোল গেট' : 'Nearby Toll Gates'}
          </h3>
          <button
            onClick={() => navigate('/pay')}
            className="flex items-center gap-1"
          >
            <span style={{ fontSize: '12px', color: '#006A4E', fontWeight: 600 }}>View all</span>
            <ChevronRight size={12} color="#006A4E" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {mockTollGates.slice(0, 3).map((gate) => (
            <div
              key={gate.id}
              className="flex-shrink-0 p-3 rounded-2xl"
              style={{
                background: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                minWidth: '140px',
              }}
            >
              <div className="flex items-center gap-1 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: gate.status === 'active' ? '#10B981' : '#F59E0B' }}
                />
                <span style={{ fontSize: '10px', color: gate.status === 'active' ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                  {gate.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A2E' }}>{gate.namebn}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={10} color="#9CA3AF" />
                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{gate.distance}</span>
              </div>
              <div
                className="mt-2 px-2 py-1 rounded-lg"
                style={{ background: '#E8F5F1' }}
              >
                <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '11px', fontWeight: 700, color: '#006A4E' }}>
                  ৳{gate.toll_rates.car} / car
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="mx-6 mt-5 mb-24">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '16px', fontWeight: 700, color: '#1A1A2E' }}>
            {language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}
          </h3>
          <button onClick={() => navigate('/wallet')} className="flex items-center gap-1">
            <span style={{ fontSize: '12px', color: '#006A4E', fontWeight: 600 }}>See all</span>
            <ChevronRight size={12} color="#006A4E" />
          </button>
        </div>

        <div
          className="bg-white rounded-3xl px-4 divide-y divide-gray-50"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          {recentTx.map(tx => (
            <TransactionRow key={tx.id} transaction={tx} language={language} />
          ))}
        </div>
      </div>
    </div>
  );
}