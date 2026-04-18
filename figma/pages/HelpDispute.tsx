import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, AlertTriangle, MessageSquare, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';

const disputeReasons = [
  'Wrong amount charged',
  'Duplicate charge',
  'Gate did not open',
  'Charged without passing',
  'Technical error',
  'Other',
];

export function HelpDispute() {
  const navigate = useNavigate();
  const { language } = useApp();
  const [activeSection, setActiveSection] = useState<'main' | 'dispute' | 'submitted'>('main');
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [txId, setTxId] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) return;
    setActiveSection('submitted');
  };

  const helpItems = [
    { icon: '🛣️', title: 'Wrong Toll Charge', desc: 'Report incorrect amount deducted' },
    { icon: '🔄', title: 'Refund Request', desc: 'Request money back for failed toll' },
    { icon: '🚗', title: 'Vehicle Issue', desc: 'Problems with vehicle verification' },
    { icon: '💳', title: 'Payment Problem', desc: 'Deposit or wallet issues' },
    { icon: '📱', title: 'App Technical Issue', desc: 'Bugs, crashes, or errors' },
    { icon: '❓', title: 'General Inquiry', desc: 'Other questions and help' },
  ];

  const contacts = [
    { icon: Phone, label: 'Call Support', value: '16700', color: '#006A4E' },
    { icon: MessageSquare, label: 'Live Chat', value: 'Chat now', color: '#3B82F6' },
  ];

  if (activeSection === 'submitted') {
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
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>
            Dispute Submitted!
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280', marginTop: '6px', lineHeight: 1.5 }}>
            Your dispute has been logged. We'll review and respond within 2-3 business days.
          </p>
          <p className="mt-3" style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '13px', color: '#9CA3AF' }}>
            Ticket: #TBD{Date.now().toString().slice(-6)}
          </p>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="w-full py-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #006A4E, #004D38)', boxShadow: '0 6px 20px rgba(0,106,78,0.35)' }}
        >
          <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '17px', fontWeight: 700, color: 'white' }}>
            Back to Home
          </span>
        </button>
      </div>
    );
  }

  if (activeSection === 'dispute') {
    return (
      <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: '#F7F8FA' }}>
        <div style={{ background: 'linear-gradient(160deg, #C0172B 0%, #8B0E1E 100%)', paddingBottom: '24px' }}>
          <StatusBar dark />
          <div className="px-6 pt-1 flex items-center gap-4">
            <button
              onClick={() => setActiveSection('main')}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <ArrowLeft size={18} color="white" />
            </button>
            <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
              Report Wrong Charge
            </h1>
          </div>
        </div>

        <div className="px-6 pt-5 pb-10 flex flex-col gap-4">
          {/* Transaction ID */}
          <div>
            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#1A1A2E', display: 'block', marginBottom: '8px' }}>
              Transaction ID (optional)
            </label>
            <div className="p-4 rounded-2xl" style={{ background: 'white', border: '2px solid #E5E7EB' }}>
              <input
                type="text"
                value={txId}
                onChange={e => setTxId(e.target.value)}
                placeholder="e.g. TBD12345678"
                className="w-full outline-none bg-transparent"
                style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '14px', color: '#1A1A2E' }}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#1A1A2E', display: 'block', marginBottom: '8px' }}>
              Reason for Dispute *
            </label>
            <div className="flex flex-col gap-2">
              {disputeReasons.map(reason => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl text-left"
                  style={{
                    background: selectedReason === reason ? '#FEF3F2' : 'white',
                    border: `2px solid ${selectedReason === reason ? '#F42A41' : '#E5E7EB'}`,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      border: `2px solid ${selectedReason === reason ? '#F42A41' : '#D1D5DB'}`,
                      background: selectedReason === reason ? '#F42A41' : 'transparent',
                    }}
                  >
                    {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1A1A2E' }}>{reason}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#1A1A2E', display: 'block', marginBottom: '8px' }}>
              Additional Details
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
              className="w-full p-4 rounded-2xl outline-none resize-none"
              style={{
                background: 'white',
                border: '2px solid #E5E7EB',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                color: '#1A1A2E',
              }}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="w-full py-4 rounded-2xl"
            style={{
              background: selectedReason ? 'linear-gradient(135deg, #F42A41, #C0172B)' : '#E5E7EB',
              boxShadow: selectedReason ? '0 6px 20px rgba(244,42,65,0.35)' : 'none',
            }}
          >
            <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '17px', fontWeight: 700, color: selectedReason ? 'white' : '#9CA3AF' }}>
              Submit Dispute
            </span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: '#F7F8FA' }}>
      <div style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '24px' }}>
        <StatusBar dark />
        <div className="px-6 pt-1 flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
              {language === 'bn' ? 'সাহায্য ও সহায়তা' : 'Help & Support'}
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
              Toll support hotline: 16700
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5 pb-10">
        {/* Report wrong charge - prominent */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveSection('dispute')}
          className="w-full p-4 rounded-2xl flex items-center gap-4 mb-5"
          style={{ background: '#FEF3F2', border: '2px solid #F42A4130' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: '#F42A4115' }}
          >
            <AlertTriangle size={24} color="#F42A41" />
          </div>
          <div className="flex-1 text-left">
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#C0172B' }}>
              Report Wrong Charge
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              Dispute an incorrect toll deduction
            </p>
          </div>
        </motion.button>

        {/* Help categories */}
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Common Issues
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {helpItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-2xl"
              style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
            >
              <span style={{ fontSize: '22px' }}>{item.icon}</span>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: '#1A1A2E', marginTop: '6px' }}>
                {item.title}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Contact Us
        </h3>
        <div className="flex flex-col gap-3">
          {contacts.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: c.color + '15' }}
                >
                  <Icon size={20} style={{ color: c.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#1A1A2E' }}>
                    {c.label}
                  </p>
                  <p style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '13px', fontWeight: 600, color: c.color, marginTop: '1px' }}>
                    {c.value}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
