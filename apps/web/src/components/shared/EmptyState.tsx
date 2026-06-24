import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  icon: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({ title, titleBn, description, descriptionBn, icon, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-surface px-8 py-14 text-center">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/8 text-primary">{icon}</div>
    <h3 className="font-bengali text-lg font-bold text-text-primary">{titleBn}</h3>
    <p className="mt-0.5 text-sm font-medium text-text-secondary">{title}</p>
    <p className="mt-2.5 max-w-xs font-bengali text-sm leading-relaxed text-text-muted">{descriptionBn}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

