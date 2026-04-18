import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Eye, EyeOff, TrendingDown } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { TransactionRow } from '../components/shared/TransactionRow';
import { useApp } from '../context/AppContext';
import { mockTransactions, mockChartData } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Filter = 'all' | 'toll' | 'deposit' | 'refund';

export function Wallet() {
  const navigate = useNavigate();
  const { balance, language } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [balanceHidden, setBalanceHidden] = useState(false);

  const filtered = filter === 'all' ? mockTransactions : mockTransactions.filter(t => t.type === filter);

  const totalSpent = mockTransactions
    .filter(t => t.type === 'toll')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'toll', label: 'Toll' },
    { key: 'deposit', label: 'Deposit' },
    { key: 'refund', label: 'Refund' },
  ];

  return (
    <div
      className="w-full h-full flex flex-col overflow-y-auto"
      style={{ background: '#F7F8FA' }}
    >
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '24px' }}
      >
        <svg className="absolute bottom-0 right-0 opacity-10" width="160" height="100" viewBox="0 0 160 100" fill="none">
          <path d="M0 100 L60 15 L70 15 L80 15 L160 100 Z" fill="white" />
        </svg>
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
            {language === 'bn' ? 'ওয়ালেট' : 'My Wallet'}
          </h1>
        </div>

        {/* Balance */}
        <div className="px-6 mt-6 text-center">
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
            Available Balance
          </p>
          <div className="flex items-center justify-center gap-3 mt-1">
            {balanceHidden ? (
              <div className="flex gap-2 items-center" style={{ height: '48px' }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-white opacity-60" />
                ))}
              </div>
            ) : (
              <span
                style={{
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: '42px',
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '-2px',
                }}
              >
                ৳{balance.toFixed(2)}
              </span>
            )}
            <button onClick={() => setBalanceHidden(h => !h)}>
              {balanceHidden
                ? <EyeOff size={18} color="rgba(255,255,255,0.7)" />
                : <Eye size={18} color="rgba(255,255,255,0.7)" />
              }
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 mt-2">
            <TrendingDown size={12} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
              ৳{totalSpent} spent in toll this month
            </span>
          </div>
        </div>
      </div>

      {/* Add money button */}
      <div className="px-6 mt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/add-money')}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #F42A41, #C0172B)',
            boxShadow: '0 6px 20px rgba(244,42,65,0.35)',
          }}
        >
          <Plus size={20} color="white" strokeWidth={2.5} />
          <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '16px', fontWeight: 700, color: 'white' }}>
            {language === 'bn' ? 'টাকা যোগ করুন' : 'Add Money'}
          </span>
        </motion.button>
      </div>

      {/* Spending chart */}
      <div
        className="mx-6 mt-4 p-4 rounded-3xl"
        style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1A1A2E' }}>
            Spending (last 30 days)
          </h3>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>৳390 total</span>
        </div>
        <div style={{ height: '90px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
              <defs>
                <linearGradient id="tollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006A4E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#006A4E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: '#1A1A2E',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '11px',
                  padding: '4px 8px',
                }}
                formatter={(v: number) => [`৳${v}`, 'Toll']}
                labelStyle={{ display: 'none' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#006A4E"
                strokeWidth={2}
                fill="url(#tollGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-6 mt-5">
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-1.5 rounded-full transition-all"
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

      {/* Transactions */}
      <div
        className="mx-6 mt-4 mb-8 bg-white rounded-3xl px-4 divide-y divide-gray-50"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        {filtered.map(tx => (
          <TransactionRow key={tx.id} transaction={tx} language={language} />
        ))}
      </div>
    </div>
  );
}
