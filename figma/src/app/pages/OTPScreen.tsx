import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function OTPScreen() {
  const navigate = useNavigate();
  const { language } = useApp();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleSendOTP = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setCountdown(30);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, 1200);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      setTimeout(() => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          navigate('/biometric');
        }, 1000);
      }, 300);
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#F7F8FA' }}>
      {/* Header */}
      <div
        className="pt-14 pb-6 px-6"
        style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)' }}
      >
        <button
          onClick={() => step === 'otp' ? setStep('phone') : navigate('/language')}
          className="mb-6 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <ArrowLeft size={18} color="white" />
        </button>
        <h1
          style={{
            fontFamily: 'Hind Siliguri, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: 'white',
          }}
        >
          {step === 'phone'
            ? (language === 'bn' ? 'ফোন নম্বর দিন' : 'Enter Phone Number')
            : (language === 'bn' ? 'OTP যাচাই করুন' : 'Verify OTP')}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
          {step === 'phone'
            ? 'We\'ll send a 6-digit code via SMS'
            : `Code sent to +880 ${phone}`}
        </p>
      </div>

      <div className="flex-1 px-6 pt-8">
        {step === 'phone' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Phone input */}
            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-4"
              style={{ background: 'white', border: '2px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-2 pr-3" style={{ borderRight: '1.5px solid #E5E7EB' }}>
                <span style={{ fontSize: '18px' }}>🇧🇩</span>
                <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>
                  +880
                </span>
              </div>
              <Phone size={16} color="#9CA3AF" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="01711-234567"
                className="flex-1 outline-none bg-transparent"
                style={{
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: '16px',
                  color: '#1A1A2E',
                  fontWeight: 500,
                }}
              />
            </div>

            <p
              className="mt-3"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9CA3AF' }}
            >
              By continuing, you agree to TollBD's Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center"
          >
            <div className="flex gap-3 mb-6">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center rounded-2xl outline-none transition-all"
                  style={{
                    fontFamily: 'Roboto Mono, monospace',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#1A1A2E',
                    background: digit ? '#E8F5F1' : 'white',
                    border: `2px solid ${digit ? '#006A4E' : '#E5E7EB'}`,
                    boxShadow: digit ? '0 2px 8px rgba(0,106,78,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                />
              ))}
            </div>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280' }}>
              Didn't receive the code?{' '}
              {countdown > 0 ? (
                <span style={{ color: '#006A4E' }}>Resend in {countdown}s</span>
              ) : (
                <button
                  onClick={() => setCountdown(30)}
                  style={{ color: '#F42A41', fontWeight: 600 }}
                >
                  Resend
                </button>
              )}
            </p>

            <div
              className="mt-6 p-3 rounded-xl flex items-center gap-2"
              style={{ background: '#FFF9E6', border: '1px solid #F59E0B20' }}
            >
              <span style={{ fontSize: '16px' }}>💡</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#92400E' }}>
                Demo: Enter any 6 digits to proceed
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      {step === 'phone' && (
        <div className="px-6 pb-10">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSendOTP}
            disabled={phone.length < 10 || loading}
            className="w-full py-4 rounded-2xl flex items-center justify-center"
            style={{
              background: phone.length >= 10 ? 'linear-gradient(135deg, #006A4E, #004D38)' : '#E5E7EB',
              boxShadow: phone.length >= 10 ? '0 8px 24px rgba(0,106,78,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                ))}
              </div>
            ) : (
              <span
                style={{
                  fontFamily: 'Hind Siliguri, sans-serif',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: phone.length >= 10 ? 'white' : '#9CA3AF',
                }}
              >
                Send OTP
              </span>
            )}
          </motion.button>
        </div>
      )}

      {loading && step === 'otp' && (
        <div className="px-6 pb-10 flex justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="w-2 h-2 rounded-full"
                style={{ background: '#006A4E' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
