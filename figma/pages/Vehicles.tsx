import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, CheckCircle2, Clock, Bike, Car, Truck } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { LicensePlate } from '../components/shared/LicensePlate';
import { useApp } from '../context/AppContext';
import { mockVehicles } from '../data/mockData';

const vehicleIcons = {
  car: Car,
  motorcycle: Bike,
  truck: Truck,
  bus: Truck,
};

const statusConfig = {
  verified: { label: 'Verified', color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
  manual: { label: 'Manual Review', color: '#8B5CF6', bg: '#F5F3FF', icon: Clock },
};

export function Vehicles() {
  const navigate = useNavigate();
  const { language, activeVehicleId, setActiveVehicleId } = useApp();
  const [vehicles, setVehicles] = useState(mockVehicles);

  const handleSetActive = (id: string) => {
    setActiveVehicleId(id);
    setVehicles(prev => prev.map(v => ({ ...v, active: v.id === id })));
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#F7F8FA' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '24px' }}>
        <StatusBar dark />
        <div className="px-6 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <ArrowLeft size={18} color="white" />
            </button>
            <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
              {language === 'bn' ? 'আমার গাড়িসমূহ' : 'My Vehicles'}
            </h1>
          </div>
          <span
            className="px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '12px', fontWeight: 600 }}
          >
            {vehicles.length} vehicles
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-24">
        <div className="flex flex-col gap-4">
          {vehicles.map((vehicle, i) => {
            const VehicleIcon = vehicleIcons[vehicle.type] || Car;
            const status = statusConfig[vehicle.brtc_status];
            const StatusIcon = status.icon;
            const isActive = vehicle.id === activeVehicleId;

            return (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden"
                style={{
                  boxShadow: isActive
                    ? '0 4px 24px rgba(0,106,78,0.2)'
                    : '0 2px 12px rgba(0,0,0,0.06)',
                  border: isActive ? '2px solid #006A4E' : '2px solid transparent',
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="w-full py-1.5 flex items-center justify-center gap-2"
                    style={{ background: '#006A4E' }}
                  >
                    <CheckCircle2 size={12} color="white" />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', fontFamily: 'Inter, sans-serif' }}>
                      ACTIVE VEHICLE
                    </span>
                  </div>
                )}

                <div className="p-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: vehicle.color + '20' }}
                      >
                        <VehicleIcon size={24} style={{ color: vehicle.color }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#1A1A2E' }}>
                          {vehicle.model}
                        </p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
                          {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)} · {vehicle.year}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                      style={{ background: status.bg }}
                    >
                      <StatusIcon size={12} style={{ color: status.color }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* License plate */}
                  <div className="mb-4">
                    <LicensePlate plate={vehicle.platebn} size="md" />
                  </div>

                  {/* Owner */}
                  <div
                    className="flex items-center justify-between p-3 rounded-2xl mb-3"
                    style={{ background: '#F9FAFB' }}
                  >
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280' }}>
                      Owner
                    </span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1A1A2E' }}>
                      {vehicle.owner}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isActive && (
                      <button
                        onClick={() => handleSetActive(vehicle.id)}
                        className="flex-1 py-2.5 rounded-2xl"
                        style={{ background: '#E8F5F1', color: '#006A4E', fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      className="flex-1 py-2.5 rounded-2xl"
                      style={{ background: '#F9FAFB', color: '#6B7280', fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                    >
                      History
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.4, delay: 0.3 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate('/vehicles/add')}
        className="absolute flex items-center justify-center rounded-full"
        style={{
          width: '56px',
          height: '56px',
          bottom: '88px',
          right: '24px',
          background: 'linear-gradient(135deg, #F42A41, #C0172B)',
          boxShadow: '0 6px 20px rgba(244,42,65,0.45)',
          zIndex: 20,
        }}
      >
        <Plus size={26} color="white" strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
