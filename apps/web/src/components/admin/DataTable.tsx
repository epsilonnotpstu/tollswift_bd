import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  keyField?: keyof T;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (p: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 animate-pulse rounded-lg bg-gray-100" />
      </td>
    ))}
  </tr>
);

export function DataTable<T extends Record<string, unknown>>({
  columns, data, isLoading, keyField = 'id' as keyof T,
  page = 1, totalPages = 1, totalItems, pageSize = 25,
  onPageChange, onRowClick, emptyMessage = 'No data found'
}: DataTableProps<T>) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems ?? data.length);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              {columns.map((col) => (
                <th
                  key={String(col.accessor)}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 ${col.width ?? ''}`}
                  style={{ textAlign: col.align ?? 'left' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-400">{emptyMessage}</td>
                </tr>
              )
              : data.map((row, i) => (
                <tr
                  key={String(row[keyField] ?? i)}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors hover:bg-blue-50/40 ${onRowClick ? 'cursor-pointer' : ''} ${i % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'}`}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.accessor)}
                      className="px-4 py-3.5 text-gray-700"
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {col.render
                        ? col.render(row)
                        : String(row[col.accessor as keyof T] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">
            {totalItems ? `${from}–${to} of ${totalItems}` : `Page ${page} of ${totalPages}`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition ${p === page ? 'bg-primary text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
