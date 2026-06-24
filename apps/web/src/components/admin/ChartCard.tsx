import { Download } from 'lucide-react';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  titleBn?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  height?: number;
}

export const ChartCard = ({ title, titleBn, children, action, className = '', height = 280 }: ChartCardProps) => (
  <div className={`rounded-2xl bg-white p-6 shadow-sm ${className}`}>
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {titleBn && <p className="font-bengali mt-0.5 text-xs text-gray-400">{titleBn}</p>}
      </div>
      {action ?? (
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      )}
    </div>
    <div style={{ height }}>{children}</div>
  </div>
);
