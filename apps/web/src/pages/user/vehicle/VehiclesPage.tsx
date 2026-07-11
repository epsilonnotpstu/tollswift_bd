import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyVehicles } from '@/api/vehicle.api';
import { AppBar, EmptyState, SkeletonList, VehicleCard } from '@/components/shared';

export const VehiclesPage = () => {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['vehicles'], queryFn: getMyVehicles });
  const pending = query.data?.filter((vehicle) => vehicle.status === 'PENDING').length ?? 0;

  return (
    <main className="min-h-screen bg-bg pb-28">
      <AppBar
        title="Vehicles"
        titleBn="আমার গাড়ি"
        actions={
          <button
            onClick={() => navigate('/vehicles/add')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary/90 transition"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />
      <section className="space-y-3.5 px-5 py-5">
        {pending > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="text-lg">⏳</span>
            <p className="font-bengali text-sm font-semibold text-amber-800">
              {pending} টি গাড়ি যাচাইয়ের অপেক্ষায়
            </p>
          </div>
        )}
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface" />)}
          </div>
        ) : query.data?.length ? (
          query.data.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onTap={() => navigate(`/vehicles/${vehicle.id}`)} />
          ))
        ) : (
          <EmptyState
            title="No vehicles"
            titleBn="কোনো গাড়ি নেই"
            description="Register your first vehicle to pay toll."
            descriptionBn="টোল দিতে প্রথমে একটি যানবাহন নিবন্ধন করুন।"
            icon={<Plus className="h-8 w-8" />}
            action={
              <button
                onClick={() => navigate('/vehicles/add')}
                className="rounded-2xl bg-primary px-6 py-3 font-bengali text-sm font-bold text-white shadow-lg shadow-primary/25"
              >
                গাড়ি যোগ করুন
              </button>
            }
          />
        )}
      </section>
    </main>
  );
};

