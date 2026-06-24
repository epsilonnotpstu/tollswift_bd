import { Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteVehicle, getVehicle } from '@/api/vehicle.api';
import { AppBar, StatusBadge } from '@/components/shared';

export const VehicleDetailPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['vehicle', id], queryFn: () => getVehicle(id), enabled: Boolean(id) });
  const remove = useMutation({
    mutationFn: () => deleteVehicle(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('গাড়ি মুছে ফেলা হয়েছে');
      navigate('/vehicles');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Delete failed')
  });
  const vehicle = query.data;

  return (
    <main className="min-h-screen bg-bg">
      <AppBar title="Vehicle" titleBn="গাড়ির বিবরণ" showBack />
      {vehicle ? (
        <section className="space-y-4 px-5 py-5">
          <div className="rounded-app border border-border bg-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="font-mono text-lg font-bold">{vehicle.registrationNumber}</h1>
              <StatusBadge status={vehicle.status} />
            </div>
            {[
              ['মালিক', vehicle.ownerName],
              ['ধরন', vehicle.vehicleType],
              ['Category', vehicle.vehicleCategory],
              ['Fuel', vehicle.fuelType ?? '-']
            ].map(([label, value]) => <div key={label} className="flex justify-between border-b border-border py-3 text-sm"><span className="font-bengali text-text-secondary">{label}</span><span className="font-semibold">{value}</span></div>)}
            {vehicle.rejectionReason ? <div className="mt-4 rounded-app bg-red-50 p-3 font-bengali text-sm text-red-700">{vehicle.rejectionReason}</div> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[vehicle.frontPhotoUrl, vehicle.backPhotoUrl].map((src, index) => <div key={index} className="aspect-[4/3] overflow-hidden rounded-app bg-surface">{src ? <img src={src} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-text-muted">No photo</div>}</div>)}
          </div>
          <button onClick={() => window.confirm('Delete vehicle?') && remove.mutate()} className="flex w-full items-center justify-center gap-2 rounded-app bg-red-50 py-4 font-bengali font-bold text-red-700">
            <Trash2 className="h-4 w-4" /> মুছে ফেলুন
          </button>
        </section>
      ) : <p className="p-5 font-bengali text-text-muted">লোড হচ্ছে...</p>}
    </main>
  );
};

