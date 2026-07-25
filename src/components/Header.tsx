import * as React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronsUpDown, 
  Briefcase, 
  Check, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  AlignLeft,
  X 
} from 'lucide-react';
import { cn } from '../utils/cn';
import { NAVIGATION_CONFIG } from '../config/navigation';
import { mockApprovals } from '../data/mockData';
import { formatIndianCurrency } from '../utils/format';
import { useSites } from '../context/SitesContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

// ==========================================
// 1. Project Switcher Subcomponent (Portal Stacked)
// ==========================================

export const ProjectSwitcher: React.FC = () => {
  const { sites, selectedSiteId, setSelectedSiteId } = useSites();
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 240 });

  const activeSite = selectedSiteId === 'all' ? null : (sites.find((s) => s.id === selectedSiteId) || null);

  const updatePosition = React.useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = Math.max(rect.width, 280);
      const left = Math.min(rect.left, window.innerWidth - dropdownWidth - 12);
      setPosition({
        top: rect.bottom + 6,
        left: Math.max(12, left),
        width: dropdownWidth
      });
    }
  }, []);

  const handleOpenToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  React.useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updatePosition]);

  return (
    <div className="relative font-sans text-xs shrink-0">
      <button
        ref={triggerRef}
        onClick={handleOpenToggle}
        className="flex items-center gap-1.5 px-2 py-1.5 border border-gray-200 rounded bg-white hover:bg-gray-50 transition-all select-none text-left w-[180px] sm:w-[240px] max-w-[calc(100vw-60px)] justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500/50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="truncate pr-1">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-bold truncate">
            Active Site
          </span>
          <span className="font-semibold text-gray-700 truncate block text-[11px] leading-tight">
            {selectedSiteId === 'all' ? 'ALL — All Project Sites' : activeSite ? `${activeSite.code} - ${activeSite.name}` : 'Select Site'}
          </span>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            maxHeight: 'min(420px, calc(100vh - 100px))',
            zIndex: 99999
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-2xl py-1.5 focus:outline-none overflow-y-auto font-sans text-xs"
        >
          <div className="px-3 pb-1.5 mb-1 border-b border-gray-100 sticky top-0 bg-white z-10 flex items-center justify-between">
            <span className="font-bold text-[9.5px] text-gray-400 uppercase tracking-widest block">Project Sites</span>
            <span className="text-[9.5px] font-semibold text-brand-650 bg-brand-50 px-1.5 py-0.25 rounded">{sites.length} Sites</span>
          </div>

          {/* All Project Sites option */}
          <button
            key="all"
            onClick={() => {
              setSelectedSiteId('all');
              handleClose();
            }}
            className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-brand-50/50 flex items-center justify-between text-[11px] font-bold transition-colors cursor-pointer ${selectedSiteId === 'all' ? 'bg-brand-50/40 text-brand-700' : 'text-gray-700'}`}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <Briefcase className={`h-3.5 w-3.5 shrink-0 ${selectedSiteId === 'all' ? 'text-brand-600' : 'text-gray-400'}`} />
              <span className="truncate">ALL — All Project Sites (Portfolio View)</span>
            </div>
            {selectedSiteId === 'all' && <Check className="h-3.5 w-3.5 text-brand-600 shrink-0" />}
          </button>

          {sites.map((site) => (
            <button
              key={site.id}
              onClick={() => {
                setSelectedSiteId(site.id);
                handleClose();
              }}
              className={`w-full text-left px-3 py-2 hover:bg-brand-50/50 flex items-center justify-between text-[11px] font-medium transition-colors cursor-pointer ${selectedSiteId === site.id ? 'bg-brand-50/40 text-brand-700 font-bold' : 'text-gray-700'}`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <Briefcase className={`h-3.5 w-3.5 shrink-0 ${selectedSiteId === site.id ? 'text-brand-600' : 'text-gray-400'}`} />
                <span className="truncate" title={`${site.code} - ${site.name}`}>{site.code} - {site.name}</span>
              </div>
              {selectedSiteId === site.id && <Check className="h-3.5 w-3.5 text-brand-600 shrink-0" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

// ==========================================
// 2. Global Search Subcomponent
// ==========================================
interface SearchRecord {
  title: string;
  route: string;
  group: string;
}

export const GlobalSearch: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const [query, setQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = React.useState(false);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Flatten options for search indexing
  const searchableRecords = React.useMemo(() => {
    const list: SearchRecord[] = [];
    NAVIGATION_CONFIG.forEach(grp => {
      grp.items.forEach(itm => {
        list.push({
          title: itm.label,
          route: itm.path,
          group: grp.label
        });
      });
    });
    return list;
  }, []);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return searchableRecords.filter(rec => 
      rec.title.toLowerCase().includes(q) || 
      rec.group.toLowerCase().includes(q) || 
      rec.route.toLowerCase().includes(q)
    );
  }, [query, searchableRecords]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowMobileOverlay(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (route: string) => {
    navigate(route);
    setQuery('');
    setIsOpen(false);
    setShowMobileOverlay(false);
  };

  const renderInput = (classes: string) => (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search ERP (e.g. Indents, Vendors, Budgets)..."
        className={cn(
          "pl-8 pr-3 py-1.5 text-[11px] font-sans border border-gray-200 rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all font-medium text-gray-700",
          classes
        )}
      />
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {isMobile ? (
        // Mobile layout: Show magnifying glass trigger button
        <div>
          <button 
            onClick={() => setShowMobileOverlay(true)} 
            className="p-2 border border-gray-100 hover:bg-gray-50 rounded focus:outline-none flex items-center justify-center cursor-pointer"
            aria-label="Toggle mobile search bar"
          >
            <Search className="h-4 w-4 text-gray-500" />
          </button>

          {showMobileOverlay && (
            <div className="fixed inset-0 bg-white z-[99] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-[13px] text-gray-800">Search System Navigation</span>
                <button 
                  onClick={() => setShowMobileOverlay(false)} 
                  className="p-1 text-gray-500 hover:text-gray-900 focus:outline-none cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-450" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter path name (e.g. Budgets, RFQs)..."
                  className="w-full pl-9 pr-3 py-2 text-[12px] border border-gray-200 bg-gray-50 rounded focus:outline-none focus:ring-1 focus:ring-brand-500/50 text-gray-700"
                />
              </div>

              {query.trim().length > 0 && (
                <div className="flex-1 overflow-y-auto mt-2 space-y-1">
                  {results.length > 0 ? (
                    results.map((rec, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(rec.route)}
                        className="w-full text-left p-2.5 hover:bg-gray-50 rounded border border-gray-100 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-semibold text-gray-800 block">{rec.title}</span>
                          <span className="text-[9px] text-gray-400 block mt-0.5">{rec.group} • {rec.route}</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-xs">No matching routes found.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Desktop layouts: Show full input field
        renderInput("w-[280px] lg:w-[320px]")
      )}

      {/* Desktop Search Dropdown list overlay */}
      {!isMobile && isOpen && query.trim() && (
        <div className="absolute left-0 mt-1 w-[320px] bg-white border border-gray-150 rounded shadow-lg z-50 py-1.5 max-h-[350px] overflow-y-auto">
          {results.length > 0 ? (
            results.map((rec, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(rec.route)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between text-[11px] font-medium border-b border-gray-50 last:border-b-0 cursor-pointer"
              >
                <div>
                  <span className="text-gray-800 block font-semibold">{rec.title}</span>
                  <span className="text-[9px] text-gray-400 block mt-0.5">{rec.group} &bull; <span className="font-mono">{rec.route}</span></span>
                </div>
                <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-gray-400 text-[11px]">
              No results match "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. Notification Dropdown Subcomponent
// ==========================================
export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(mockApprovals.length);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative font-sans text-xs" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 border border-gray-100 bg-white hover:bg-gray-50 rounded-full shrink-0 relative flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500/50"
        aria-label="View notifications alert pipeline"
      >
        <Bell className="h-4.5 w-4.5 text-gray-500 hover:text-gray-800" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-0.5 bg-rose-600 text-white rounded-full h-3.5 min-w-[14px] flex items-center justify-center font-bold text-[8.5px] px-0.5 border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-[290px] sm:w-[350px] bg-white border border-gray-150 rounded shadow-lg z-50 py-1.5">
          <div className="px-3 pb-1 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-[10px] text-gray-800 uppercase tracking-wider block">Approvals Queue</span>
            {unreadCount > 0 && (
              <button 
                onClick={() => setUnreadCount(0)}
                className="text-[10px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer focus:outline-none"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[260px] overflow-y-auto">
            {unreadCount > 0 ? (
              mockApprovals.map((appr) => (
                <div key={appr.id} className="p-2.5 hover:bg-gray-50/50 text-[11px] leading-snug">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-mono text-gray-800 font-bold block">{appr.referenceNo}</span>
                    {appr.amount && (
                      <span className="font-semibold text-gray-700 whitespace-nowrap">{formatIndianCurrency(appr.amount)}</span>
                    )}
                  </div>
                  <p className="text-gray-600 font-medium mt-0.5">{appr.type}</p>
                  <div className="flex items-center justify-between text-[9px] text-gray-400 mt-1 font-semibold">
                    <span>{appr.project}</span>
                    <span>{appr.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">
                No new pending approval alerts.
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => {
                setUnreadCount(0);
                setIsOpen(false);
              }}
              className="text-[9px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-700 cursor-pointer focus:outline-none"
            >
              Clear / Dismiss View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. User Menu Subcomponent (Visual Only)
// ==========================================
export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative font-sans text-xs" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-7 w-7 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center font-bold tracking-tight text-[11px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500/50 relative shrink-0"
        aria-label="User account dashboard menu"
      >
        AD
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-[200px] bg-white border border-gray-150 rounded shadow-lg z-50 py-1.5">
          <div className="px-3.5 py-1.5 border-b border-gray-100">
            <span className="font-bold text-gray-800 text-[11px] block leading-tight">Amit Dev</span>
            <span className="text-[9.5px] text-gray-450 block font-semibold mt-0.5">Operations Director</span>
          </div>

          <div className="py-1">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-3.5 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-650 cursor-pointer font-medium"
            >
              <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-3.5 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-650 cursor-pointer font-medium"
            >
              <Settings className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>Security Configurations</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-3.5 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-650 cursor-pointer font-medium"
            >
              <Shield className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>Roles Master</span>
            </button>
          </div>

          <div className="border-t border-gray-105 my-1.5"></div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-left px-3.5 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-650 font-bold tracking-tight cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-450 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. Main Header Component
// ==========================================
export const Header: React.FC<HeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile,
  collapsed,
  setCollapsed 
}) => {
  return (
    <header className="h-[52px] bg-white border-b border-gray-150 flex items-center px-4 justify-between gap-4 font-sans select-none shrink-0 sticky top-0 z-30">
      
      {/* Left controls: Toggles & switcher */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => {
            if (isMobile) {
              setSidebarOpen(!sidebarOpen);
            } else {
              setCollapsed(!collapsed);
            }
          }}
          className="p-1.5 border border-gray-150 bg-white hover:bg-gray-50 rounded text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500/50"
          aria-label={isMobile ? "Toggle sidebar navigation drawer" : collapsed ? "Expand sidebar panel" : "Collapse sidebar panel"}
        >
          {isMobile ? (
            <AlignLeft className="h-4 w-4" />
          ) : collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <ProjectSwitcher />
      </div>

      {/* Right controls: Global Search & Alerts & Profile info */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        <GlobalSearch isMobile={isMobile} />
        
        <div className="h-4.5 w-[1px] bg-gray-200 hidden sm:block shrink-0"></div>
        
        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  );
};
