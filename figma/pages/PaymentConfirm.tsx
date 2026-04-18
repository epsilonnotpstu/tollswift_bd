import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Car, Shield, ChevronRight } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { LicensePlate } from '../components/shared/LicensePlate';
import { useApp } from '../context/AppContext';
import { mockVehicles } from '../data/mockData';

export function PaymentConfirm() {
  const navigate = useNavigate();
  const { balance, setBalance, pendingToll, language } = useApp();

  const activeVehicle = mockVehicles[0];
  const toll = pendingToll || {
    gateId: 'gate_001',
    gateName: 'Jamuna Bridge',
    gateNamebn: 'যমুনা সেতু',
    amount: 60,
    road: 'N4 Highway',
  };

  const balanceAfter = balance - toll.amount;
  const canPay = balanceAfter >= 0;

  const handleConfirm = () => {
    if (!canPay) {
      navigate('/pay/failed');
      return;
    }
    setBalance(balanceAfter);
    navigate('/pay/success');
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#F7F8FA' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '24px' }}>
        <StatusBar dark />
        <div className="px-6 pt-1 flex items-center gap-4">
          <button
            onClick={() => navigate('/pay')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
            {language === 'bn' ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment'}
          </h1>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 overflow-y-auto pb-10">
        {/* Gate card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: '#E8F5F1' }}
            >
              <MapPin size={26} color="#006A4E" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>Toll Gate</p>
              <h2 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: '#1A1A2E' }}>
                {language === 'bn' ? toll.gateNamebn : toll.gateName}
              </h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>{toll.road}</p>
            </div>
          </div>

          <div className="h-px bg-gray-50 my-4" />

          {/* Details */}
          <div className="flex flex-col gap-3">
            {/* Vehicle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car size={15} color="#6B7280" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280' }}>Vehicle</span>
              </div>
              <LicensePlate plate={activeVehicle.platebn} size="sm" />
            </div>

            {/* Type */}
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280' }}>Vehicle Type</span>
              <span
                className="px-3 py-1 rounded-full capitalize"
                style={{ background: '#E8F5F1', color: '#006A4E', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
              >
                {activeVehicle.type}
              </span>
            </div>

            {/* Pass benefit */}
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280' }}>Monthly Pass</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#10B981', fontWeight: 600 }}>
                Active ✓
              </span>
            </div>
          </div>

          <div className="h-px bg-gray-50 my-4" />

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '16px', fontWeight: 600, color: '#1A1A2E' }}>
              Toll Amount
            </span>
            <span
              style={{
                fontFamily: 'Roboto Mono, monospace',
                fontSize: '28px',
                fontWeight: 700,
                color: '#1A1A2E',
              }}
            >
              ৳{toll.amount}
            </span>
          </div>
        </motion.div>

        {/* Balance info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 p-4 rounded-2xl"
          style={{
            background: canPay ? '#E8F5F1' : '#FEF3F2',
            border: `1.5px solid ${canPay ? '#10B98120' : '#F4444420'}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280' }}>
              Current Balance
            </span>
            <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '14px', fontWeight: 700, color: '#1A1A2E' }}>
              ৳{balance.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280' }}>
              After Payment
            </span>
            <span
              style={{
                fontFamily: 'Roboto Mono, monospace',
                fontSize: '14px',
                fontWeight: 700,
                color: canPay ? '#006A4E' : '#EF4444',
              }}
            >
              ৳{balanceAfter.toFixed(2)}
            </span>
          </div>
        </motion.div>

        {/* Security note */}
        <div className="mt-4 flex items-center gap-2">
          <Shield size={14} color="#9CA3AF" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF' }}>
            Secured by TollBD · All transactions encrypted
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: canPay
              ? 'linear-gradient(135deg, #006A4E, #004D38)'
              : 'linear-gradient(135deg, #F42A41, #C0172B)',
            boxShadow: canPay
              ? '0 8px 24px rgba(0,106,78,0.35)'
              : '0 8px 24px rgba(244,42,65,0.35)',
          }}
        >
          <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '17px', fontWeight: 700, color: 'white' }}>
            {canPay ? 'Confirm & Pay ৳' + toll.amount : 'Insufficient Balance'}
          </span>
          <ChevronRight size={20} color="white" />
        </motion.button>

        <button
          onClick={() => navigate('/pay')}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280', textAlign: 'center', paddingBlock: '8px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
