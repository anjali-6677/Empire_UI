import React, { useState, useRef, useEffect, useId } from 'react';
import { Search, ChevronDown, Check, Plus, X } from 'lucide-react';

export interface CreatableComboboxOption {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export interface CreatableComboboxProps<T = CreatableComboboxOption> {
  label?: string;
  value?: string;
  options: T[];
  getOptionId?: (option: T) => string;
  getOptionLabel?: (option: T) => string;
  getOptionDescription?: (option: T) => string;
  getOptionBadge?: (option: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  createLabel?: (query: string) => string;
  requestLabel?: (query: string) => string;
  canCreate?: boolean;
  onChange: (id: string) => void;
  onCreate?: (query: string) => void;
  onRequest?: (query: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export function CreatableCombobox<T = CreatableComboboxOption>({
  label,
  value,
  options,
  getOptionId = (opt: any) => opt.id,
  getOptionLabel = (opt: any) => opt.label || opt.name,
  getOptionDescription = (opt: any) => opt.description,
  getOptionBadge = (opt: any) => opt.badge,
  searchPlaceholder = 'Search option...',
  emptyMessage = 'No matching options found.',
  createLabel = (query) => `Create "${query}"`,
  requestLabel = (query) => `Request new option "${query}"`,
  canCreate = true,
  onChange,
  onCreate,
  onRequest,
  disabled = false,
  error,
  helperText,
  required = false,
  className = '',
}: CreatableComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedOption = options.find((opt) => getOptionId(opt) === value);
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : '';

  // Normalize search query
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter options based on query
  const filteredOptions = options.filter((opt) => {
    const l = getOptionLabel(opt).toLowerCase();
    const d = (getOptionDescription(opt) || '').toLowerCase();
    return l.includes(normalizedQuery) || d.includes(normalizedQuery);
  });

  const exactDuplicate = options.find(
    (opt) => getOptionLabel(opt).trim().toLowerCase() === normalizedQuery
  );

  const showCreateOption = canCreate && normalizedQuery.length > 0 && !exactDuplicate && onCreate;
  const showRequestOption = !canCreate && normalizedQuery.length > 0 && !exactDuplicate;

  const actionOptionIndex = filteredOptions.length;
  const totalNavItems = filteredOptions.length + (showCreateOption || showRequestOption ? 1 : 0);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % Math.max(totalNavItems, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + totalNavItems) % Math.max(totalNavItems, 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (showCreateOption && highlightedIndex === actionOptionIndex) {
          handleCreate();
        } else if (showRequestOption && highlightedIndex === actionOptionIndex) {
          handleRequest();
        } else if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        triggerRef.current?.focus();
        break;
    }
  };

  const handleSelect = (option: T) => {
    const id = getOptionId(option);
    onChange(id);
    setIsOpen(false);
    setSearchQuery('');
    triggerRef.current?.focus();
  };

  const handleCreate = () => {
    if (onCreate && searchQuery.trim()) {
      onCreate(searchQuery.trim());
      setIsOpen(false);
      setSearchQuery('');
      triggerRef.current?.focus();
    }
  };

  const handleRequest = () => {
    if (onRequest && searchQuery.trim()) {
      onRequest(searchQuery.trim());
    } else {
      alert(`Request sent for adding new option "${searchQuery.trim()}"`);
    }
    setIsOpen(false);
    setSearchQuery('');
    triggerRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#172033] mb-1">
          {label} {required && <span className="text-[#B35E62]">*</span>}
        </label>
      )}

      <div
        ref={triggerRef}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-autocomplete="list"
        className={`relative flex items-center bg-white border ${
          error
            ? 'border-[#B35E62] focus-within:ring-2 focus-within:ring-[#F8E9EA]'
            : isOpen
            ? 'border-[#7186A2] ring-2 ring-[#7186A2]/20'
            : 'border-[#D9DEE7] hover:border-[#9E865A]'
        } rounded-[6px] h-[38px] transition-all duration-150 shadow-xs cursor-text focus:outline-none focus:ring-2 focus:ring-[#7186A2]/30`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 10);
          }
        }}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <Search className="w-4 h-4 text-[#6E7889] ml-3 shrink-0" />

        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            className="w-full py-1.5 px-2 text-xs text-[#172033] bg-transparent border-none outline-none focus:ring-0 placeholder-[#6E7889]"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoFocus
          />
        ) : (
          <div className="w-full py-1.5 px-2 text-xs truncate text-[#172033]">
            {selectedLabel ? (
              <span className="font-semibold text-[#172033]">{selectedLabel}</span>
            ) : (
              <span className="text-[#6E7889]">{searchPlaceholder}</span>
            )}
          </div>
        )}

        {value && !isOpen && !disabled && (
          <button
            type="button"
            className="p-1 mr-1 text-[#6E7889] hover:text-[#172033] rounded-full hover:bg-[#F1F3F6]"
            onClick={handleClear}
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <ChevronDown className={`w-4 h-4 text-[#6E7889] mr-3 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {error && <p className="mt-1 text-xs text-[#B35E62] font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-[#6E7889]">{helperText}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-[#D9DEE7] rounded-[6px] shadow-lg py-1 divide-y divide-[#F1F3F6]"
        >
          {exactDuplicate && (
            <div className="px-3 py-1.5 text-[11px] bg-[#FFF8E6] text-[#8C6D23] font-medium flex items-center justify-between">
              <span>This option already exists.</span>
              <button
                type="button"
                onClick={() => handleSelect(exactDuplicate)}
                className="underline hover:text-[#59420F]"
              >
                Use Existing
              </button>
            </div>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const id = getOptionId(opt);
              const labelText = getOptionLabel(opt);
              const desc = getOptionDescription(opt);
              const badge = getOptionBadge(opt);
              const isSelected = id === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={id}
                  role="option"
                  aria-selected={isSelected}
                  className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    isHighlighted ? 'bg-[#F1ECE2] text-[#172033]' : 'hover:bg-[#F6F7F9] text-[#263247]'
                  } ${isSelected ? 'font-semibold bg-[#F1ECE2]/50' : ''}`}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <div className="flex flex-col truncate">
                    <span className="truncate flex items-center gap-2">
                      {labelText}
                      {badge && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#F1F3F6] text-[#6E7889]">
                          {badge}
                        </span>
                      )}
                    </span>
                    {desc && <span className="text-[11px] text-[#6E7889] truncate">{desc}</span>}
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#B39A6A] ml-2 shrink-0" />}
                </div>
              );
            })
          ) : !showCreateOption && !showRequestOption ? (
            <div className="px-3 py-3 text-xs text-[#6E7889] text-center">{emptyMessage}</div>
          ) : null}

          {showCreateOption && (
            <div
              role="option"
              aria-selected={highlightedIndex === actionOptionIndex}
              className={`px-3 py-2 text-xs font-semibold text-[#B39A6A] hover:bg-[#F1ECE2] cursor-pointer flex items-center gap-2 transition-colors ${
                highlightedIndex === actionOptionIndex ? 'bg-[#F1ECE2]' : ''
              }`}
              onClick={handleCreate}
              onMouseEnter={() => setHighlightedIndex(actionOptionIndex)}
            >
              <Plus className="w-4 h-4 text-[#B39A6A]" />
              <span>{createLabel(searchQuery)}</span>
            </div>
          )}

          {showRequestOption && (
            <div
              role="option"
              aria-selected={highlightedIndex === actionOptionIndex}
              className={`px-3 py-2 text-xs font-semibold text-[#6E7889] hover:bg-[#F1F3F6] cursor-pointer flex items-center gap-2 transition-colors ${
                highlightedIndex === actionOptionIndex ? 'bg-[#F1F3F6]' : ''
              }`}
              onClick={handleRequest}
              onMouseEnter={() => setHighlightedIndex(actionOptionIndex)}
            >
              <Plus className="w-4 h-4 text-[#6E7889]" />
              <span>{requestLabel(searchQuery)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
