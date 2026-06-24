import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTransaction } from '@/api/toll.api';
import { AppBar, ReceiptCard } from '@/components/shared';
import { useCapacitor } from '@/hooks/useCapacitor';

export const ReceiptPage = () => {
  const { id = '' } = useParams();
  const query = useQuery({ queryKey: ['transaction', id], queryFn: () => getTransaction(id), enabled: Boolean(id) && id !== 'SUCCESS' });
  const { shareContent } = useCapacitor();
  const transaction = query.data;

  return (
    <main className="min-h-screen bg-bg pb-6">
      <AppBar title="Receipt" titleBn="রসিদ" showBack />
      <section className="px-5 py-5">
        {transaction ? (
          <ReceiptCard
            transaction={transaction}
            onShare={() => shareContent('TollBD Receipt', `Transaction ${transaction.id}`)}
            onDownload={() => toast.success('PDF download API পরের ধাপে যুক্ত হবে')}
          />
        ) : <p className="font-bengali text-sm text-text-muted">রসিদ লোড হচ্ছে...</p>}
      </section>
    </main>
  );
};

