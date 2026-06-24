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
    <main className="min-h-screen bg-bg pb-24">
      <AppBar
        title="Vehicles"
        titleBn="আমার গাড়ি"
        actions={<button onClick={() => navigate('/vehicles/add')} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"><Plus className="h-5 w-5" /></button>}
      />
      <section className="space-y-4 px-5 py-5">
        {pending ? <div className="rounded-app border-l-4 border-amber-400 bg-amber-50 px-4 py-3 font-bengali text-sm text-amber-800">{pending} টি গাড়ি যাচাইয়ের অপেক্ষায়</div> : null}
        {query.isLoading ? <SkeletonList /> : query.data?.length ? query.data.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} onTap={() => navigate(`/vehicles/${vehicle.id}`)} />) : (
          <EmptyState
            title="No vehicles"
            titleBn="কোনো গাড়ি নেই"
            description="Register your first vehicle to pay toll."
            descriptionBn="টোল দিতে প্রথমে একটি যানবাহন নিবন্ধন করুন।"
            icon={<Plus className="h-8 w-8" />}
            action={<button onClick={() => navigate('/vehicles/add')} className="rounded-app bg-primary px-5 py-3 font-bengali text-sm font-bold text-white">গাড়ি যোগ করুন</button>}
          />
        )}
      </section>
    </main>
  );
};

