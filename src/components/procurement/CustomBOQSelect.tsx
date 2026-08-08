import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Search, ArrowRight } from 'lucide-react';
import { ProjectBOQLine } from '../../domain/types';
import { formatIndianCurrency } from '../../utils/format';

export interface BOQAvailabilityInfo {
  acceptedBOQQty: number;
  previouslyIndentedQty: number;
  availableBOQQty: number;
  isOverLimit: boolean;
  unitSymbol: string;
}

interface CustomBOQSelectProps {
  boqLines: ProjectBOQLine[];
  selectedBoqLineId: string;
  onSelect: (boqLineId: string) => void;
  getAvailability: (boqLineId: string) => BOQAvailabilityInfo;
  disabled?: boolean;
  alreadySelectedIds?: string[];
  onGoToExistingLine?: (boqLineId: string) => void;
}

export const CustomBOQSelect: React.FC<CustomBOQSelectProps> = ({
  boqLines,
  selectedBoqLineId,
  onSelect,
  getAvailability,
  disabled = false,
  alreadySelectedIds = [],
  onGoToExistingLine,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number }>({
    left: 0,
    width: 380,
  });

  const selectedLine = boqLines.find((b) => b.id === selectedBoqLineId);

  const filteredLines = boqLines.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.itemDescription.toLowerCase().includes(term) ||
      (b.categoryName && b.categoryName.toLowerCase().includes(term)) ||
      (b.estimateLineId && b.estimateLineId.toLowerCase().includes(term)) ||
      String(b.lineNo).includes(term)
    );
  });

  // Calculate popover positioning relative to viewport
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 320;
    const flipUp = spaceBelow < popoverHeight && rect.top > popoverHeight;

    if (flipUp) {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        left: rect.left,
        width: Math.max(rect.width, 380),
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 380),
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
      className="bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          placeholder="Search BOQ line #, description, category..."
          className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
        />
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {boqLines.length === 0 ? (
          <div className="p-4 text-center text-slate-500 italic">Project BOQ is not available.</div>
        ) : filteredLines.length === 0 ? (
          <div className="p-4 text-center text-slate-500 italic">No matching BOQ items found.</div>
        ) : (
          filteredLines.map((line) => {
            const avail = getAvailability(line.id);
            const isSelected = line.id === selectedBoqLineId;
            const isAlreadyAdded = alreadySelectedIds.includes(line.id) && !isSelected;

            return (
              <div
                key={line.id}
                className={`p-3.5 transition-colors space-y-1.5 ${
                  isSelected
                    ? 'bg-[#AB9570]/15 border-l-4 border-l-[#AB9570]'
                    : isAlreadyAdded
                    ? 'bg-amber-50/50 opacity-80'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                    Line #{line.lineNo}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                    {line.categoryName || 'General Fitout'}
                  </span>
                </div>

                <div className="font-extrabold text-slate-900 text-xs leading-snug">{line.itemDescription}</div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-400 block font-sans text-[9px]">Accepted</span>
                    <strong className="text-slate-800">{line.boqQuantity} {line.unitSymbol}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans text-[9px]">Indented</span>
                    <strong className="text-slate-800">{avail.previouslyIndentedQty} {line.unitSymbol}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans text-[9px]">Available</span>
                    <strong className={avail.availableBOQQty <= 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                      {avail.availableBOQQty} {line.unitSymbol}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                  <span className="text-slate-500 font-sans">Baseline Rate:</span>
                  <span className="font-bold text-slate-900">{formatIndianCurrency(line.boqRate)} / {line.unitSymbol}</span>
                </div>

                {isAlreadyAdded ? (
                  <div className="p-2 bg-amber-100/70 border border-amber-200 rounded-lg flex items-center justify-between text-[10.5px] text-amber-900 mt-1">
                    <span className="font-bold">This BOQ item is already included in this Indent.</span>
                    {onGoToExistingLine && (
                      <button
                        type="button"
                        onClick={() => {
                          onGoToExistingLine(line.id);
                          setIsOpen(false);
                        }}
                        className="font-bold underline text-amber-950 flex items-center gap-1 hover:text-black"
                      >
                        Go to Existing Line <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(line.id);
                      setIsOpen(false);
                    }}
                    className="w-full mt-1 py-1.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-lg text-xs transition cursor-pointer"
                  >
                    Select Line Item
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="relative font-sans text-xs">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || boqLines.length === 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full text-left bg-white border rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs transition-all ${
          isOpen ? 'border-[#AB9570] ring-2 ring-[#AB9570]/20' : 'border-slate-300 hover:border-slate-400'
        } ${disabled || boqLines.length === 0 ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {selectedLine ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono">
                Line #{selectedLine.lineNo}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 truncate">
                {selectedLine.categoryName || 'Material Cost'}
              </span>
            </div>
            <div className="font-extrabold text-slate-900 truncate text-xs">{selectedLine.itemDescription}</div>
          </div>
        ) : (
          <span className="text-slate-400 font-medium">Select a Project BOQ item...</span>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#AB9570]' : ''}`} />
      </button>

      {isOpen && ReactDOM.createPortal(portalContent, document.body)}
    </div>
  );
};
