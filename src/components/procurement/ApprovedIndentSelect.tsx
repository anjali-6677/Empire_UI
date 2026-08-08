import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Search, ChevronDown, PackageCheck, AlertCircle, Check } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/format';

interface ApprovedIndentSelectProps {
  indents: any[];
  projects: any[];
  selectedIndentId: string;
  onSelectIndent: (indent: any) => void;
  disabled?: boolean;
}

export const ApprovedIndentSelect: React.FC<ApprovedIndentSelectProps> = ({
  indents,
  projects,
  selectedIndentId,
  onSelectIndent,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 300 });

  // Filter eligible indents: status === 'approved', not cancelled, remaining quantities > 0, valid project
  const eligibleIndents = indents.filter((ind) => {
    const isApproved = ind.status === 'approved' || ind.status === 'Approved';
    const isNotCancelled = ind.status !== 'cancelled' && ind.status !== 'Cancelled';

    // Calculate remaining quantity sum across items
    const remainingQtySum = (ind.items || []).reduce((sum: number, item: any) => {
      const approvedQty = item.approvedQty || item.quantity || 0;
      const convertedQty = item.convertedQty || item.orderedQty || 0;
      return sum + Math.max(0, approvedQty - convertedQty);
    }, 0);

    const isNotFullyConverted = ind.status !== 'converted_to_po' && ind.status !== 'Converted to PO' && (remainingQtySum > 0 || (ind.items || []).length === 0);
    const hasProject = projects.some((p) => p.id === ind.projectId);

    return isApproved && isNotCancelled && isNotFullyConverted && hasProject;
  });

  const selectedIndent = indents.find((i) => i.id === selectedIndentId);
  const selectedProject = selectedIndent ? projects.find((p) => p.id === selectedIndent.projectId) : null;

  // Filter options by search
  const filteredIndents = eligibleIndents.filter((ind) => {
    const proj = projects.find((p) => p.id === ind.projectId);
    const query = search.toLowerCase();
    const indNum = (ind.indentNumber || '').toLowerCase();
    const projName = (proj?.projectName || '').toLowerCase();
    const clientName = (proj?.clientName || '').toLowerCase();
    const category = (ind.category || ind.materialCategory || '').toLowerCase();
    const items = (ind.items || []).map((i: any) => (i.materialName || i.itemDescription || '').toLowerCase()).join(' ');

    return (
      indNum.includes(query) ||
      projName.includes(query) ||
      clientName.includes(query) ||
      category.includes(query) ||
      items.includes(query)
    );
  });

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 420),
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <PackageCheck className="h-4 w-4 text-[#AB9570]" /> Select Approved Material Indent <span className="text-rose-500">*</span>
      </label>

      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full text-left px-4 py-3 bg-white border rounded-xl shadow-xs transition-all flex items-center justify-between text-xs ${
          isOpen ? 'border-[#AB9570] ring-2 ring-[#AB9570]/20' : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
      >
        {selectedIndent ? (
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {selectedIndent.indentNumber}
            </span>
            <div>
              <span className="font-bold text-slate-900">{selectedProject?.projectName || selectedIndent.projectName || 'Project'}</span>
              <span className="ml-2 text-slate-500 font-medium">({(selectedIndent.items || []).length} items • ₹{formatIndianCurrency(selectedIndent.estimatedTotalValue || selectedIndent.approvedValue || 0)})</span>
            </div>
          </div>
        ) : (
          <span className="text-slate-400 font-medium">-- Search & Select Approved Material Indent --</span>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#AB9570]' : ''}`} />
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[360px] animate-in fade-in zoom-in-95 duration-100 text-xs"
          >
            {/* Search Input */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search Indent No, Project, Client, Material..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-hidden"
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {filteredIndents.length === 0 ? (
                <div className="p-6 text-center text-slate-500 space-y-1">
                  <AlertCircle className="h-6 w-6 text-slate-300 mx-auto" />
                  <div className="font-semibold text-slate-700">No matching approved indents found</div>
                  <p className="text-[11px] text-slate-400">Ensure an indent exists in Approved status with remaining quantities.</p>
                </div>
              ) : (
                filteredIndents.map((ind) => {
                  const proj = projects.find((p) => p.id === ind.projectId);
                  const isSelected = ind.id === selectedIndentId;
                  const totalVal = ind.estimatedTotalValue || ind.approvedValue || 0;

                  return (
                    <div
                      key={ind.id}
                      onClick={() => {
                        onSelectIndent(ind);
                        setIsOpen(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                        isSelected ? 'bg-amber-50/60 border-l-4 border-[#AB9570]' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                            {ind.indentNumber}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{proj?.projectName || ind.projectName}</span>
                        </div>
                        <div className="text-slate-500 font-medium text-[11px]">
                          Client: <span className="text-slate-800 font-semibold">{proj?.clientName || ind.clientName || 'N/A'}</span> • Category: <span className="text-slate-800 font-semibold">{ind.category || ind.materialCategory || 'General'}</span>
                        </div>
                        <div className="text-slate-500 font-medium text-[11px]">
                          Items: <span className="text-slate-800 font-bold">{(ind.items || []).length}</span> • Value: <span className="text-emerald-700 font-bold">₹{formatIndianCurrency(totalVal)}</span> • Required By: <span className="text-slate-700 font-mono">{ind.requiredByDate || 'ASAP'}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-[#AB9570] shrink-0 mt-1" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
