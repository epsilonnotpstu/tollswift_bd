import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Fingerprint, ShieldCheck, ChevronRight } from 'lucide-react';

export function BiometricSetup() {
  const navigate = useNavigate();
  const { setBiometricEnabled } = useApp();
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);

  const handleEnable = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setDone(true);
      setBiometricEnabled(true);
      setTimeout(() => navigate('/home'), 1200);
    }, 2000);
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#F7F8FA' }}>
      {/* Top gradient area */}
      <div
        className="pt-16 pb-10 flex flex-col items-center"
        style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)' }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.35, delay: 0.2 }}
          className="relative"
        >
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)' }}
          >
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <ShieldCheck size={52} color="#4ADE80" strokeWidth={2} />
                </motion.div>
              ) : scanning ? (
                <motion.div
                  key="scanning"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Fingerprint size={52} color="#86EFAC" strokeWidth={1.5} />
                </motion.div>
              ) : (
                <motion.div key="idle">
                  <Fingerprint size={52} color="white" strokeWidth={1.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ripple effect when scanning */}
          {scanning && [1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}
              animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
          style={{
            fontFamily: 'Hind Siliguri, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            color: 'white',
          }}
        >
          {done ? 'Biometric Enabled!' : 'Secure Your Account'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.75)',
            marginTop: '6px',
            textAlign: 'center',
            paddingInline: '32px',
          }}
        >
          {scanning
            ? 'Scanning fingerprint...'
            : done
            ? 'You can now sign in with Touch ID'
            : 'Use fingerprint or Face ID to quickly and securely access TollBD'}
        </motion.p>
      </div>

      {/* Benefits */}
      <div className="flex-1 px-6 pt-8">
        {[
          { icon: '⚡', title: 'Quick Access', desc: 'Sign in instantly without entering PIN' },
          { icon: '🔒', title: 'Secure Payments', desc: 'Confirm toll payments with biometrics' },
          { icon: '🛡️', title: 'Bank-grade Security', desc: 'Your data never leaves your device' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-4 mb-5"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#E8F5F1', fontSize: '22px' }}
            >
              {item.icon}
            </div>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>
                {item.title}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                {item.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Buttons */}
      <div className="px-6 pb-10 flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleEnable}
          disabled={scanning || done}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #006A4E, #004D38)',
            boxShadow: '0 8px 24px rgba(0,106,78,0.35)',
          }}
        >
          <Fingerprint size={20} color="white" />
          <span
            style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '17px', fontWeight: 700, color: 'white' }}
          >
            {scanning ? 'Scanning...' : done ? 'Done!' : 'Enable Touch ID'}
          </span>
        </motion.button>

        <button
          onClick={handleSkip}
          className="w-full py-3 flex items-center justify-center gap-1"
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280' }}>
            Skip for now
          </span>
          <ChevronRight size={14} color="#6B7280" />
        </button>
      </div>
    </div>
  );
}
