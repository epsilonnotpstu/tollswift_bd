import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, QrCode, Keyboard, MapPin, ChevronRight, Zap } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { mockTollGates } from '../data/mockData';

export function PayToll() {
  const navigate = useNavigate();
  const { language, setPendingToll } = useApp();
  const [mode, setMode] = useState<'qr' | 'manual'>('qr');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);

  const simulateScan = (gate: typeof mockTollGates[0]) => {
    setPendingToll({
      gateId: gate.id,
      gateName: gate.name,
      gateNamebn: gate.namebn,
      amount: gate.toll_rates.car,
      road: gate.road_name,
    });
    navigate('/pay/confirm');
  };

  const handleManualSubmit = () => {
    if (!manualCode) return;
    const gate = mockTollGates[0];
    simulateScan(gate);
  };

  const handleQrScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      simulateScan(mockTollGates[0]);
    }, 2000);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#F7F8FA' }}>
      {/* Header */}
      <div
        style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '20px' }}
      >
        <StatusBar dark />
        <div className="px-6 pt-1 flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
            {language === 'bn' ? 'টোল পেমেন্ট' : 'Pay Toll'}
          </h1>
        </div>

        {/* Mode toggle */}
        <div className="px-6 mt-4 flex gap-2">
          {[
            { key: 'qr' as const, icon: QrCode, label: 'Scan QR' },
            { key: 'manual' as const, icon: Keyboard, label: 'Enter Code' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setMode(item.key)}
                className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{
                  background: mode === item.key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                }}
              >
                <Icon size={15} style={{ color: mode === item.key ? '#006A4E' : 'rgba(255,255,255,0.8)' }} />
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: mode === item.key ? '#006A4E' : 'rgba(255,255,255,0.8)',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {mode === 'qr' ? (
            <motion.div
              key="qr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 pt-6 flex flex-col items-center"
            >
              {/* QR Scanner */}
              <div
                className="relative rounded-3xl overflow-hidden flex items-center justify-center"
                style={{
                  width: '280px',
                  height: '280px',
                  background: '#1A1A2E',
                }}
              >
                {/* Camera simulation */}
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: scanning
                      ? 'linear-gradient(180deg, #1a2e1a 0%, #0d1f0d 100%)'
                      : 'linear-gradient(180deg, #1A1A2E 0%, #0d0d1e 100%)',
                  }}
                >
                  {/* QR code grid simulation */}
                  <div className="opacity-20 grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded"
                        style={{ background: i % 3 === 0 ? 'white' : 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Corner brackets */}
                {['tl', 'tr', 'bl', 'br'].map((corner) => (
                  <motion.div
                    key={corner}
                    className="absolute"
                    style={{
                      top: corner.startsWith('t') ? '20px' : undefined,
                      bottom: corner.startsWith('b') ? '20px' : undefined,
                      left: corner.endsWith('l') ? '20px' : undefined,
                      right: corner.endsWith('r') ? '20px' : undefined,
                      width: '36px',
                      height: '36px',
                      borderTop: corner.startsWith('t') ? '3px solid #006A4E' : 'none',
                      borderBottom: corner.startsWith('b') ? '3px solid #006A4E' : 'none',
                      borderLeft: corner.endsWith('l') ? '3px solid #006A4E' : 'none',
                      borderRight: corner.endsWith('r') ? '3px solid #006A4E' : 'none',
                      borderRadius: corner === 'tl' ? '8px 0 0 0' : corner === 'tr' ? '0 8px 0 0' : corner === 'bl' ? '0 0 0 8px' : '0 0 8px 0',
                    }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: ['tl','tr','bl','br'].indexOf(corner) * 0.2 }}
                  />
                ))}

                {/* Scan line */}
                {scanning && (
                  <motion.div
                    className="absolute left-5 right-5 h-0.5"
                    style={{ background: 'linear-gradient(90deg, transparent, #006A4E, transparent)' }}
                    animate={{ top: ['20px', '260px', '20px'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                )}

                {/* Center text */}
                {!scanning && (
                  <div className="absolute bottom-8 text-center">
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                      Point at toll gate QR code
                    </p>
                  </div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleQrScan}
                disabled={scanning}
                className="mt-6 px-8 py-4 rounded-2xl flex items-center gap-2"
                style={{
                  background: scanning ? '#E5E7EB' : 'linear-gradient(135deg, #006A4E, #004D38)',
                  boxShadow: scanning ? 'none' : '0 6px 20px rgba(0,106,78,0.35)',
                }}
              >
                {scanning ? (
                  <motion.div
                    className="flex gap-1"
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
                  </motion.div>
                ) : (
                  <>
                    <QrCode size={20} color="white" />
                    <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '16px', fontWeight: 700, color: 'white' }}>
                      Simulate Scan
                    </span>
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pt-6"
            >
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                Enter the 6-digit toll gate code displayed at the booth
              </p>
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'white', border: '2px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '18px', fontWeight: 700, color: '#9CA3AF' }}>
                  #
                </span>
                <input
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="flex-1 outline-none bg-transparent"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '22px', fontWeight: 700, color: '#1A1A2E', letterSpacing: '8px' }}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleManualSubmit}
                disabled={manualCode.length < 6}
                className="mt-4 w-full py-4 rounded-2xl"
                style={{
                  background: manualCode.length === 6 ? 'linear-gradient(135deg, #006A4E, #004D38)' : '#E5E7EB',
                  boxShadow: manualCode.length === 6 ? '0 6px 20px rgba(0,106,78,0.35)' : 'none',
                }}
              >
                <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '16px', fontWeight: 700, color: manualCode.length === 6 ? 'white' : '#9CA3AF' }}>
                  Look Up Gate
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nearby gates */}
        <div className="px-6 mt-6">
          <h3 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '15px', fontWeight: 700, color: '#1A1A2E', marginBottom: '12px' }}>
            Nearby Toll Gates
          </h3>
          <div className="flex flex-col gap-3">
            {mockTollGates.map(gate => (
              <button
                key={gate.id}
                onClick={() => simulateScan(gate)}
                className="flex items-center gap-3 p-4 rounded-2xl text-left"
                style={{
                  background: 'white',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  opacity: gate.status === 'maintenance' ? 0.6 : 1,
                }}
                disabled={gate.status === 'maintenance'}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: gate.status === 'active' ? '#E8F5F1' : '#FFF3E0' }}
                >
                  <MapPin size={20} style={{ color: gate.status === 'active' ? '#006A4E' : '#F59E0B' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A2E' }}>
                      {gate.namebn}
                    </p>
                    {gate.status === 'maintenance' && (
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{ background: '#FFF3E0', color: '#F59E0B', fontSize: '10px', fontWeight: 600 }}
                      >
                        Maintenance
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{gate.road_name}</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>·</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{gate.distance}</span>
                    {gate.status === 'active' && (
                      <>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>·</span>
                        <div className="flex items-center gap-1">
                          <Zap size={10} color="#F59E0B" />
                          <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>{gate.queue} in queue</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '14px', fontWeight: 700, color: '#1A1A2E' }}>
                    ৳{gate.toll_rates.car}
                  </span>
                  <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>car</p>
                </div>
                <ChevronRight size={16} color="#D1D5DB" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
