import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Download, Share2, Home, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const { pendingToll, balance } = useApp();
  const fired = useRef(false);

  const toll = pendingToll || {
    gateId: 'gate_001',
    gateName: 'Jamuna Bridge',
    gateNamebn: 'যমুনা সেতু',
    amount: 60,
    road: 'N4 Highway',
  };

  const txId = 'TBD' + Date.now().toString().slice(-8);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const colors = ['#006A4E', '#F42A41', '#10B981', '#F59E0B', '#3B82F6'];
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors,
      scalar: 0.8,
    });
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center" style={{ background: '#F7F8FA' }}>
      {/* Success area */}
      <div
        className="w-full flex flex-col items-center"
        style={{
          background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)',
          paddingTop: '60px',
          paddingBottom: '80px',
        }}
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
          className="relative"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}
          >
            <CheckCircle2 size={52} color="white" strokeWidth={1.5} />
          </div>
          {/* Ripples */}
          {[1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid rgba(255,255,255,0.2)' }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8 + i * 0.4, opacity: 0 }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, repeatDelay: 1 }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-5"
        >
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '26px', fontWeight: 700, color: 'white' }}>
            টোল পরিশোধ সফল!
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
            Toll Paid · Gate Opening...
          </p>

          {/* Animated gate */}
          <div className="flex items-end justify-center gap-2 mt-6 h-12">
            <motion.div
              initial={{ rotateX: 0 }}
              animate={{ rotateX: [0, -80] }}
              transition={{ delay: 1, duration: 0.5, type: 'spring' }}
              style={{
                width: '60px',
                height: '8px',
                background: '#F42A41',
                borderRadius: '4px',
                transformOrigin: 'left center',
              }}
            />
            <div style={{ width: '4px', height: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
          </div>
        </motion.div>
      </div>

      {/* Receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', bounce: 0.2 }}
        className="mx-6 -mt-10 bg-white rounded-3xl p-5 w-[calc(100%-48px)]"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      >
        {/* Amount */}
        <div className="text-center mb-4">
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280' }}>Amount Paid</p>
          <span
            style={{
              fontFamily: 'Roboto Mono, monospace',
              fontSize: '36px',
              fontWeight: 700,
              color: '#1A1A2E',
            }}
          >
            ৳{toll.amount}
          </span>
        </div>

        <div className="h-px bg-gray-50 my-4" style={{ background: 'repeating-linear-gradient(90deg, #E5E7EB 0, #E5E7EB 8px, transparent 8px, transparent 16px)' }} />

        {[
          { label: 'Toll Gate', value: toll.gateNamebn },
          { label: 'Road', value: toll.road },
          { label: 'Transaction ID', value: txId, mono: true },
          { label: 'Balance After', value: `৳${balance.toFixed(2)}`, mono: true },
          { label: 'Status', value: '✓ Paid', green: true },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-2">
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280' }}>{item.label}</span>
            <span
              style={{
                fontFamily: item.mono ? 'Roboto Mono, monospace' : 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: item.green ? '#10B981' : '#1A1A2E',
              }}
            >
              {item.value}
            </span>
          </div>
        ))}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2"
            style={{ background: '#E8F5F1', border: '1.5px solid #006A4E20' }}
          >
            <Download size={16} color="#006A4E" />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#006A4E' }}>
              Download
            </span>
          </button>
          <button
            className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2"
            style={{ background: '#F0F4FF', border: '1.5px solid #3B82F620' }}
          >
            <Share2 size={16} color="#3B82F6" />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>
              Share
            </span>
          </button>
        </div>
      </motion.div>

      {/* Back home */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/home')}
        className="mx-6 mt-4 w-[calc(100%-48px)] py-4 rounded-2xl flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #006A4E, #004D38)', boxShadow: '0 6px 20px rgba(0,106,78,0.3)' }}
      >
        <Home size={18} color="white" />
        <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '16px', fontWeight: 700, color: 'white' }}>
          Back to Home
        </span>
      </motion.button>
    </div>
  );
}
