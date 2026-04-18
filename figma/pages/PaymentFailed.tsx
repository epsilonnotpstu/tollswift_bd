import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { XCircle, RotateCcw, Plus, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function PaymentFailed() {
  const navigate = useNavigate();
  const { balance, pendingToll } = useApp();

  const toll = pendingToll || { amount: 60, gateNamebn: 'যমুনা সেতু', gateName: 'Jamuna Bridge', road: 'N4', gateId: 'g1' };
  const isInsufficient = balance < toll.amount;
  const reason = isInsufficient ? 'Insufficient Balance' : 'Network Error';
  const reasonDesc = isInsufficient
    ? `You need ৳${(toll.amount - balance).toFixed(2)} more to complete this toll payment.`
    : 'Failed to connect to the payment server. Please try again.';

  return (
    <div className="w-full h-full flex flex-col items-center" style={{ background: '#F7F8FA' }}>
      {/* Red header */}
      <div
        className="w-full flex flex-col items-center"
        style={{
          background: 'linear-gradient(160deg, #C0172B 0%, #8B0E1E 100%)',
          paddingTop: '60px',
          paddingBottom: '80px',
        }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
          className="relative"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}
          >
            <XCircle size={52} color="white" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-5"
        >
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '26px', fontWeight: 700, color: 'white' }}>
            পেমেন্ট ব্যর্থ হয়েছে
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
            Payment Failed
          </p>
        </motion.div>
      </div>

      {/* Error card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', bounce: 0.2 }}
        className="mx-6 -mt-10 bg-white rounded-3xl p-5 w-[calc(100%-48px)]"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      >
        <div
          className="p-4 rounded-2xl mb-4"
          style={{ background: '#FEF3F2', border: '1.5px solid #EF444420' }}
        >
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#EF4444' }}>
            {reason}
          </h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#991B1B', marginTop: '4px' }}>
            {reasonDesc}
          </p>
        </div>

        {[
          { label: 'Toll Gate', value: toll.gateNamebn },
          { label: 'Amount', value: `৳${toll.amount}`, mono: true },
          { label: 'Your Balance', value: `৳${balance.toFixed(2)}`, mono: true },
          { label: 'Status', value: '✗ Failed', red: true },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-2">
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280' }}>{item.label}</span>
            <span
              style={{
                fontFamily: item.mono ? 'Roboto Mono, monospace' : 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: item.red ? '#EF4444' : '#1A1A2E',
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Actions */}
      <div className="px-6 mt-5 flex flex-col gap-3 w-full">
        {isInsufficient ? (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/add-money')}
            className="py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #F42A41, #C0172B)',
              boxShadow: '0 6px 20px rgba(244,42,65,0.35)',
            }}
          >
            <Plus size={20} color="white" />
            <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '17px', fontWeight: 700, color: 'white' }}>
              Add Money
            </span>
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/pay/confirm')}
            className="py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #006A4E, #004D38)',
              boxShadow: '0 6px 20px rgba(0,106,78,0.35)',
            }}
          >
            <RotateCcw size={20} color="white" />
            <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '17px', fontWeight: 700, color: 'white' }}>
              Retry Payment
            </span>
          </motion.button>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/home')}
          className="py-3 flex items-center justify-center gap-2"
        >
          <Home size={16} color="#6B7280" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280' }}>
            Back to Home
          </span>
        </motion.button>
      </div>
    </div>
  );
}
