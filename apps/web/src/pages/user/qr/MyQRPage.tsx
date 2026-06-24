import { useMemo, useState } from 'react';
import { RefreshCw, Share2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { generateQR, getQR } from '@/api/qr.api';
import { getMyVehicles } from '@/api/vehicle.api';
import { AppBar, EmptyState, QRDisplay } from '@/components/shared';
import { useCapacitor } from '@/hooks/useCapacitor';

export const MyQRPage = () => {
  const vehicles = useQuery({ queryKey: ['vehicles'], queryFn: getMyVehicles });
  const verified = useMemo(() => (vehicles.data ?? []).filter((vehicle) => vehicle.status === 'VERIFIED'), [vehicles.data]);
  const [vehicleId, setVehicleId] = useState('');
  const selected = vehicleId || verified[0]?.id;
  const qr = useQuery({ queryKey: ['qr', selected], queryFn: () => getQR(selected), enabled: Boolean(selected) });
  const queryClient = useQueryClient();
  const { shareContent } = useCapacitor();
  const mutation = useMutation({
    mutationFn: () => generateQR(selected),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['qr', selected] });
      toast.success('QR তৈরি হয়েছে');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'QR failed')
  });

  const share = async () => {
    const element = document.getElementById('qr-card');
    if (element) await html2canvas(element);
    await shareContent('TollBD QR', qr.data?.tokenData ?? '');
  };

  return (
    <main className="min-h-screen bg-bg pb-24">
      <AppBar title="QR FastPass" titleBn="QR FastPass" actions={<button onClick={() => mutation.mutate()} className="flex h-9 w-9 items-center justify-center rounded-full bg-bg"><RefreshCw className="h-4 w-4" /></button>} />
      <section className="space-y-4 px-5 py-5">
        {verified.length ? (
          <>
            <div className="flex gap-2 overflow-x-auto">
              {verified.map((vehicle) => <button key={vehicle.id} onClick={() => setVehicleId(vehicle.id)} className={`shrink-0 rounded-full px-4 py-2 font-mono text-xs font-bold ${selected === vehicle.id ? 'bg-primary text-white' : 'border border-border bg-surface text-text-secondary'}`}>{vehicle.registrationNumber}</button>)}
            </div>
            <div id="qr-card" className="rounded-app border border-border bg-surface p-5 text-center shadow-sm">
              <p className="mb-4 font-bengali text-sm text-text-secondary">গেটে এই QR দেখান</p>
              {qr.data ? <QRDisplay data={qr.data.tokenData} size={220} /> : <button onClick={() => mutation.mutate()} className="rounded-app bg-primary px-5 py-3 font-bengali font-bold text-white">QR তৈরি করুন</button>}
              <p className="mt-4 font-mono text-sm font-bold">{verified.find((vehicle) => vehicle.id === selected)?.registrationNumber}</p>
              {qr.data?.expiresAt ? <p className="mt-1 text-xs text-text-muted">মেয়াদ: {new Date(qr.data.expiresAt).toLocaleString('bn-BD')}</p> : null}
            </div>
            <button onClick={share} className="flex w-full items-center justify-center gap-2 rounded-app bg-secondary py-4 font-bengali font-bold text-white"><Share2 className="h-4 w-4" /> QR শেয়ার করুন</button>
          </>
        ) : <EmptyState title="No verified vehicle" titleBn="অনুমোদিত গাড়ি নেই" description="QR needs an approved vehicle." descriptionBn="QR তৈরি করতে admin approved গাড়ি লাগবে।" icon={<span className="text-3xl">QR</span>} />}
      </section>
    </main>
  );
};

