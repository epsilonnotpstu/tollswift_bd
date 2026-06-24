import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { QRDisplay } from '@/components/shared';
import { useCapacitor } from '@/hooks/useCapacitor';
import { useUIStore } from '@/store/uiStore';

export const PaymentSuccessPage = () => {
  const [params] = useSearchParams();
  const txId = params.get('txId') ?? params.get('transactionId') ?? 'SUCCESS';
  const clear = useUIStore((state) => state.clearTollSelection);
  const { vibrate } = useCapacitor();

  useEffect(() => {
    clear();
    vibrate();
  }, [clear, vibrate]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-surface px-6 py-14 text-center">
      <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-secondary text-white shadow-lg">
        <CheckCircle className="h-14 w-14" />
      </div>
      <h1 className="mt-5 font-bengali text-3xl font-bold text-secondary">পেমেন্ট সফল!</h1>
      <p className="mt-2 text-sm text-text-secondary">Transaction ID</p>
      <p className="font-mono text-sm font-bold text-primary">{txId}</p>
      <div className="mt-8">
        <QRDisplay data={txId} size={150} />
      </div>
      <div className="mt-auto grid w-full grid-cols-2 gap-3">
        <Link to="/home" className="rounded-app border border-border py-4 font-bengali font-bold text-text-primary">হোম</Link>
        <Link to={`/history/${txId}`} className="rounded-app bg-primary py-4 font-bengali font-bold text-white">রসিদ</Link>
      </div>
    </main>
  );
};

