import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBridges } from '@/api/bridge.api';
import { AppBar, BridgeCard, SkeletonList } from '@/components/shared';
import { useUIStore } from '@/store/uiStore';

export const SelectBridgePage = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const navigate = useNavigate();
  const setTollSelection = useUIStore((state) => state.setTollSelection);
  const bridges = useQuery({ queryKey: ['bridges'], queryFn: () => getBridges() });
  const filtered = useMemo(() => (bridges.data ?? []).filter((bridge) => {
    const matchesQuery = `${bridge.name} ${bridge.nameBn} ${bridge.district}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'ALL' || bridge.category === category;
    return matchesQuery && matchesCategory;
  }), [bridges.data, query, category]);

  return (
    <main className="min-h-screen bg-bg pb-6">
      <AppBar title="Select Bridge" titleBn="সেতু বেছে নিন" showBack />
      <section className="sticky top-14 z-20 border-b border-border bg-surface px-5 py-4">
        <div className="flex items-center gap-2 rounded-full border border-border bg-bg px-4 py-3">
          <Search className="h-4 w-4 text-text-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="সেতুর নাম খুঁজুন" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {['ALL', 'EXPRESSWAY', 'NATIONAL', 'LOCAL'].map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === item ? 'bg-primary text-white' : 'border border-border bg-surface text-text-secondary'}`}>{item}</button>)}
        </div>
      </section>
      <section className="space-y-3 px-5 py-4">
        {bridges.isLoading ? <SkeletonList /> : filtered.map((bridge) => <BridgeCard key={bridge.id} bridge={bridge} onTap={() => { setTollSelection(bridge.id, null, null); navigate('/toll/vehicle'); }} />)}
      </section>
    </main>
  );
};

