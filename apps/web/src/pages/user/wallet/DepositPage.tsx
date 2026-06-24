import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { initDeposit } from '@/api/wallet.api';
import { AppBar, PaymentMethodCard } from '@/components/shared';
import { PaymentMethod } from '@/types/transaction.types';

export const DepositPage = () => {
  const [params] = useSearchParams();
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState<PaymentMethod>('SSLCOMMERZ');
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => initDeposit(Number(amount), method as 'SSLCOMMERZ' | 'BKASH' | 'NAGAD' | 'CARD'),
    onSuccess: (data) => {
      window.location.href = data.gatewayUrl;
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Deposit failed')
  });

  if (params.get('txId')) {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    return (
      <main className="min-h-screen bg-bg">
        <AppBar title="Deposit" titleBn="ডিপোজিট সফল" showBack />
        <section className="px-5 py-10 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-5xl">✓</div>
          <h1 className="font-bengali text-2xl font-bold text-green-700">ওয়ালেট রিচার্জ সফল</h1>
          <p className="mt-2 text-sm text-text-secondary">Transaction: {params.get('txId')}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg pb-6">
      <AppBar title="Deposit" titleBn="টাকা যোগ করুন" showBack />
      <section className="space-y-6 px-5 py-6">
        <div className="rounded-app bg-surface p-6 text-center shadow-sm">
          <span className="text-4xl font-bold">৳</span>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" className="w-36 bg-transparent text-center text-4xl font-bold outline-none" />
          <p className="mt-2 font-bengali text-xs text-text-muted">সর্বনিম্ন ৳১০</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[100, 200, 500, 1000, 2000].map((item) => <button key={item} onClick={() => setAmount(String(item))} className="rounded-full bg-primary-50 px-4 py-2 text-sm font-bold text-primary">৳{item}</button>)}
        </div>
        <div className="space-y-3">
          {(['SSLCOMMERZ', 'BKASH', 'NAGAD', 'CARD'] as PaymentMethod[]).map((item) => <PaymentMethodCard key={item} method={item} isSelected={method === item} onClick={() => setMethod(item)} />)}
        </div>
        <button disabled={mutation.isPending || Number(amount) <= 0} onClick={() => mutation.mutate()} className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white disabled:opacity-50">
          এগিয়ে যান
        </button>
      </section>
    </main>
  );
};

