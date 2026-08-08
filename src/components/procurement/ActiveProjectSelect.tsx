import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Search, Lock, AlertTriangle, Building, MapPin } from 'lucide-react';
import { Project } from '../../domain/types';

interface ActiveProjectSelectProps {
  projects: Project[];
  selectedProjectId: string;
  onSelect: (projectId: string) => void;
  disabled?: boolean;
}

export const ActiveProjectSelect: React.FC<ActiveProjectSelectProps> = ({
  projects,
  selectedProjectId,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 420,
  });

  // Filter ONLY projects satisfying ALL 5 strict criteria:
  const eligibleProjects = projects.filter((p) => {
    const statusLower = (p.projectStatus || p.status || '').toLowerCase();
    const isActive = statusLower === 'active';
    const isTeamLocked = Boolean(p.projectTeamLocked || p.isTeamLocked);
    const isBOQLocked = Boolean(p.projectBOQLocked || p.isBOQLocked);
    const isNotLegacySite = !p.projectCode?.startsWith('SITE-');
    const hasBOQItems = Boolean(p.lockedProjectBOQ?.lines?.length || p.acceptedBOQSnapshot?.length);
    const hasSchedule = Boolean(p.scheduleConfigured || p.scheduleActivities?.length || p.acceptedScheduleSnapshot?.length);

    return isActive && isTeamLocked && isBOQLocked && isNotLegacySite && hasBOQItems && hasSchedule;
  });

  const selectedProject = eligibleProjects.find((p) => p.id === selectedProjectId) || eligibleProjects[0];

  const filteredProjects = eligibleProjects.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.projectCode.toLowerCase().includes(term) ||
      p.projectName.toLowerCase().includes(term) ||
      (p.clientName && p.clientName.toLowerCase().includes(term)) ||
      (p.city && p.city.toLowerCase().includes(term)) ||
      (p.siteAddress && p.siteAddress.toLowerCase().includes(term))
    );
  });

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 360;
    const flipUp = spaceBelow < popoverHeight && rect.top > popoverHeight;

    setCoords({
      top: flipUp ? rect.top - popoverHeight - 6 : rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 440),
    });
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
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        zIndex: 99999,
      }}
      className="bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Code, Project Name, Client, Location..."
          className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
        />
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {eligibleProjects.length === 0 ? (
          <div className="p-5 text-center space-y-2">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto" />
            <div className="font-bold text-slate-800 text-xs">No Projects ready for Material Indent</div>
            <p className="text-slate-500 text-[11px]">
              Projects must be Active, Team Locked, BOQ Baseline Locked, and Schedule Configured.
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-4 text-center text-slate-500 italic">No matching active projects found.</div>
        ) : (
          filteredProjects.map((p) => {
            const isSelected = selectedProject && p.id === selectedProject.id;
            const boqCount = p.lockedProjectBOQ?.lines?.length || p.acceptedBOQSnapshot?.length || 0;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onSelect(p.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-3.5 transition-colors space-y-1.5 ${
                  isSelected ? 'bg-[#AB9570]/15 border-l-4 border-l-[#AB9570]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 text-xs">{p.projectCode}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Active & Locked
                  </span>
                </div>

                <div className="font-extrabold text-slate-900 text-xs">{p.projectName}</div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1 truncate">
                    <Building className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">Client: {p.clientName}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">Location: {p.city || p.siteAddress || 'Mumbai'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                  <span>BOQ: <strong>{boqCount} Items</strong></span>
                  <span>Stage: <strong className="text-slate-900">Procurement</strong></span>
                </div>
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
        ref={buttonRef}
        type="button"
        disabled={disabled || eligibleProjects.length === 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full text-left bg-white border rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs transition-all ${
          isOpen ? 'border-[#AB9570] ring-2 ring-[#AB9570]/20' : 'border-slate-300 hover:border-slate-400'
        } ${disabled || eligibleProjects.length === 0 ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {selectedProject ? (
          <span className="font-extrabold text-slate-900 text-xs truncate">
            {selectedProject.projectCode} · {selectedProject.projectName}
          </span>
        ) : (
          <span className="text-slate-400 font-medium">Select Active Project...</span>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#AB9570]' : ''}`} />
      </button>

      {isOpen && ReactDOM.createPortal(portalContent, document.body)}
    </div>
  );
};
