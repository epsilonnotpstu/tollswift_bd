import { Download, Share2 } from 'lucide-react';
import { Transaction } from '@/types/transaction.types';
import { formatBDT, formatDateTime } from '@/utils/format';
import { QRDisplay } from './QRDisplay';
import { StatusBadge } from './StatusBadge';

interface ReceiptCardProps {
  transaction: Transaction;
  onShare?: () => void;
  onDownload?: () => void;
}

export const ReceiptCard = ({ transaction, onShare, onDownload }: ReceiptCardProps) => (
  <article className="overflow-hidden rounded-app border border-border bg-surface shadow-sm">
    <header className="bg-primary px-5 py-5 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-app bg-white/15 text-xl">🌉</span>
          <span className="font-bold">TollBD</span>
        </div>
        <div className="text-right">
          <p className="font-bengali text-sm font-bold">সেতু টোল রসিদ</p>
          <p className="text-xs text-white/75">Bangladesh Bridge Authority</p>
        </div>
      </div>
    </header>
    <div className="space-y-3 p-5">
      <div className="flex justify-between gap-3">
        <div>
          <p className="text-xs text-text-muted">রসিদ নম্বর</p>
          <p className="font-mono text-xs font-bold">{transaction.id}</p>
        </div>
        <StatusBadge status={transaction.status} />
      </div>
      {[
        ['সেতুর নাম', transaction.bridgeName],
        ['যানবাহন নম্বর', transaction.vehiclePlate],
        ['পেমেন্ট পদ্ধতি', transaction.paymentMethod],
        ['তারিখ', formatDateTime(transaction.createdAt)]
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between border-b border-border py-2 text-sm">
          <span className="font-bengali text-text-secondary">{label}</span>
          <span className="text-right font-medium text-text-primary">{value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-app bg-green-50 px-4 py-3">
        <span className="font-bengali font-bold text-green-700">পরিশোধিত পরিমাণ</span>
        <span className="text-2xl font-bold text-green-700">{formatBDT(transaction.amount)}</span>
      </div>
      <div className="flex flex-col items-center gap-2 py-2">
        <QRDisplay data={transaction.id} size={128} />
        <p className="font-bengali text-xs text-text-muted">স্ক্যান করে যাচাই করুন</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onShare} className="flex items-center justify-center gap-2 rounded-app border border-border py-3 text-sm font-semibold text-text-primary">
          <Share2 className="h-4 w-4" /> Share
        </button>
        <button onClick={onDownload} className="flex items-center justify-center gap-2 rounded-app bg-primary py-3 text-sm font-semibold text-white">
          <Download className="h-4 w-4" /> PDF
        </button>
      </div>
    </div>
  </article>
);

