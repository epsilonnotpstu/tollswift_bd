import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Zap, Check, ChevronRight, Tag } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';

const passes = [
  {
    id: 'monthly',
    name: 'Monthly Pass',
    namebn: 'মাসিক পাস',
    price: 500,
    duration: '30 days',
    popular: false,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
    savings: '৳120',
    benefits: [
      'Unlimited toll passes',
      'FastPass lane access',
      '10% discount on all tolls',
      'Priority support',
    ],
  },
  {
    id: 'quarterly',
    name: 'Quarterly Pass',
    namebn: 'ত্রৈমাসিক পাস',
    price: 1300,
    duration: '90 days',
    popular: true,
    color: '#006A4E',
    gradient: 'linear-gradient(135deg, #006A4E, #004D38)',
    savings: '৳200',
    benefits: [
      'Unlimited toll passes',
      'FastPass lane access',
      '15% discount on all tolls',
      'Priority support',
      'Family account (2 vehicles)',
    ],
  },
  {
    id: 'annual',
    name: 'Annual Pass',
    namebn: 'বার্ষিক পাস',
    price: 4500,
    duration: '365 days',
    popular: false,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    savings: '৳1500',
    benefits: [
      'Unlimited toll passes',
      'FastPass lane access',
      '25% discount on all tolls',
      'VIP support',
      'Family account (5 vehicles)',
      'Free dispute resolution',
    ],
  },
];

const planTypes = ['Per Vehicle', 'Family Plan'];

export function PassStore() {
  const navigate = useNavigate();
  const { language, balance, setBalance } = useApp();
  const [planType, setPlanType] = useState('Per Vehicle');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = (pass: typeof passes[0]) => {
    if (balance < pass.price) return;
    setPurchasing(pass.id);
    setTimeout(() => {
      setBalance(balance - pass.price);
      setPurchasing(null);
      navigate('/my-passes');
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: '#F7F8FA' }}>
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
          <div>
            <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
              {language === 'bn' ? 'পাস স্টোর' : 'Pass Store'}
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
              Unlimited toll at one flat rate
            </p>
          </div>
        </div>

        {/* Plan type toggle */}
        <div className="px-6 mt-4 flex gap-2">
          {planTypes.map(pt => (
            <button
              key={pt}
              onClick={() => setPlanType(pt)}
              className="flex-1 py-2 rounded-xl transition-all"
              style={{
                background: planType === pt ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                color: planType === pt ? '#006A4E' : 'rgba(255,255,255,0.8)',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {pt}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pt-5 pb-24 flex flex-col gap-4">
        {passes.map((pass, i) => (
          <motion.div
            key={pass.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow: pass.popular ? '0 8px 32px rgba(0,106,78,0.25)' : '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            {/* Popular badge */}
            {pass.popular && (
              <div
                className="py-1.5 text-center"
                style={{ background: pass.gradient }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700, color: 'white', letterSpacing: '1px' }}>
                  ⭐ MOST POPULAR
                </span>
              </div>
            )}

            <div className="bg-white p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: pass.gradient }}
                  >
                    <Zap size={22} color="white" />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '16px', fontWeight: 700, color: '#1A1A2E' }}>
                      {language === 'bn' ? pass.namebn : pass.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Tag size={11} color={pass.color} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: pass.color, fontWeight: 600 }}>
                        Save {pass.savings} vs per-trip
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    style={{
                      fontFamily: 'Roboto Mono, monospace',
                      fontSize: '22px',
                      fontWeight: 700,
                      color: '#1A1A2E',
                    }}
                  >
                    ৳{pass.price}
                  </span>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF' }}>
                    / {pass.duration}
                  </p>
                </div>
              </div>

              {/* FastPass badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
                style={{ background: '#FFF8E6', border: '1px solid #F59E0B30' }}
              >
                <Zap size={12} color="#F59E0B" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700, color: '#92400E' }}>
                  FastPass Lane Included
                </span>
              </div>

              {/* Benefits */}
              <div className="flex flex-col gap-2 mb-4">
                {pass.benefits.map(benefit => (
                  <div key={benefit} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: pass.color + '20' }}
                    >
                      <Check size={10} style={{ color: pass.color }} strokeWidth={3} />
                    </div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#374151' }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Buy button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePurchase(pass)}
                disabled={purchasing === pass.id || balance < pass.price}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2"
                style={{
                  background: balance >= pass.price ? pass.gradient : '#E5E7EB',
                  boxShadow: balance >= pass.price ? `0 6px 20px ${pass.color}35` : 'none',
                }}
              >
                {purchasing === pass.id ? (
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '15px', fontWeight: 700, color: balance >= pass.price ? 'white' : '#9CA3AF' }}>
                      {balance >= pass.price ? `Get ${pass.name}` : 'Insufficient Balance'}
                    </span>
                    {balance >= pass.price && <ChevronRight size={18} color="white" />}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}

        {/* My passes link */}
        <button
          onClick={() => navigate('/my-passes')}
          className="flex items-center justify-center gap-2 py-3"
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#006A4E', fontWeight: 600 }}>
            View My Active Passes
          </span>
          <ChevronRight size={14} color="#006A4E" />
        </button>
      </div>
    </div>
  );
}
