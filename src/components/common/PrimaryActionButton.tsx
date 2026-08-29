import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, LucideIcon } from 'lucide-react';

interface PrimaryActionButtonProps {
  label: string;
  onClick?: () => void;
  to?: string;
  icon?: LucideIcon | React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  id?: string;
}

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  label,
  onClick,
  to,
  icon: Icon = Plus,
  className = '',
  type = 'button',
  disabled = false,
  id,
}) => {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const Component = Icon as LucideIcon;
    return <Component className="w-[16px] h-[16px] shrink-0 stroke-[2.5]" />;
  };

  const buttonClasses = `inline-flex items-center justify-center w-fit min-w-max h-[40px] px-[18px] gap-[8px] rounded-[10px] box-border whitespace-nowrap shrink-0 text-[14px] font-semibold leading-none bg-[#AB9570] hover:bg-[#927D5E] active:bg-[#836F52] text-[#121214] shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  if (to) {
    return (
      <Link id={id} to={to} className={buttonClasses}>
        {renderIcon()}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {renderIcon()}
      <span>{label}</span>
    </button>
  );
};

export default PrimaryActionButton;
