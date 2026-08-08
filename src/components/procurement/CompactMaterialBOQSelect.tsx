import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Search, Check, Package } from 'lucide-react';
import { ProjectBOQLine } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';

export interface BOQAvailabilityInfo {
  acceptedBOQQty: number;
  previouslyIndentedQty: number;
  availableBOQQty: number;
  isOverLimit: boolean;
  unitSymbol: string;
}

interface CompactMaterialBOQSelectProps {
  boqLines: ProjectBOQLine[];
  selectedCategory: string;
  selectedBoqLineId: string;
  onSelect: (boqLine: ProjectBOQLine | null) => void;
  getAvailability: (boqLineId: string) => BOQAvailabilityInfo;
  disabled?: boolean;
  alreadySelectedIds?: string[];
}

export const CompactMaterialBOQSelect: React.FC<CompactMaterialBOQSelectProps> = ({
  boqLines,
  selectedCategory,
  selectedBoqLineId,
  onSelect,
  getAvailability,
  disabled = false,
  alreadySelectedIds = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number }>({
    left: 0,
    width: 380,
  });

  const selectedLine = boqLines.find((b) => b.id === selectedBoqLineId);

  // Filter lines by Category (if selected and not 'all') and Search Term
  const availableCategoryLines = boqLines.filter((b) => {
    if (!selectedCategory || selectedCategory === 'all') return true;
    const catName = (b.categoryName || '').toLowerCase();
    const catId = (b.categoryId || '').toLowerCase();
    const target = selectedCategory.toLowerCase();
    return catName === target || catId === target || catName.includes(target);
  });

  const filteredLines = availableCategoryLines.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.itemDescription.toLowerCase().includes(term) ||
      (b.categoryName && b.categoryName.toLowerCase().includes(term)) ||
      (b.estimateLineId && b.estimateLineId.toLowerCase().includes(term)) ||
      String(b.lineNo).includes(term)
    );
  });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 280;
    const flipUp = spaceBelow < popoverHeight && rect.top > popoverHeight;

    if (flipUp) {
      setCoords({
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: Math.max(rect.width, 360),
      });
    } else {
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 360),
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => updatePosition();
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const portalContent = isOpen && (
    <div
      style={{
        position: 'fixed',
        top: coords.top !== undefined ? `${coords.top}px` : undefined,
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        zIndex: 99999,
      }}
      className="bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search BOQ material description..."
          className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
        />
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
        {boqLines.length === 0 ? (
          <div className="p-3 text-center text-slate-500 italic text-[11px]">
            No BOQ items available for selected Project.
          </div>
        ) : filteredLines.length === 0 ? (
          <div className="p-3 text-center text-slate-500 italic text-[11px]">
            No materials found matching search term.
          </div>
        ) : (
          filteredLines.map((line) => {
            const avail = getAvailability(line.id);
            const isSelected = line.id === selectedBoqLineId;
            const isAlreadyAdded = alreadySelectedIds.includes(line.id) && !isSelected;

            return (
              <button
                key={line.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!isAlreadyAdded) {
                    onSelect(line);
                    setIsOpen(false);
                  }
                }}
                className={`w-full text-left p-2.5 transition-colors space-y-1 ${
                  isSelected
                    ? 'bg-[#AB9570]/15 border-l-4 border-l-[#AB9570]'
                    : isAlreadyAdded
                    ? 'bg-slate-50 opacity-60 cursor-not-allowed'
                    : 'hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs truncate">
                    {line.itemDescription}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#AB9570] shrink-0" />}
                </div>

                <div className="text-[10.5px] text-slate-500 font-medium truncate">
                  {line.categoryName || 'General Fitout'}
                </div>

                <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-600 pt-0.5">
                  <span>
                    Available: <strong className={avail.availableBOQQty <= 0 ? 'text-rose-600' : 'text-emerald-700'}>
                      {avail.availableBOQQty} {line.unitSymbol}
                    </strong>
                  </span>
                  <span className="text-slate-500">
                    {formatIndianCurrency(line.boqRate)} / {line.unitSymbol}
                  </span>
                </div>

                {isAlreadyAdded && (
                  <div className="text-[10px] text-amber-700 font-bold">
                    Already added to indent
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="relative font-sans text-xs">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || boqLines.length === 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full text-left bg-white border rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-xs transition-all ${
          isOpen ? 'border-[#AB9570] ring-2 ring-[#AB9570]/20' : 'border-slate-300 hover:border-slate-400'
        } ${disabled || boqLines.length === 0 ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {selectedLine ? (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 truncate text-xs">{selectedLine.itemDescription}</div>
            <div className="text-[10px] text-slate-500 truncate">
              {selectedLine.categoryName || 'General'} · {selectedLine.unitSymbol} · Available: {getAvailability(selectedLine.id).availableBOQQty}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 font-medium truncate">
            <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Select Material...</span>
          </div>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#AB9570]' : ''}`} />
      </button>

      {isOpen && ReactDOM.createPortal(portalContent, document.body)}
    </div>
  );
};
