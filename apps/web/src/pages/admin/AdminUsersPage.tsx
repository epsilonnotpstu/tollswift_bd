import { useState } from 'react';
import { Search, Shield, ShieldOff, UserRound } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { blockUser, getUsers } from '@/api/admin.api';
import { formatDateTime } from '@/utils/format';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  BLOCKED: 'bg-red-50 text-red-700',
  UNVERIFIED: 'bg-amber-50 text-amber-700'
};

export const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-users', search, statusFilter],
    queryFn: () => getUsers({ search: search || undefined, status: statusFilter || undefined, limit: 50 })
  });

  const toggleBlock = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => blockUser(id, blocked),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Action failed')
  });

  const users = query.data?.items ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Users</h1>
        <p className="text-sm text-text-secondary">{query.data?.total ?? 0} registered users</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
          <option value="UNVERIFIED">Unverified</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {query.isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <UserRound className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 font-bold text-text-primary">No users found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3">User</th>
                <th className="hidden px-4 py-3 md:table-cell">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-primary">{user.fullName[0]}</span>
                        )}
                      </div>
                      <span className="font-medium text-text-primary">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-text-secondary md:table-cell">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_COLOR[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-text-secondary lg:table-cell">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={toggleBlock.isPending}
                      onClick={() => toggleBlock.mutate({ id: user.id, blocked: user.status !== 'BLOCKED' })}
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        user.status === 'BLOCKED' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {user.status === 'BLOCKED' ? (
                        <><Shield className="h-3.5 w-3.5" /> Unblock</>
                      ) : (
                        <><ShieldOff className="h-3.5 w-3.5" /> Block</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
