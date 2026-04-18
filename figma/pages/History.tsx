import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Filter, MapPin, Car, ChevronRight, TrendingDown } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { mockTransactions, mockVehicles } from '../data/mockData';

type TxFilter = 'all' | 'toll' | 'deposit' | 'refund';

const groupByDate = (transactions: typeof mockTransactions) => {
  const groups: Record<string, typeof mockTransactions> = {};
  transactions.forEach(tx => {
    const d = new Date(tx.timestamp);
    const label =
      d.toDateString() === new Date().toDateString()
        ? 'Today'
        : d.toDateString() === new Date(Date.now() - 86400000).toDateString()
        ? 'Yesterday'
        : d.toLocaleDateString('en-BD', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
};

export function History() {
  const navigate = useNavigate();
  const { language } = useApp();
  const [filter, setFilter] = useState<TxFilter>('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const filtered = mockTransactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (vehicleFilter !== 'all' && tx.vehicle_id !== vehicleFilter) return false;
    return true;
  });

  const grouped = groupByDate(filtered);
  const totalSpent = filtered.filter(t => t.type === 'toll').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalDeposited = filtered.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);

  const typeFilters: { key: TxFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'toll', label: 'Tolls' },
    { key: 'deposit', label: 'Deposits' },
    { key: 'refund', label: 'Refunds' },
  ];

  const typeIcons: Record<string, string> = { toll: '🛣️', deposit: '💰', refund: '↩️' };
  const typeColors: Record<string, string> = { toll: '#EF4444', deposit: '#10B981', refund: '#3B82F6' };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#F7F8FA' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '20px' }}>
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
              {language === 'bn' ? 'ট্রিপ ইতিহাস' : 'Trip History'}
            </h1>
          </div>
          <Filter size={18} color="rgba(255,255,255,0.7)" />
        </div>
      </div>

      {/* Stats row */}
      <div
        className="mx-6 -mt-3 rounded-2xl p-4 flex gap-4"
        style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', zIndex: 10, position: 'relative' }}
      >
        <div className="flex-1 text-center">
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF' }}>Toll Spent</p>
          <p style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '18px', fontWeight: 700, color: '#EF4444', marginTop: '2px' }}>
            ৳{totalSpent}
          </p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1 text-center">
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF' }}>Deposited</p>
          <p style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '18px', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
            ৳{totalDeposited}
          </p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1 text-center">
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF' }}>Trips</p>
          <p style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '18px', fontWeight: 700, color: '#1A1A2E', marginTop: '2px' }}>
            {filtered.filter(t => t.type === 'toll').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {typeFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full transition-all"
              style={{
                background: filter === f.key ? '#006A4E' : 'white',
                color: filter === f.key ? 'white' : '#6B7280',
                fontSize: '12px',
                fontWeight: filter === f.key ? 700 : 400,
                boxShadow: filter === f.key ? '0 4px 12px rgba(0,106,78,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle filter */}
      <div className="px-6 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setVehicleFilter('all')}
            className="flex-shrink-0 px-3 py-1 rounded-full"
            style={{
              background: vehicleFilter === 'all' ? '#1A1A2E' : 'white',
              color: vehicleFilter === 'all' ? 'white' : '#6B7280',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              border: '1.5px solid #E5E7EB',
            }}
          >
            All Vehicles
          </button>
          {mockVehicles.map(v => (
            <button
              key={v.id}
              onClick={() => setVehicleFilter(v.id)}
              className="flex-shrink-0 px-3 py-1 rounded-full flex items-center gap-1"
              style={{
                background: vehicleFilter === v.id ? '#1A1A2E' : 'white',
                color: vehicleFilter === v.id ? 'white' : '#6B7280',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Roboto Mono, monospace',
                border: '1.5px solid #E5E7EB',
              }}
            >
              <Car size={10} />
              {v.platebn.split(' ').slice(-1)[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped transactions */}
      <div className="flex-1 overflow-y-auto px-6 mt-4 pb-24">
        {Object.entries(grouped).map(([date, txs], gi) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1 }}
            className="mb-5"
          >
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {date}
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Transaction cards */}
            <div className="flex flex-col gap-2">
              {txs.map(tx => {
                const timeStr = new Date(tx.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });
                return (
                  <button
                    key={tx.id}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                    style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ fontSize: '18px', background: typeColors[tx.type] + '15' }}
                    >
                      {typeIcons[tx.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {language === 'bn' ? tx.gatebn : tx.gate}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {tx.road && (
                          <>
                            <MapPin size={9} color="#9CA3AF" />
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9CA3AF' }}>{tx.road} · </span>
                          </>
                        )}
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9CA3AF' }}>{timeStr}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        style={{
                          fontFamily: 'Roboto Mono, monospace',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: tx.amount < 0 ? '#EF4444' : '#10B981',
                        }}
                      >
                        {tx.amount < 0 ? '-' : '+'}৳{Math.abs(tx.amount)}
                      </span>
                    </div>
                    <ChevronRight size={14} color="#D1D5DB" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
