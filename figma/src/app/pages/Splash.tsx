import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/language'), 2800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 60%, #003322 100%)' }}
    >
      {/* Highway SVG watermark */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full opacity-10"
        viewBox="0 0 390 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 200 L160 60 L195 60 L230 60 L390 200 Z" fill="white" />
        <path d="M155 200 L175 90 L185 90 L195 200 Z" fill="white" opacity="0.5" />
        <path d="M235 200 L215 90 L205 90 L195 200 Z" fill="white" opacity="0.5" />
        {/* Dashed lines */}
        <rect x="192" y="100" width="6" height="20" rx="3" fill="white" opacity="0.8" />
        <rect x="192" y="130" width="6" height="20" rx="3" fill="white" opacity="0.6" />
        <rect x="192" y="160" width="6" height="20" rx="3" fill="white" opacity="0.4" />
      </svg>

      {/* Red accent circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-1/4 right-8 w-32 h-32 rounded-full"
        style={{ background: '#F42A41' }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
        className="flex flex-col items-center gap-4 z-10"
      >
        {/* Logo mark */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <svg viewBox="0 0 80 80" width="56" height="56" fill="none">
            {/* Road */}
            <path d="M10 70 L35 30 L40 30 L45 30 L70 70 Z" fill="white" opacity="0.9" />
            <rect x="38" y="32" width="4" height="10" rx="2" fill="#006A4E" />
            <rect x="38" y="48" width="4" height="10" rx="2" fill="#006A4E" />
            {/* TBD mark */}
            <circle cx="40" cy="20" r="10" fill="#F42A41" />
            <text x="40" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">T</text>
          </svg>
        </div>

        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              fontFamily: 'Hind Siliguri, sans-serif',
              fontSize: '40px',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-1px',
            }}
          >
            TollBD
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.8 }}
            style={{
              fontFamily: 'Hind Siliguri, sans-serif',
              fontSize: '15px',
              color: 'rgba(255,255,255,0.85)',
              marginTop: '4px',
            }}
          >
            স্মার্ট টোল, সহজ যাত্রা
          </motion.p>
        </div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-16 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-white"
          />
        ))}
      </motion.div>

      {/* Version */}
      <div
        className="absolute bottom-8"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}
      >
        v2.4.1 · Bangladesh Road Transport Authority
      </div>
    </div>
  );
}
