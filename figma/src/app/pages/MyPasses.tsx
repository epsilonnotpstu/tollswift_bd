import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Zap, Plus, Calendar } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { mockPasses } from '../data/mockData';

function PassExpiryRing({ daysLeft, totalDays }: { daysLeft: number; totalDays: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const progress = daysLeft / totalDays;
  const strokeDashoffset = circumference * (1 - progress);
  const color = daysLeft <= 5 ? '#EF4444' : daysLeft <= 10 ? '#F59E0B' : '#006A4E';

  return (
    <div className="relative flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
      <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="5" />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '16px', fontWeight: 700, color: '#1A1A2E' }}>
          {daysLeft}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6B7280', lineHeight: 1 }}>
          days
        </div>
      </div>
    </div>
  );
}

export function MyPasses() {
  const navigate = useNavigate();
  const { language } = useApp();
  const activePasses = mockPasses.filter(p => p.active);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#F7F8FA' }}>
      <div style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '24px' }}>
        <StatusBar dark />
        <div className="px-6 pt-1 flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
            {language === 'bn' ? 'আমার পাস' : 'My Passes'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-24">
        {activePasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: '#E8F5F1' }}>
              <Zap size={36} color="#006A4E" />
            </div>
            <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '18px', fontWeight: 700, color: '#1A1A2E' }}>
              No Active Passes
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280', textAlign: 'center' }}>
              Get a monthly pass to save on toll fees
            </p>
            <button
              onClick={() => navigate('/passes')}
              className="px-6 py-3 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #006A4E, #004D38)' }}
            >
              <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '15px', fontWeight: 700, color: 'white' }}>
                Get a Pass
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activePasses.map((pass, i) => (
              <motion.div
                key={pass.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-5"
                style={{ boxShadow: '0 4px 20px rgba(0,106,78,0.15)', border: '2px solid #006A4E20' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #006A4E, #004D38)' }}
                      >
                        <Zap size={16} color="white" />
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{ background: '#ECFDF5', color: '#10B981', fontSize: '10px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
                      >
                        ACTIVE
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '18px', fontWeight: 700, color: '#1A1A2E', marginTop: '6px' }}>
                      Monthly Pass
                    </h3>
                  </div>
                  <PassExpiryRing daysLeft={pass.days_left} totalDays={30} />
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Started', value: new Date(pass.purchased).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' }) },
                    { label: 'Expires', value: new Date(pass.expires).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' }) },
                    { label: 'Price', value: `৳${pass.price}`, mono: true },
                    { label: 'Vehicles', value: `${pass.vehicle_limit} vehicle` },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-2xl" style={{ background: '#F9FAFB' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9CA3AF', marginBottom: '2px' }}>
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontFamily: item.mono ? 'Roboto Mono, monospace' : 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#1A1A2E',
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="flex flex-col gap-1.5 mb-4">
                  {pass.benefits.map(b => (
                    <div key={b} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#E8F5F1' }}>
                        <span style={{ fontSize: '9px', color: '#006A4E', fontWeight: 700 }}>✓</span>
                      </div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#374151' }}>{b}</span>
                    </div>
                  ))}
                </div>

                {/* Countdown warning */}
                {pass.days_left <= 10 && (
                  <div
                    className="flex items-center gap-2 p-3 rounded-2xl mb-4"
                    style={{ background: '#FFF8E6', border: '1px solid #F59E0B30' }}
                  >
                    <Calendar size={14} color="#F59E0B" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#92400E', fontWeight: 600 }}>
                      Expires in {pass.days_left} days · Renew now to keep access
                    </span>
                  </div>
                )}

                <button
                  onClick={() => navigate('/passes')}
                  className="w-full py-3 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, #006A4E, #004D38)', boxShadow: '0 4px 16px rgba(0,106,78,0.3)' }}
                >
                  <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '15px', fontWeight: 700, color: 'white' }}>
                    Renew Pass
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/passes')}
          className="mt-4 w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{ background: 'white', border: '2px dashed #D1D5DB' }}
        >
          <Plus size={18} color="#6B7280" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>
            Add Another Pass
          </span>
        </button>
      </div>
    </div>
  );
}
