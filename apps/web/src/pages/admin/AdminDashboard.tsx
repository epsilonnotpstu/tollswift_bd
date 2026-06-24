import { Activity, Building2, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboardStats } from '@/api/admin.api';
import { formatBDT } from '@/utils/format';

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-start justify-between">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      {sub ? <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-600">{sub}</span> : null}
    </div>
    <p className="text-2xl font-bold text-text-primary">{value}</p>
    <p className="mt-0.5 text-sm text-text-secondary">{label}</p>
  </div>
);

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: getDashboardStats });

  const chartData = (stats?.weeklyRevenue ?? []).map((item) => ({
    day: new Date(item.date).toLocaleDateString('en-BD', { weekday: 'short' }),
    revenue: item.amountPaisa
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary">Overview of TollBD operations</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Active Users"
            value={stats?.totalActiveUsers?.toLocaleString() ?? '—'}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Today's Revenue"
            value={stats ? formatBDT(stats.todayRevenuePaisa) : '—'}
            sub="Today"
            color="bg-green-50 text-green-600"
          />
          <StatCard
            icon={Activity}
            label="Today's Transactions"
            value={stats?.todayTransactionCount?.toLocaleString() ?? '—'}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            icon={Clock}
            label="Pending Vehicles"
            value={stats?.pendingVehicleCount?.toLocaleString() ?? '—'}
            color={stats?.pendingVehicleCount ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-text-primary">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4FDB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1B4FDB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b9db8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#8b9db8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: unknown) => `৳${((v as number) / 100).toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e9f0' }}
                formatter={(v: unknown) => [formatBDT(v as number), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#1B4FDB" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-text-primary">Payment Methods</h2>
          {stats ? (
            <div className="space-y-3">
              {Object.entries(stats.paymentMethodBreakdown).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{method}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, (count / Math.max(1, stats.todayTransactionCount)) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-bold text-text-primary">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          )}
          {stats?.pendingVehicleCount ? (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-xs font-bold text-amber-700">
                  {stats.pendingVehicleCount} vehicles awaiting review
                </p>
                <p className="text-xs text-amber-600">Check Vehicles tab</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <p className="text-xs font-bold text-green-700">All vehicles reviewed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
