import { ReactNode } from 'react';
import { cn } from '@/components/ui/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: string;
}

export const BottomSheet = ({ isOpen, onClose, title, children, height = 'max-h-[75vh]' }: BottomSheetProps) => (
  <div className={cn('fixed inset-0 z-50 transition', isOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
    <button aria-label="Close" onClick={onClose} className={cn('absolute inset-0 bg-black/40 transition-opacity', isOpen ? 'opacity-100' : 'opacity-0')} />
    <section className={cn('absolute inset-x-0 bottom-0 rounded-t-[24px] bg-surface p-5 shadow-2xl transition-transform duration-300', height, isOpen ? 'translate-y-0' : 'translate-y-full')}>
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
      {title ? <h3 className="mb-4 font-bengali text-lg font-bold text-text-primary">{title}</h3> : null}
      {children}
    </section>
  </div>
);

