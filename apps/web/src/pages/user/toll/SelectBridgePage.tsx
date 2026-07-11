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
      <section className="sticky top-[56px] z-20 border-b border-border/50 bg-surface/95 px-5 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-bg px-4 py-2.5 focus-within:border-primary/40 transition">
          <Search className="h-4 w-4 shrink-0 text-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="সেতুর নাম বা জেলা খুঁজুন"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {[['ALL', 'সব'], ['EXPRESSWAY', 'এক্সপ্রেসওয়ে'], ['NATIONAL', 'জাতীয়'], ['LOCAL', 'স্থানীয়']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCategory(val)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 font-bengali text-xs font-bold transition ${category === val ? 'bg-primary text-white shadow-sm' : 'border border-border/60 bg-surface text-text-secondary hover:border-border'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3 px-5 py-4">
        {bridges.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface px-6 py-12 text-center">
            <p className="text-2xl">🌉</p>
            <p className="mt-2 font-bengali text-sm text-text-muted">কোনো সেতু পাওয়া যায়নি</p>
          </div>
        ) : (
          filtered.map((bridge) => (
            <BridgeCard
              key={bridge.id}
              bridge={bridge}
              onTap={() => { setTollSelection(bridge.id, null, null); navigate('/toll/vehicle'); }}
            />
          ))
        )}
      </section>
    </main>
  );
};

