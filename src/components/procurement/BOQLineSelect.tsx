import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, ChevronDown, AlertCircle } from 'lucide-react';
import { NormalizedBOQLine } from '../../utils/boqHelper';
import { formatIndianCurrency } from '../../utils/format';

interface BOQLineSelectProps {
  boqLines: NormalizedBOQLine[];
  selectedLineId: string;
  onSelect: (line: NormalizedBOQLine) => void;
  disabled?: boolean;
  placeholder?: string;
  getAvailability: (lineId: string) => { boqQuantity: number; alreadySubcontractedQty: number; availableQty: number };
}

export const BOQLineSelect: React.FC<BOQLineSelectProps> = ({
  boqLines,
  selectedLineId,
  onSelect,
  disabled = false,
  placeholder = 'Select Project BOQ Line...',
  getAvailability,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const selectedLine = boqLines.find((l) => l.id === selectedLineId);

  const filteredLines = boqLines.filter((l) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.itemDescription.toLowerCase().includes(term) ||
      l.itemCode?.toLowerCase().includes(term) ||
      l.categoryName.toLowerCase().includes(term) ||
      String(l.lineNo).includes(term)
    );
  });

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 320;
    const flipUp = spaceBelow < popoverHeight && rect.top > popoverHeight;

    setCoords({
      top: flipUp ? rect.top - popoverHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 380),
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    } else {
      setCoords(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => updatePosition();
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) return;
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

  const portalContent = isOpen && coords && (
    <div
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        zIndex: 99999,
      }}
      className="bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden font-sans text-xs"
    >
      <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by line #, description, category..."
          className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {boqLines.length === 0 ? (
          <div className="p-4 text-center text-slate-500 italic text-xs flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            No BOQ lines available under this category.
          </div>
        ) : filteredLines.length === 0 ? (
          <div className="p-3 text-center text-slate-500 italic text-xs">No matching BOQ lines found.</div>
        ) : (
          filteredLines.map((line) => {
            const isSelected = selectedLine && line.id === selectedLine.id;
            const avail = getAvailability(line.id);

            return (
              <button
                key={line.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(line);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2.5 transition-colors space-y-1 cursor-pointer ${
                  isSelected ? 'bg-amber-50/80 border-l-4 border-l-[#AB9570]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between font-medium text-slate-900">
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    LINE #{line.lineNo} {line.itemCode ? `(${line.itemCode})` : ''}
                  </span>
                  <span className="text-[10px] text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded font-semibold">
                    {line.categoryName}
                  </span>
                </div>

                <div className="font-medium text-slate-900 text-xs line-clamp-2">{line.itemDescription}</div>

                <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                  <div>
                    BOQ Qty: <strong className="text-slate-800">{avail.boqQuantity} {line.unitSymbol}</strong>
                  </div>
                  <div>
                    Subcontracted: <strong className="text-slate-800">{avail.alreadySubcontractedQty} {line.unitSymbol}</strong>
                  </div>
                  <div>
                    Available: <strong className={avail.availableQty > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                      {avail.availableQty} {line.unitSymbol}
                    </strong>
                  </div>
                  <div className="text-right">
                    Rate: <strong className="text-slate-900">{formatIndianCurrency(line.boqRate)}</strong>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="relative font-sans text-xs w-full">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full text-left bg-white border rounded p-1.5 flex items-center justify-between gap-2 transition-all ${
          isOpen ? 'border-[#AB9570] ring-1 ring-[#AB9570]' : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {selectedLine ? (
          <span className="font-semibold text-slate-900 text-xs truncate">
            LINE #{selectedLine.lineNo} · {selectedLine.itemDescription}
          </span>
        ) : (
          <span className="text-slate-400 font-normal">{placeholder}</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#AB9570]' : ''}`} />
      </button>

      {isOpen && ReactDOM.createPortal(portalContent, document.body)}
    </div>
  );
};
