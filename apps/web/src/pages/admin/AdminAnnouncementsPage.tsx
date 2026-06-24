import { FormEvent, useState } from 'react';
import { Bell, Info, Plus, Triangle, Wrench, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createAnnouncement, getAnnouncements } from '@/api/admin.api';
import { formatDateTime } from '@/utils/format';

const TYPE_META = {
  INFO: { icon: Info, color: 'bg-blue-50 text-blue-700', label: 'Info' },
  WARNING: { icon: Triangle, color: 'bg-amber-50 text-amber-700', label: 'Warning' },
  MAINTENANCE: { icon: Wrench, color: 'bg-gray-100 text-gray-700', label: 'Maintenance' }
} as const;

export const AdminAnnouncementsPage = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [body, setBody] = useState('');
  const [bodyBn, setBodyBn] = useState('');
  const [type, setType] = useState<'INFO' | 'WARNING' | 'MAINTENANCE'>('INFO');
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ['admin-announcements'], queryFn: () => getAnnouncements(true) });

  const mutation = useMutation({
    mutationFn: () =>
      createAnnouncement({ title, titleBn, body, bodyBn, type, targetBridgeIds: [] }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Announcement created');
      setOpen(false);
      setTitle(''); setTitleBn(''); setBody(''); setBodyBn('');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Creation failed')
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !titleBn || !body || !bodyBn) return toast.error('All fields required');
    mutation.mutate();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Announcements</h1>
          <p className="text-sm text-text-secondary">{query.data?.length ?? 0} total</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="space-y-3">
        {query.isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))
        ) : (query.data ?? []).length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <Bell className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 font-bold text-text-primary">No announcements</p>
          </div>
        ) : (
          (query.data ?? []).map((ann) => {
            const meta = TYPE_META[ann.type as keyof typeof TYPE_META];
            const Icon = meta.icon;
            return (
              <div key={ann.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                    <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-text-primary">{ann.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 font-bengali text-sm text-text-secondary">{ann.titleBn}</p>
                    <p className="mt-2 text-sm text-text-muted">{ann.body}</p>
                    <p className="mt-2 text-xs text-text-muted">{formatDateTime(ann.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="font-bold">New Announcement</h2>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-text-secondary">Type</p>
                  <div className="flex gap-2">
                    {(['INFO', 'WARNING', 'MAINTENANCE'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          type === t ? 'bg-primary text-white' : 'border border-border bg-gray-50 text-text-secondary'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-text-secondary">Title (English)</span>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-text-secondary font-bengali">শিরোনাম (বাংলা)</span>
                  <input value={titleBn} onChange={(e) => setTitleBn(e.target.value)} className="w-full rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm font-bengali outline-none focus:border-primary" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-text-secondary">Body (English)</span>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-text-secondary font-bengali">বিবরণ (বাংলা)</span>
                  <textarea value={bodyBn} onChange={(e) => setBodyBn(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm font-bengali outline-none focus:border-primary" />
                </label>
              </div>
            </div>
            <div className="border-t p-5">
              <button disabled={mutation.isPending} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-60">
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};
