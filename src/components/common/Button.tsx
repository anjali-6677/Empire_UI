import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-[11px] gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-xs sm:text-sm gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#AB9570] hover:bg-[#927D5E] text-[#121214] font-black shadow-xs focus:ring-[#AB9570]',
    secondary:
      'bg-[#121214] hover:bg-slate-800 text-white font-bold shadow-xs focus:ring-slate-800',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs focus:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 font-semibold focus:ring-slate-300',
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
export default Button;
