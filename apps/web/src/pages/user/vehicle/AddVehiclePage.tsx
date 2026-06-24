import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { Camera, ChevronRight, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createVehicle } from '@/api/vehicle.api';
import { AppBar } from '@/components/shared';
import { FuelType, VehicleCategory, VehicleType } from '@/types/vehicle.types';

const compressImage = (file: File, maxWidthPx = 1280, quality = 0.82): Promise<File> =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidthPx / img.width, maxWidthPx / img.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }) : file),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

const vehicleTypes: Array<{ type: VehicleType; category: VehicleCategory; label: string; icon: string }> = [
  { type: 'MOTORBIKE', category: 'A', label: 'মোটরবাইক', icon: '🏍️' },
  { type: 'CAR', category: 'B', label: 'গাড়ি', icon: '🚗' },
  { type: 'MICROBUS', category: 'C', label: 'মাইক্রোবাস', icon: '🚐' },
  { type: 'BUS', category: 'D', label: 'বাস', icon: '🚌' },
  { type: 'TRUCK', category: 'E', label: 'ট্রাক', icon: '🚛' },
  { type: 'HEAVY_TRUCK', category: 'F', label: 'ভারী ট্রাক', icon: '🚚' }
];

export const AddVehiclePage = () => {
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState<VehicleType>('CAR');
  const selectedType = useMemo(() => vehicleTypes.find((item) => item.type === vehicleType)!, [vehicleType]);
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('B');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [frontPhoto, setFrontPhoto] = useState<File | undefined>();
  const [backPhoto, setBackPhoto] = useState<File | undefined>();
  const [frontPreview, setFrontPreview] = useState<string | undefined>();
  const [backPreview, setBackPreview] = useState<string | undefined>();
  const [compressing, setCompressing] = useState<'front' | 'back' | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => createVehicle({ registrationNumber, ownerName, vehicleType, vehicleCategory, fuelType }, { frontPhoto, backPhoto }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('গাড়ি যাচাইয়ের জন্য জমা হয়েছে');
      navigate('/vehicles');
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'গাড়ি জমা দিতে সমস্যা হয়েছে';
      if (msg.toLowerCase().includes('registration')) {
        toast.error('রেজিস্ট্রেশন নম্বর সঠিক নয় (যেমন: DHAKA-GA-11-1234)');
      } else {
        toast.error(msg);
      }
    }
  });

  const chooseType = (type: VehicleType) => {
    const item = vehicleTypes.find((entry) => entry.type === type)!;
    setVehicleType(item.type);
    setVehicleCategory(item.category);
  };

  const pickFile = async (event: ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setCompressing(side);
    try {
      const compressed = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressed);
      if (side === 'front') { setFrontPhoto(compressed); setFrontPreview(previewUrl); }
      else { setBackPhoto(compressed); setBackPreview(previewUrl); }
    } catch {
      toast.error('ছবি প্রক্রিয়া করতে সমস্যা হয়েছে');
    } finally {
      setCompressing(null);
    }
  };

  const removePhoto = (side: 'front' | 'back') => {
    if (side === 'front') { if (frontPreview) URL.revokeObjectURL(frontPreview); setFrontPhoto(undefined); setFrontPreview(undefined); }
    else { if (backPreview) URL.revokeObjectURL(backPreview); setBackPhoto(undefined); setBackPreview(undefined); }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!registrationNumber || !ownerName) {
      toast.error('প্রয়োজনীয় তথ্য দিন');
      return;
    }
    mutation.mutate();
  };

  return (
    <main className="min-h-screen bg-bg pb-8">
      <AppBar title="Add Vehicle" titleBn="গাড়ি নিবন্ধন" showBack />
      <form onSubmit={submit} className="space-y-5 px-5 py-5">
        {/* Step progress */}
        <div className="flex items-center gap-2">
          {[1, 2].map((item) => (
            <div key={item} className="flex flex-1 items-center gap-2">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item <= step ? 'bg-primary text-white' : 'bg-border text-text-muted'}`}>{item}</span>
              <span className={`h-1 flex-1 rounded-full ${item < step ? 'bg-primary' : item === step ? 'bg-primary/40' : 'bg-border'}`} />
            </div>
          ))}
          <span className="font-bengali text-xs text-text-muted">{step}/2</span>
        </div>

        {step === 1 ? (
          <>
            <section>
              <h2 className="mb-3 font-bengali text-sm font-bold text-text-primary">যানবাহনের ধরন</h2>
              <div className="grid grid-cols-3 gap-2.5">
                {vehicleTypes.map((item) => (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => chooseType(item.type)}
                    className={`rounded-2xl border p-4 text-center transition active:scale-95 ${vehicleType === item.type ? 'border-primary/50 bg-primary/8 ring-1 ring-primary/20' : 'border-border/60 bg-surface hover:border-border'}`}
                  >
                    <span className="block text-3xl">{item.icon}</span>
                    <span className="mt-1.5 block font-bengali text-xs font-semibold text-text-primary">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <label className="block">
              <span className="mb-2 block font-bengali text-xs font-semibold text-text-muted">রেজিস্ট্রেশন নম্বর</span>
              <input
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value.toUpperCase())}
                placeholder="DHAKA-GA-11-1234"
                className="w-full rounded-2xl border border-border/60 bg-surface px-4 py-3.5 font-mono text-sm outline-none focus:border-primary/50 transition"
              />
              <p className="mt-1.5 font-bengali text-xs text-text-muted">Format: DHAKA-GA-11-1234 অথবা 11G1234</p>
            </label>

            <label className="block">
              <span className="mb-2 block font-bengali text-xs font-semibold text-text-muted">মালিকের নাম</span>
              <input
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
                placeholder="মালিকের পূর্ণ নাম"
                className="w-full rounded-2xl border border-border/60 bg-surface px-4 py-3.5 font-bengali text-sm outline-none focus:border-primary/50 transition"
              />
            </label>

            <div>
              <p className="mb-2 font-bengali text-xs font-semibold text-text-muted">জ্বালানির ধরন</p>
              <div className="flex flex-wrap gap-2">
                {(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'] as FuelType[]).map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setFuelType(item)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${fuelType === item ? 'bg-primary text-white shadow-sm' : 'border border-border/60 bg-surface text-text-secondary hover:border-border'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block font-bengali text-xs font-semibold text-text-muted">ক্যাটাগরি</span>
              <select
                value={vehicleCategory}
                onChange={(event) => setVehicleCategory(event.target.value as VehicleCategory)}
                className="w-full rounded-2xl border border-border/60 bg-surface px-4 py-3.5 text-sm outline-none focus:border-primary/50"
              >
                {(['A', 'B', 'C', 'D', 'E', 'F'] as VehicleCategory[]).map((item) => <option key={item}>{item}</option>)}
              </select>
              <p className="mt-1.5 font-bengali text-xs text-text-muted">{selectedType.label} থেকে নির্বাচিত — admin অনুমোদন করবেন</p>
            </label>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bengali font-bold text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition"
            >
              পরবর্তী <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <p className="font-bengali text-sm text-text-muted">গাড়ির সামনে ও পেছনের স্পষ্ট ছবি আপলোড করুন।</p>
            {([
              { side: 'front' as const, label: 'সামনের ছবি', file: frontPhoto, preview: frontPreview },
              { side: 'back' as const, label: 'পেছনের ছবি', file: backPhoto, preview: backPreview }
            ] as const).map((item) => (
              <div key={item.side}>
                <span className="mb-2 block font-bengali text-xs font-semibold text-text-muted">{item.label}</span>
                {item.preview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface">
                    <img src={item.preview} alt={item.label} className="h-48 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-white">
                        {item.file ? `${(item.file.size / 1024).toFixed(0)} KB` : ''}
                      </span>
                    </div>
                    <div className="absolute right-2 top-2 flex gap-2">
                      <label className="cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition">
                        <Camera className="h-4 w-4" />
                        <input hidden type="file" accept="image/*" capture="environment" onChange={(e) => pickFile(e, item.side)} />
                      </label>
                      <button type="button" onClick={() => removePhoto(item.side)} className="rounded-full bg-red-500/80 p-2 text-white hover:bg-red-600 transition">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-surface p-6 text-center transition ${compressing === item.side ? 'border-primary/50 opacity-70' : 'border-border/60 hover:border-primary/40'}`}>
                    {compressing === item.side ? (
                      <>
                        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
                        <span className="font-bengali text-sm text-text-muted">সংকুচিত হচ্ছে…</span>
                      </>
                    ) : (
                      <>
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                          <Camera className="h-7 w-7 text-primary" />
                        </div>
                        <span className="font-bengali text-sm font-bold text-text-primary">{item.label}</span>
                        <span className="mt-1 font-bengali text-xs text-text-muted">ট্যাপ করে ছবি নিন বা গ্যালারি থেকে বেছে নিন</span>
                      </>
                    )}
                    <input hidden type="file" accept="image/*" capture="environment" onChange={(e) => pickFile(e, item.side)} />
                  </label>
                )}
              </div>
            ))}
            <button
              disabled={mutation.isPending || !frontPhoto || !backPhoto || compressing !== null}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bengali font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition"
            >
              {mutation.isPending ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> আপলোড হচ্ছে…</>
              ) : (!frontPhoto || !backPhoto) ? (
                'জমা দিন (দুটো ছবি দিন)'
              ) : (
                'জমা দিন ✓'
              )}
            </button>
          </>
        )}
      </form>
    </main>
  );
};
