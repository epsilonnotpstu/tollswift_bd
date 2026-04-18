import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Activity, TrendingUp, Users, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockAdminGates, mockRevenueData, mockTransactions } from '../data/mockData';

const gateStatusConfig = {
  open: { label: 'Open', color: '#10B981', bg: '#ECFDF5' },
  maintenance: { label: 'Maintenance', color: '#F59E0B', bg: '#FFFBEB' },
  closed: { label: 'Closed', color: '#EF4444', bg: '#FEF3F2' },
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'manual' | 'reports'>('dashboard');
  const [searchPlate, setSearchPlate] = useState('');
  const [searchResult, setSearchResult] = useState<null | 'found' | 'notfound'>(null);

  const totalRevenue = mockAdminGates.reduce((s, g) => s + g.revenue_today, 0);
  const totalVehicles = mockAdminGates.reduce((s, g) => s + g.vehicles_today, 0);

  const handleSearch = () => {
    setSearchResult(searchPlate.length > 4 ? 'found' : 'notfound');
  };

  const tabs = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: Activity },
    { key: 'manual' as const, label: 'Manual Entry', icon: Search },
    { key: 'reports' as const, label: 'Reports', icon: TrendingUp },
  ];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0F172A' }}>
      {/* Dark header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E293B 0%, #0F172A 100%)', paddingTop: '50px', paddingBottom: '20px' }}
      >
        <div className="px-5 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <ArrowLeft size={18} color="white" />
            </button>
            <div>
              <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '18px', fontWeight: 700, color: 'white' }}>
                Operator Panel
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#64748B' }}>
                TollBD Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
              Live
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-5 flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: activeTab === tab.key ? '#006A4E' : 'rgba(255,255,255,0.06)',
                }}
              >
                <Icon size={13} style={{ color: activeTab === tab.key ? 'white' : '#94A3B8' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: activeTab === tab.key ? 'white' : '#94A3B8' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: "Today's Revenue", value: `৳${(totalRevenue / 1000).toFixed(1)}k`, sub: '+12% vs yesterday', icon: TrendingUp, color: '#10B981', bg: '#0D2B20' },
                { label: 'Vehicles Today', value: totalVehicles.toLocaleString(), sub: 'across all lanes', icon: Users, color: '#3B82F6', bg: '#0D1F3B' },
                { label: 'Active Gates', value: `${mockAdminGates.filter(g => g.status === 'open').length}/${mockAdminGates.length}`, sub: '1 in maintenance', icon: Activity, color: '#006A4E', bg: '#0D2B20' },
                { label: 'Disputes', value: '3', sub: '2 pending review', icon: AlertTriangle, color: '#F59E0B', bg: '#2B1F00' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-2xl"
                    style={{ background: stat.bg }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#64748B', fontWeight: 500 }}>
                        {stat.label}
                      </span>
                      <Icon size={14} style={{ color: stat.color }} />
                    </div>
                    <p style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '22px', fontWeight: 700, color: 'white' }}>
                      {stat.value}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                      {stat.sub}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Gate status */}
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px', marginBottom: '10px' }}>
              Gate Status
            </h3>
            <div className="flex flex-col gap-3">
              {mockAdminGates.map((gate, i) => {
                const status = gateStatusConfig[gate.status];
                return (
                  <motion.div
                    key={gate.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="p-4 rounded-2xl"
                    style={{ background: '#1E293B' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: 'white' }}>
                        {gate.name}
                      </p>
                      <div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                        style={{ background: status.bg + '20', border: `1px solid ${status.color}30` }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Vehicles', value: gate.vehicles_today.toLocaleString() },
                        { label: 'Revenue', value: `৳${(gate.revenue_today / 1000).toFixed(1)}k` },
                        { label: 'Last vehicle', value: gate.last_vehicle },
                      ].map(item => (
                        <div key={item.label}>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#64748B' }}>{item.label}</p>
                          <p style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '12px', fontWeight: 700, color: '#CBD5E1', marginTop: '1px' }}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent transactions */}
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px', marginBottom: '10px' }}>
              Live Feed
            </h3>
            <div
              className="rounded-2xl overflow-hidden divide-y"
              style={{ background: '#1E293B', divideColor: '#0F172A' }}
            >
              {mockTransactions.filter(t => t.type === 'toll').slice(0, 4).map(tx => (
                <div key={tx.id} className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#0F172A', fontSize: '14px' }}>
                    🚗
                  </div>
                  <div className="flex-1">
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#CBD5E1' }}>
                      {tx.gatebn}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#64748B' }}>
                      {new Date(tx.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
                    +৳{Math.abs(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'manual' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <div className="p-4 rounded-2xl mb-4" style={{ background: '#1E293B' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>
                Lookup vehicle by plate number
              </p>
              <div
                className="flex items-center gap-2 p-3 rounded-xl mb-3"
                style={{ background: '#0F172A' }}
              >
                <Search size={16} color="#64748B" />
                <input
                  type="text"
                  value={searchPlate}
                  onChange={e => setSearchPlate(e.target.value.toUpperCase())}
                  placeholder="DHAKA METRO GA 11-1111"
                  className="flex-1 outline-none bg-transparent"
                  style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '13px', color: 'white' }}
                />
              </div>
              <button
                onClick={handleSearch}
                className="w-full py-3 rounded-xl"
                style={{ background: '#006A4E' }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: 'white' }}>
                  Lookup Vehicle
                </span>
              </button>
            </div>

            {searchResult === 'found' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl"
                style={{ background: '#1E293B' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, color: 'white' }}>
                    Vehicle Found
                  </p>
                  <span className="px-2 py-1 rounded-full" style={{ background: '#0D2B20', color: '#10B981', fontSize: '11px', fontWeight: 700 }}>
                    Verified ✓
                  </span>
                </div>
                {[
                  { label: 'Plate', value: searchPlate },
                  { label: 'Owner', value: 'Rahim Ahmed' },
                  { label: 'Type', value: 'Car' },
                  { label: 'Status', value: 'BRTC Verified' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#64748B' }}>{item.label}</span>
                    <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '12px', color: '#CBD5E1', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
                <div className="mt-4 flex gap-2">
                  {['Car ৳60', 'Bike ৳30', 'Truck ৳200'].map(opt => (
                    <button
                      key={opt}
                      className="flex-1 py-2.5 rounded-xl"
                      style={{ background: '#006A4E', fontSize: '12px', fontWeight: 700, color: 'white', fontFamily: 'Roboto Mono, monospace' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {searchResult === 'notfound' && (
              <div className="p-4 rounded-2xl" style={{ background: '#2B1F1F' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#EF4444', fontWeight: 700 }}>
                  Vehicle not found
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Manual approval required
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#94A3B8' }}>
                Weekly Revenue
              </h3>
              <button className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: '#1E293B' }}>
                <RefreshCw size={12} color="#64748B" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#64748B' }}>Refresh</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl mb-4" style={{ background: '#1E293B', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: 'white', fontSize: '11px' }}
                    formatter={(v: number) => [`৳${v.toLocaleString()}`, 'Revenue']}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {mockRevenueData.map((_, i) => (
                      <Cell key={i} fill={i === 5 ? '#006A4E' : '#1E3A5F'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'This Week', value: `৳${(mockRevenueData.reduce((s, d) => s + d.revenue, 0) / 1000).toFixed(0)}k`, color: '#10B981' },
                { label: 'Peak Day', value: 'Saturday', color: '#006A4E' },
                { label: 'Avg/Day', value: `৳${Math.round(mockRevenueData.reduce((s, d) => s + d.revenue, 0) / 7 / 1000)}k`, color: '#3B82F6' },
                { label: 'Vehicle Types', value: 'Car 68%', color: '#F59E0B' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-2xl" style={{ background: '#1E293B' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#64748B' }}>{item.label}</p>
                  <p style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '18px', fontWeight: 700, color: item.color, marginTop: '2px' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
