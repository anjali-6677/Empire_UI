import * as React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      disabled = false,
      fullWidth = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer shrink-0 whitespace-nowrap font-semibold text-[13px]';

    const variantStyles: Record<ButtonVariant, string> = {
      // Primary: Empire Brand Taupe/Gold (#BCA174) with dark contrast text (#172033) and border (#95794D)
      primary:
        'bg-[#BCA174] hover:bg-[#AA8D5C] active:bg-[#95794D] text-[#172033] border border-[#95794D] shadow-xs focus:ring-[#BCA174]/60',
      // Secondary: Clean surface with subtle border
      secondary:
        'bg-white hover:bg-slate-50 active:bg-slate-100 text-[#172033] border border-[#D9DEE7] shadow-xs focus:ring-slate-300',
      // Tertiary: Ghost text without border
      tertiary:
        'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-[#6E7889] hover:text-[#172033] focus:ring-slate-300',
      // Outline: Muted border button
      outline:
        'bg-white hover:bg-slate-50 active:bg-slate-100 text-[#172033] border border-[#D9DEE7] shadow-xs focus:ring-[#BCA174]/50',
      // Danger: Destructive red
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus:ring-rose-500/60 border border-rose-700/30',
      // Success: Emerald green for approved/active states (never for create/submit)
      success:
        'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus:ring-emerald-500/60 border border-emerald-700/30',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs rounded-[6px] gap-1.5',
      md: 'h-[36px] px-[14px] text-[13px] rounded-[6px] gap-2 min-w-max w-auto',
      lg: 'h-10 px-4 text-sm rounded-[6px] gap-2',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />}
        {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
