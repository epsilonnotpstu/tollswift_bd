import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Clock, Upload, Bike, Car, Truck, Bus } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';

const vehicleTypes = [
  { key: 'motorcycle', icon: Bike, label: 'Motorcycle', labelbn: 'মোটরসাইকেল', color: '#F59E0B' },
  { key: 'car', icon: Car, label: 'Car/CNG', labelbn: 'কার/সিএনজি', color: '#3B82F6' },
  { key: 'truck', icon: Truck, label: 'Truck', labelbn: 'ট্রাক', color: '#EF4444' },
  { key: 'bus', icon: Bus, label: 'Bus', labelbn: 'বাস', color: '#8B5CF6' },
];

const colors = ['#1C3E72', '#C0392B', '#27AE60', '#F39C12', '#8E44AD', '#2C3E50'];

type BRTCStatus = 'idle' | 'verifying' | 'verified' | 'pending';

export function AddVehicle() {
  const navigate = useNavigate();
  const { language } = useApp();
  const [selectedType, setSelectedType] = useState('car');
  const [plate, setPlate] = useState('');
  const [owner, setOwner] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [brtcStatus, setBrtcStatus] = useState<BRTCStatus>('idle');
  const [docUploaded, setDocUploaded] = useState(false);

  const handleBRTCVerify = () => {
    if (!plate) return;
    setBrtcStatus('verifying');
    setTimeout(() => {
      setBrtcStatus(Math.random() > 0.3 ? 'verified' : 'pending');
    }, 2200);
  };

  const handleSave = () => {
    navigate('/vehicles');
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: '#F7F8FA' }}>
      <div style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '24px' }}>
        <StatusBar dark />
        <div className="px-6 pt-1 flex items-center gap-4">
          <button
            onClick={() => navigate('/vehicles')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
            {language === 'bn' ? 'গাড়ি যোগ করুন' : 'Add Vehicle'}
          </h1>
        </div>
      </div>

      <div className="px-6 pt-5 pb-10 flex flex-col gap-5">
        {/* Vehicle type */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A2E', marginBottom: '10px' }}>
            Vehicle Type
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {vehicleTypes.map(vt => {
              const Icon = vt.icon;
              const isSelected = selectedType === vt.key;
              return (
                <button
                  key={vt.key}
                  onClick={() => setSelectedType(vt.key)}
                  className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                  style={{
                    background: isSelected ? vt.color + '15' : 'white',
                    border: `2px solid ${isSelected ? vt.color : '#E5E7EB'}`,
                    boxShadow: isSelected ? `0 4px 12px ${vt.color}25` : '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: vt.color + '20' }}
                  >
                    <Icon size={18} style={{ color: vt.color }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: '#1A1A2E' }}>
                      {language === 'bn' ? vt.labelbn : vt.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Registration number */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A2E', marginBottom: '10px' }}>
            Registration Number
          </h3>
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'white', border: '2px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <input
              type="text"
              value={plate}
              onChange={e => setPlate(e.target.value.toUpperCase())}
              placeholder="DHAKA METRO GA 11-1111"
              className="w-full outline-none bg-transparent"
              style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}
            />
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
            Format: DISTRICT METRO [LETTER] [NUMBER]-[NUMBER]
          </p>
        </div>

        {/* Owner name */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A2E', marginBottom: '10px' }}>
            Owner Name
          </h3>
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'white', border: '2px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <input
              type="text"
              value={owner}
              onChange={e => setOwner(e.target.value)}
              placeholder="Enter owner's full name"
              className="w-full outline-none bg-transparent"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1A1A2E' }}
            />
          </div>
        </div>

        {/* Color picker */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A2E', marginBottom: '10px' }}>
            Vehicle Color
          </h3>
          <div className="flex gap-3">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: c, border: selectedColor === c ? '3px solid #1A1A2E' : '3px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
              >
                {selectedColor === c && <div className="w-2 h-2 rounded-full bg-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* BRTC Verify */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A2E', marginBottom: '10px' }}>
            BRTC Verification
          </h3>
          <AnimatePresence mode="wait">
            {brtcStatus === 'idle' && (
              <motion.button
                key="idle"
                whileTap={{ scale: 0.97 }}
                onClick={handleBRTCVerify}
                disabled={!plate}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2"
                style={{
                  background: plate ? 'linear-gradient(135deg, #1A1A2E, #2d2d4e)' : '#E5E7EB',
                }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: plate ? 'white' : '#9CA3AF' }}>
                  Verify via BRTC
                </span>
              </motion.button>
            )}
            {brtcStatus === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3"
                style={{ background: '#E8F5F1', border: '2px solid #006A4E30' }}
              >
                {[0,1,2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#006A4E' }}
                  />
                ))}
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#006A4E' }}>
                  Verifying via BRTC...
                </span>
              </motion.div>
            )}
            {brtcStatus === 'verified' && (
              <motion.div
                key="verified"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2"
                style={{ background: '#ECFDF5', border: '2px solid #10B98130' }}
              >
                <CheckCircle2 size={18} color="#10B981" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#10B981' }}>
                  Verified via BRTC
                </span>
              </motion.div>
            )}
            {brtcStatus === 'pending' && (
              <motion.div
                key="pending"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2"
                style={{ background: '#FFFBEB', border: '2px solid #F59E0B30' }}
              >
                <Clock size={18} color="#F59E0B" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#F59E0B' }}>
                  Manual Approval Pending
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upload document */}
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A2E', marginBottom: '10px' }}>
            Upload Registration Document
          </h3>
          <button
            onClick={() => setDocUploaded(true)}
            className="w-full py-5 rounded-2xl flex flex-col items-center gap-2"
            style={{
              background: docUploaded ? '#ECFDF5' : 'white',
              border: `2px dashed ${docUploaded ? '#10B981' : '#D1D5DB'}`,
            }}
          >
            {docUploaded ? (
              <CheckCircle2 size={24} color="#10B981" />
            ) : (
              <Upload size={24} color="#9CA3AF" />
            )}
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: docUploaded ? '#10B981' : '#9CA3AF', fontWeight: 600 }}>
              {docUploaded ? 'Document Uploaded!' : 'Tap to upload photo'}
            </span>
          </button>
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full py-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #006A4E, #004D38)',
            boxShadow: '0 8px 24px rgba(0,106,78,0.35)',
          }}
        >
          <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '17px', fontWeight: 700, color: 'white' }}>
            {language === 'bn' ? 'গাড়ি সংরক্ষণ করুন' : 'Save Vehicle'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
