import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';

const quickAmounts = [100, 200, 500, 1000, 2000];

const paymentMethods = [
  { id: 'bkash', name: 'bKash', emoji: '📱', color: '#E2136E', bg: '#FDF2F8', desc: 'Mobile banking' },
  { id: 'nagad', name: 'Nagad', emoji: '🟠', color: '#F7941D', bg: '#FFF8F0', desc: 'Mobile banking' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', color: '#8B5CF6', bg: '#F5F3FF', desc: 'DBBL mobile banking' },
  { id: 'card', name: 'Debit / Credit Card', emoji: '💳', color: '#1E40AF', bg: '#EFF6FF', desc: 'Visa, Mastercard via SSLCommerz' },
  { id: 'internet', name: 'Internet Banking', emoji: '🏦', color: '#374151', bg: '#F9FAFB', desc: 'All BD banks supported' },
];

type Step = 'amount' | 'method' | 'processing' | 'done';

export function AddMoney() {
  const navigate = useNavigate();
  const { balance, setBalance, language } = useApp();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [step, setStep] = useState<Step>('amount');

  const numAmount = parseFloat(amount) || 0;

  const handleProceed = () => {
    if (!selectedMethod || numAmount < 10) return;
    setStep('processing');
    setTimeout(() => {
      setBalance(balance + numAmount);
      setStep('done');
    }, 2500);
  };

  if (step === 'processing') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: '#F7F8FA' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full"
          style={{ border: '3px solid #E5E7EB', borderTopColor: '#006A4E' }}
        />
        <p className="mt-5" style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '18px', fontWeight: 700, color: '#1A1A2E' }}>
          Processing...
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
          Please don't close this screen
        </p>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-6 gap-5" style={{ background: '#F7F8FA' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: '#ECFDF5' }}
        >
          <CheckCircle2 size={52} color="#10B981" />
        </motion.div>
        <div className="text-center">
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '26px', fontWeight: 700, color: '#1A1A2E' }}>
            ৳{numAmount} Added!
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            New balance: ৳{balance.toFixed(2)}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/home')}
          className="w-full py-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #006A4E, #004D38)', boxShadow: '0 6px 20px rgba(0,106,78,0.35)' }}
        >
          <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '17px', fontWeight: 700, color: 'white' }}>
            Back to Home
          </span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: '#F7F8FA' }}>
      <div style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '24px' }}>
        <StatusBar dark />
        <div className="px-6 pt-1 flex items-center gap-4">
          <button
            onClick={() => navigate('/wallet')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
            {language === 'bn' ? 'টাকা যোগ করুন' : 'Add Money'}
          </h1>
        </div>
      </div>

      <div className="px-6 pt-5 pb-10">
        {/* Amount input */}
        <div
          className="p-5 rounded-3xl mb-4"
          style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
            Enter Amount
          </p>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: 'Hind Siliguri, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                color: '#006A4E',
              }}
            >
              ৳
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 outline-none bg-transparent"
              style={{
                fontFamily: 'Roboto Mono, monospace',
                fontSize: '32px',
                fontWeight: 700,
                color: '#1A1A2E',
                borderBottom: '2px solid #006A4E',
                paddingBottom: '4px',
              }}
            />
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {quickAmounts.map(qa => (
              <button
                key={qa}
                onClick={() => setAmount(qa.toString())}
                className="px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: amount === qa.toString() ? '#006A4E' : '#F3F4F6',
                  color: amount === qa.toString() ? 'white' : '#374151',
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                ৳{qa}
              </button>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <h3 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '15px', fontWeight: 700, color: '#1A1A2E', marginBottom: '12px' }}>
          Payment Method
        </h3>
        <div className="flex flex-col gap-3">
          {paymentMethods.map(method => {
            const isSelected = selectedMethod === method.id;
            return (
              <motion.button
                key={method.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod(method.id)}
                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                style={{
                  background: isSelected ? method.bg : 'white',
                  border: `2px solid ${isSelected ? method.color + '40' : '#E5E7EB'}`,
                  boxShadow: isSelected ? `0 4px 16px ${method.color}15` : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: '24px' }}>{method.emoji}</span>
                <div className="flex-1">
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A2E' }}>
                    {method.name}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
                    {method.desc}
                  </p>
                </div>
                {isSelected ? (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: method.color }}
                  >
                    <CheckCircle2 size={14} color="white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full" style={{ border: '2px solid #D1D5DB' }} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Proceed button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleProceed}
          disabled={!selectedMethod || numAmount < 10}
          className="mt-5 w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: selectedMethod && numAmount >= 10
              ? 'linear-gradient(135deg, #F42A41, #C0172B)'
              : '#E5E7EB',
            boxShadow: selectedMethod && numAmount >= 10
              ? '0 8px 24px rgba(244,42,65,0.35)'
              : 'none',
          }}
        >
          <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '17px', fontWeight: 700, color: selectedMethod && numAmount >= 10 ? 'white' : '#9CA3AF' }}>
            {numAmount >= 10 ? `Proceed to Pay ৳${numAmount}` : 'Enter Amount'}
          </span>
          {selectedMethod && numAmount >= 10 && <ChevronRight size={20} color="white" />}
        </motion.button>
      </div>
    </div>
  );
}
