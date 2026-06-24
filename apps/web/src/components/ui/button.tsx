import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:opacity-95',
      secondary: 'bg-secondary text-white hover:opacity-95',
      ghost: 'bg-transparent text-primary hover:bg-primary-50'
    };

    return (
      <button
        ref={ref}
        className={cn('inline-flex h-11 items-center justify-center rounded-app px-4 text-sm font-semibold', variants[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
