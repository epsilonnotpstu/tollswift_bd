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
  <div className="flex flex-col items-center justify-center rounded-app border border-dashed border-border bg-surface px-6 py-10 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary">{icon}</div>
    <h3 className="font-bengali text-lg font-bold text-text-primary">{titleBn}</h3>
    <p className="text-sm font-semibold text-text-secondary">{title}</p>
    <p className="mt-2 max-w-xs font-bengali text-sm text-text-muted">{descriptionBn}</p>
    <p className="text-xs text-text-muted">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

