import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { downloadReceiptPDF, getTransaction } from '@/api/toll.api';
import { AppBar, ReceiptCard } from '@/components/shared';
import { useCapacitor } from '@/hooks/useCapacitor';

export const ReceiptPage = () => {
  const { id = '' } = useParams();
  const [downloading, setDownloading] = useState(false);
  const query = useQuery({ queryKey: ['transaction', id], queryFn: () => getTransaction(id), enabled: Boolean(id) && id !== 'SUCCESS' });
  const { shareContent } = useCapacitor();
  const transaction = query.data;

  const handleDownload = async () => {
    if (!transaction) return;
    setDownloading(true);
    try {
      await downloadReceiptPDF(transaction.id);
      toast.success('PDF ডাউনলোড শুরু হয়েছে');
    } catch {
      toast.error('PDF তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg pb-6">
      <AppBar title="Receipt" titleBn="রসিদ" showBack />
      <section className="px-5 py-5">
        {query.isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : transaction ? (
          <ReceiptCard
            transaction={transaction}
            onShare={() => shareContent('TollBD Receipt', `Transaction ${transaction.id}`)}
            onDownload={handleDownload}
          />
        ) : (
          <p className="font-bengali text-sm text-text-muted">রসিদ পাওয়া যায়নি</p>
        )}

        {downloading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-2xl">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm font-semibold text-gray-700">PDF তৈরি হচ্ছে...</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
