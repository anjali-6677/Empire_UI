import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Plus, X } from 'lucide-react';

export interface MultiSelectOption {
  id: string;
  label: string;
  badge?: string;
}

export interface CreatableMultiSelectProps<T = MultiSelectOption> {
  label?: string;
  value: string[];
  options: T[];
  getOptionId?: (option: T) => string;
  getOptionLabel?: (option: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  createLabel?: (query: string) => string;
  canCreate?: boolean;
  onChange: (ids: string[]) => void;
  onCreate?: (query: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export function CreatableMultiSelect<T = MultiSelectOption>({
  label,
  value = [],
  options,
  getOptionId = (opt: any) => opt.id,
  getOptionLabel = (opt: any) => opt.label || opt.name,
  searchPlaceholder = 'Search options...',
  emptyMessage = 'No matching options found.',
  createLabel = (query) => `Create "${query}"`,
  canCreate = true,
  onChange,
  onCreate,
  disabled = false,
  error,
  helperText,
  required = false,
  className = '',
}: CreatableMultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selectedOptions = options.filter((opt) => value.includes(getOptionId(opt)));

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOptions = options.filter((opt) =>
    getOptionLabel(opt).toLowerCase().includes(normalizedQuery)
  );

  const exactDuplicate = options.find(
    (opt) => getOptionLabel(opt).trim().toLowerCase() === normalizedQuery
  );

  const showCreateOption = canCreate && normalizedQuery.length > 0 && !exactDuplicate && onCreate;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const handleRemoveChip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((item) => item !== id));
  };

  const handleCreate = () => {
    if (onCreate && searchQuery.trim()) {
      onCreate(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#172033] mb-1">
          {label} {required && <span className="text-[#B35E62]">*</span>}
        </label>
      )}

      <div
        className={`relative flex flex-wrap items-center gap-1.5 p-1.5 min-h-[38px] bg-white border ${
          error
            ? 'border-[#B35E62] focus-within:ring-2 focus-within:ring-[#F8E9EA]'
            : isOpen
            ? 'border-[#7186A2] ring-2 ring-[#7186A2]/20'
            : 'border-[#D9DEE7] hover:border-[#9E865A]'
        } rounded-[6px] transition-all duration-150 shadow-xs cursor-text`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 10);
          }
        }}
      >
        {selectedOptions.map((opt) => {
          const id = getOptionId(opt);
          const labelText = getOptionLabel(opt);
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F1ECE2] text-[#172033] border border-[#BCA174]/40 rounded-full text-xs font-semibold"
            >
              <span>{labelText}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveChip(id, e)}
                  className="p-0.5 hover:bg-[#BCA174]/20 rounded-full text-[#6E7889] hover:text-[#172033]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          );
        })}

        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[120px] py-1 px-1 text-xs text-[#172033] bg-transparent border-none outline-none focus:ring-0 placeholder-[#6E7889]"
          placeholder={selectedOptions.length === 0 ? searchPlaceholder : ''}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />

        <ChevronDown className={`w-4 h-4 text-[#6E7889] mr-1 ml-auto shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {error && <p className="mt-1 text-xs text-[#B35E62] font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-[#6E7889]">{helperText}</p>}

      {isOpen && (
        <div
          id={listId}
          className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-[#D9DEE7] rounded-[6px] shadow-lg py-1 divide-y divide-[#F1F3F6]"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const id = getOptionId(opt);
              const labelText = getOptionLabel(opt);
              const isSelected = value.includes(id);

              return (
                <div
                  key={id}
                  className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors hover:bg-[#F6F7F9] ${
                    isSelected ? 'font-semibold bg-[#F1ECE2]/50 text-[#172033]' : 'text-[#263247]'
                  }`}
                  onClick={() => handleToggleOption(id)}
                >
                  <span>{labelText}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#B39A6A] ml-2 shrink-0" />}
                </div>
              );
            })
          ) : !showCreateOption ? (
            <div className="px-3 py-3 text-xs text-[#6E7889] text-center">{emptyMessage}</div>
          ) : null}

          {showCreateOption && (
            <div
              className="px-3 py-2 text-xs font-semibold text-[#B39A6A] hover:bg-[#F1ECE2] cursor-pointer flex items-center gap-2 transition-colors"
              onClick={handleCreate}
            >
              <Plus className="w-4 h-4 text-[#B39A6A]" />
              <span>{createLabel(searchQuery)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default CreatableMultiSelect;
