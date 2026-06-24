import { CheckCircle, ExternalLink, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteVehicle, getVehicle } from '@/api/vehicle.api';
import { AppBar, StatusBadge } from '@/components/shared';
import { formatDateTime } from '@/utils/format';

const FUEL_LABEL: Record<string, string> = {
  PETROL: 'Petrol', DIESEL: 'Diesel', CNG: 'CNG', ELECTRIC: 'Electric', HYBRID: 'Hybrid'
};

const TYPE_LABEL: Record<string, string> = {
  MOTORBIKE: 'Motorbike', CAR: 'Car', MICROBUS: 'Microbus', BUS: 'Bus', TRUCK: 'Small Truck', HEAVY_TRUCK: 'Heavy Truck'
};

const CATEGORY_LABEL: Record<string, string> = {
  A: 'মোটরবাইক', B: 'গাড়ি', C: 'মাইক্রোবাস', D: 'বাস', E: 'ট্রাক', F: 'ভারী ট্রাক'
};

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

  if (query.isLoading) {
    return (
      <main className="min-h-screen bg-bg">
        <AppBar title="Vehicle" titleBn="গাড়ির বিবরণ" showBack />
        <div className="space-y-3 px-5 py-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-app bg-surface" />)}
        </div>
      </main>
    );
  }

  if (!vehicle) return null;

  const brtaBg = vehicle.brtaVerified === true
    ? 'border-green-200 bg-green-50'
    : vehicle.brtaVerified === false
    ? 'border-amber-200 bg-amber-50'
    : 'border-gray-200 bg-gray-50';

  return (
    <main className="min-h-screen bg-bg pb-10">
      <AppBar title="Vehicle" titleBn="গাড়ির বিবরণ" showBack />

      <section className="space-y-4 px-5 py-5">
        {vehicle.status === 'PENDING' && (
          <div className="flex items-start gap-3 rounded-app border border-amber-200 bg-amber-50 px-4 py-3">
            <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-amber-600" />
            <div>
              <p className="font-bengali text-sm font-bold text-amber-800">Admin যাচাইয়ের অপেক্ষায়</p>
              <p className="font-bengali text-xs text-amber-700 mt-0.5">অনুমোদনের পর QR ও টোল পেমেন্ট চালু হবে।</p>
            </div>
          </div>
        )}
        {vehicle.status === 'REJECTED' && vehicle.rejectionReason && (
          <div className="flex items-start gap-3 rounded-app border border-red-200 bg-red-50 px-4 py-3">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="font-bengali text-sm font-bold text-red-800">যাচাই প্রত্যাখ্যাত</p>
              <p className="font-bengali text-xs text-red-700 mt-0.5">{vehicle.rejectionReason}</p>
            </div>
          </div>
        )}
        {vehicle.status === 'VERIFIED' && (
          <div className="flex items-start gap-3 rounded-app border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <p className="font-bengali text-sm font-bold text-green-800">গাড়ি যাচাইকৃত — টোল পেমেন্ট সক্রিয়</p>
          </div>
        )}

        <div className="rounded-app border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-xl font-bold text-text-primary">{vehicle.registrationNumber}</p>
              <p className="font-bengali text-sm text-text-secondary">{vehicle.ownerName}</p>
            </div>
            <StatusBadge status={vehicle.status} />
          </div>
          <div className="space-y-0">
            {[
              ['যানবাহনের ধরন', TYPE_LABEL[vehicle.vehicleType] ?? vehicle.vehicleType],
              ['Category', `${vehicle.vehicleCategory} — ${CATEGORY_LABEL[vehicle.vehicleCategory] ?? ''}`],
              ['জ্বালানি', FUEL_LABEL[vehicle.fuelType ?? ''] ?? vehicle.fuelType ?? '—'],
              ['নিবন্ধনের তারিখ', formatDateTime(vehicle.createdAt)]
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-border py-3 text-sm last:border-b-0">
                <span className="font-bengali text-text-secondary">{label}</span>
                <span className="font-semibold text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BRTA Verification Status */}
        <div className={`rounded-app border p-4 ${brtaBg}`}>
          <p className="text-sm font-bold text-text-primary mb-1">BRTA যাচাইকরণ</p>
          <p className="font-bengali text-xs text-text-secondary">
            {vehicle.brtaVerified === true
              ? '✓ BRTA API থেকে স্বয়ংক্রিয়ভাবে যাচাই করা হয়েছে'
              : vehicle.brtaVerified === false
              ? '⚠ BRTA API যাচাই ব্যর্থ — Admin ম্যানুয়াল রিভিউ করবেন'
              : 'ℹ BRTA API সংযোগ নেই — Admin ম্যানুয়ালি অনুমোদন দেবেন'}
          </p>
          {vehicle.brtaVerifiedAt ? (
            <p className="mt-1 text-xs text-text-muted">Checked: {formatDateTime(vehicle.brtaVerifiedAt)}</p>
          ) : null}
        </div>

        {vehicle.frontPhotoUrl || vehicle.backPhotoUrl ? (
          <div>
            <p className="mb-2 font-bengali text-sm font-semibold text-text-secondary">গাড়ির ছবি</p>
            <div className="grid grid-cols-2 gap-3">
              {[vehicle.frontPhotoUrl, vehicle.backPhotoUrl].map((src, i) => (
                <div key={i} className="aspect-[4/3] overflow-hidden rounded-app border border-border bg-surface">
                  {src ? (
                    <img
                      src={src}
                      alt={i === 0 ? 'Front' : 'Back'}
                      className="h-full w-full cursor-pointer object-cover"
                      onClick={() => window.open(src, '_blank')}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-bengali text-xs text-text-muted">
                      {i === 0 ? 'সামনের ছবি নেই' : 'পেছনের ছবি নেই'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3 pt-2">
          {vehicle.status === 'VERIFIED' ? (
            <button
              onClick={() => navigate('/qr')}
              className="flex w-full items-center justify-center gap-2 rounded-app bg-primary py-4 font-bengali font-bold text-white"
            >
              <ExternalLink className="h-4 w-4" /> QR FastPass দেখুন
            </button>
          ) : null}
          <button
            onClick={() => { if (window.confirm('এই গাড়িটি মুছে ফেলতে চান?')) remove.mutate(); }}
            disabled={remove.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-app border border-red-200 bg-red-50 py-4 font-bengali font-bold text-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> গাড়ি মুছে ফেলুন
          </button>
        </div>
      </section>
    </main>
  );
};
