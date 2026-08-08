import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}

export interface ControlledSelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const ControlledSelect: React.FC<ControlledSelectProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  error,
  helperText,
  required = false,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#172033] mb-1">
          {label} {required && <span className="text-[#B35E62]">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full h-[38px] px-3 py-1.5 text-xs text-[#172033] bg-white border ${
            error
              ? 'border-[#B35E62] focus:ring-2 focus:ring-[#F8E9EA]'
              : 'border-[#D9DEE7] focus:border-[#7186A2] focus:ring-2 focus:ring-[#7186A2]/20'
          } rounded-[6px] appearance-none font-semibold outline-none transition-all duration-150 disabled:bg-[#F6F7F9] disabled:cursor-not-allowed`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-[#6E7889] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-xs text-[#B35E62] font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-[#6E7889]">{helperText}</p>}
    </div>
  );
};
export default ControlledSelect;
