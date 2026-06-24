import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { Camera, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createVehicle } from '@/api/vehicle.api';
import { AppBar } from '@/components/shared';
import { FuelType, VehicleCategory, VehicleType } from '@/types/vehicle.types';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => createVehicle({ registrationNumber, ownerName, vehicleType, vehicleCategory, fuelType }, { frontPhoto, backPhoto }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('গাড়ি যাচাইয়ের জন্য জমা হয়েছে');
      navigate('/vehicles');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Vehicle creation failed')
  });

  const chooseType = (type: VehicleType) => {
    const item = vehicleTypes.find((entry) => entry.type === type)!;
    setVehicleType(item.type);
    setVehicleCategory(item.category);
  };

  const pickFile = (event: ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (side === 'front') setFrontPhoto(file);
    else setBackPhoto(file);
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
    <main className="min-h-screen bg-surface pb-6">
      <AppBar title="Add Vehicle" titleBn="গাড়ি নিবন্ধন" showBack />
      <form onSubmit={submit} className="space-y-6 px-5 py-5">
        <div className="flex gap-2">{[1, 2].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-primary' : 'bg-border'}`} />)}</div>
        {step === 1 ? (
          <>
            <section>
              <h2 className="mb-3 font-bengali font-bold">যানবাহনের ধরন</h2>
              <div className="grid grid-cols-3 gap-3">
                {vehicleTypes.map((item) => <button type="button" key={item.type} onClick={() => chooseType(item.type)} className={`rounded-app border p-4 text-center ${vehicleType === item.type ? 'border-primary bg-primary-50' : 'border-border bg-bg'}`}><span className="block text-3xl">{item.icon}</span><span className="font-bengali text-xs">{item.label}</span></button>)}
              </div>
            </section>
            <label className="block">
              <span className="mb-1.5 block font-bengali text-sm font-semibold">রেজিস্ট্রেশন নম্বর</span>
              <input value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value.toUpperCase())} placeholder="DHAKA-GA-11-1234" className="w-full rounded-app border border-border bg-bg px-4 py-3 font-mono outline-none focus:border-primary" />
              <p className="mt-1 text-xs text-text-muted">Format: DHAKA-GA-11-1234 অথবা 11G1234</p>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-bengali text-sm font-semibold">মালিকের নাম</span>
              <input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} className="w-full rounded-app border border-border bg-bg px-4 py-3 outline-none focus:border-primary" />
            </label>
            <div>
              <p className="mb-2 font-bengali text-sm font-semibold">জ্বালানি</p>
              <div className="flex flex-wrap gap-2">
                {(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'] as FuelType[]).map((item) => <button type="button" key={item} onClick={() => setFuelType(item)} className={`rounded-full px-4 py-2 text-xs font-bold ${fuelType === item ? 'bg-primary text-white' : 'border border-border bg-surface text-text-secondary'}`}>{item}</button>)}
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block font-bengali text-sm font-semibold">Category</span>
              <select value={vehicleCategory} onChange={(event) => setVehicleCategory(event.target.value as VehicleCategory)} className="w-full rounded-app border border-border bg-bg px-4 py-3">
                {(['A', 'B', 'C', 'D', 'E', 'F'] as VehicleCategory[]).map((item) => <option key={item}>{item}</option>)}
              </select>
              <p className="mt-1 text-xs text-text-muted">Selected from {selectedType.label}; admin will approve manually.</p>
            </label>
            <button type="button" onClick={() => setStep(2)} className="flex w-full items-center justify-center gap-2 rounded-app bg-primary py-4 font-bengali font-bold text-white">পরবর্তী <ChevronRight className="h-4 w-4" /></button>
          </>
        ) : (
          <>
            <p className="font-bengali text-sm text-text-secondary">গাড়ির সামনে ও পেছনের স্পষ্ট ছবি আপলোড করুন।</p>
            {[
              { side: 'front' as const, label: 'সামনের ছবি', file: frontPhoto },
              { side: 'back' as const, label: 'পেছনের ছবি', file: backPhoto }
            ].map((item) => (
              <label key={item.side} className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-app border-2 border-dashed border-border bg-bg p-5 text-center">
                <Camera className="mb-2 h-8 w-8 text-primary" />
                <span className="font-bengali text-sm font-bold">{item.label}</span>
                <span className="mt-1 text-xs text-text-muted">{item.file ? item.file.name : 'Tap to upload'}</span>
                <input hidden type="file" accept="image/*" capture="environment" onChange={(event) => pickFile(event, item.side)} />
              </label>
            ))}
            <button disabled={mutation.isPending} className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white disabled:opacity-50">জমা দিন</button>
          </>
        )}
      </form>
    </main>
  );
};
