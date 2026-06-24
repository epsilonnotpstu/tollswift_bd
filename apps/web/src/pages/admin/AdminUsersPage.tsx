import { useState } from 'react';
import { Download, Search, ShieldOff, UserCheck } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { blockUser, getUsers } from '@/api/admin.api';
import { AdminUser } from '@/types/admin.types';
import { DataTable, Column } from '@/components/admin';
import { formatDateTime } from '@/utils/format';
import { useDebounce } from '@/hooks/useDebounce';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    BLOCKED: 'bg-red-100 text-red-700',
    PENDING: 'bg-amber-100 text-amber-700'
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const RoleBadge = ({ role }: { role: string }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{role}</span>
);

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', debouncedSearch, statusFilter, page],
    queryFn: () => getUsers({ search: debouncedSearch || undefined, status: statusFilter || undefined, page, limit: 25 }),
    placeholderData: (prev) => prev
  });

  const blockMut = useMutation({
    mutationFn: (u: AdminUser) => blockUser(u.id, u.status === 'BLOCKED' ? 'unblock' : 'block'),
    onSuccess: (_, u) => {
      toast.success(`User ${u.status === 'BLOCKED' ? 'unblocked' : 'blocked'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setConfirmUser(null);
    },
    onError: () => toast.error('Action failed')
  });

  const exportCSV = () => {
    if (!data?.items?.length) return;
    const header = 'Name,Email,Phone,Role,Status,Joined';
    const rows = data.items.map((u) => `${u.fullName},${u.email},${u.phone ?? ''},${u.role},${u.status},${u.createdAt}`);
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
  };

  const columns: Column<AdminUser>[] = [
    {
      header: 'User',
      accessor: 'fullName',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {u.fullName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{u.fullName}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Phone', accessor: 'phone', render: (u) => <span className="text-xs text-gray-600">{u.phone ?? '—'}</span> },
    { header: 'Role', accessor: 'role', render: (u) => <RoleBadge role={u.role} /> },
    { header: 'Status', accessor: 'status', render: (u) => <StatusBadge status={u.status} /> },
    {
      header: 'Wallet', accessor: 'wallet', align: 'right',
      render: (u) => <span className="text-sm font-bold text-gray-800">৳{((u.wallet?.balance ?? 0) / 100).toFixed(0)}</span>
    },
    { header: 'Joined', accessor: 'createdAt', render: (u) => <span className="text-xs text-gray-400">{formatDateTime(u.createdAt)}</span> },
    {
      header: '', accessor: 'id', align: 'right',
      render: (u) => (
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmUser(u); }}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            u.status === 'BLOCKED'
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          {u.status === 'BLOCKED' ? <><UserCheck className="h-3.5 w-3.5" /> Unblock</> : <><ShieldOff className="h-3.5 w-3.5" /> Block</>}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{data?.total ?? 0} total users</p>
        <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, phone…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={(data?.items ?? []) as unknown as Record<string, unknown>[]}
          isLoading={isLoading}
          page={page}
          totalPages={data ? Math.ceil(data.total / 25) : 1}
          totalItems={data?.total}
          pageSize={25}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/admin/users/${(row as unknown as AdminUser).id}`)}
          emptyMessage="No users found"
        />
      </div>

      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${confirmUser.status === 'BLOCKED' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {confirmUser.status === 'BLOCKED' ? <UserCheck className="h-6 w-6 text-emerald-600" /> : <ShieldOff className="h-6 w-6 text-red-600" />}
            </div>
            <h2 className="text-center text-base font-bold text-gray-900">
              {confirmUser.status === 'BLOCKED' ? 'Unblock User?' : 'Block User?'}
            </h2>
            <p className="mt-1 text-center text-sm text-gray-500">{confirmUser.fullName} ({confirmUser.email})</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmUser(null)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600">Cancel</button>
              <button
                onClick={() => blockMut.mutate(confirmUser)}
                disabled={blockMut.isPending}
                className={`flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50 ${confirmUser.status === 'BLOCKED' ? 'bg-emerald-500' : 'bg-red-500'}`}
              >
                {blockMut.isPending ? '…' : confirmUser.status === 'BLOCKED' ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
