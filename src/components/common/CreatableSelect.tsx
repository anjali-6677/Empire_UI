import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChevronDown, Plus, Check, Search, X } from 'lucide-react';

export interface CreatableSelectProps {
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
  onCreate: (newOption: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  value,
  options = [],
  placeholder = 'Select or type to create...',
  onChange,
  onCreate,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedSearch = search.trim();

  // Filter existing options case-insensitively
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase().trim())
  );

  // Check if search matches any existing option exactly (case-insensitive)
  const exactMatchExists = options.some(
    (opt) => opt.toLowerCase().trim() === trimmedSearch.toLowerCase()
  );

  const showCreateOption = trimmedSearch.length > 0 && !exactMatchExists;

  // Total items in dropdown list: filteredOptions + (showCreateOption ? 1 : 0)
  const totalItems = filteredOptions.length + (showCreateOption ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectOption = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  };

  const handleCreateOption = () => {
    if (!trimmedSearch) return;
    const existing = options.find(
      (opt) => opt.toLowerCase().trim() === trimmedSearch.toLowerCase()
    );
    if (existing) {
      handleSelectOption(existing);
    } else {
      onCreate(trimmedSearch);
      onChange(trimmedSearch);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex < filteredOptions.length) {
        handleSelectOption(filteredOptions[highlightedIndex]);
      } else if (showCreateOption) {
        handleCreateOption();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full text-xs ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white border rounded-xl text-left font-medium transition-all ${
          isOpen
            ? 'border-[#AB9570] ring-2 ring-[#AB9570]/20 shadow-sm'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
      >
        <span className={value ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#AB9570]' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden py-1">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search or type to create new..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#AB9570]"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto scrollbar-thin py-1">
            {filteredOptions.map((opt, idx) => {
              const isSelected = opt === value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <div
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer font-medium transition-colors ${
                    isHighlighted
                      ? 'bg-[#EFE9DE] text-slate-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#AB9570]" />}
                </div>
              );
            })}

            {showCreateOption && (
              <div
                onClick={handleCreateOption}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer font-bold border-t border-slate-100 ${
                  highlightedIndex === filteredOptions.length
                    ? 'bg-[#AB9570] text-slate-950'
                    : 'bg-amber-50 text-slate-900 hover:bg-[#EFE9DE]'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create "{trimmedSearch}"</span>
              </div>
            )}

            {filteredOptions.length === 0 && !showCreateOption && (
              <div className="px-3 py-4 text-center text-slate-400 italic">
                No matching options found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
