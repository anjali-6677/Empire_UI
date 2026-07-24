import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAVIGATION_CONFIG } from '../config/navigation';
import { cn } from '../utils/cn';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const SidebarBrand: React.FC<{ isCollapsed: boolean; onCloseMobile: () => void }> = ({
  isCollapsed,
  onCloseMobile
}) => (
  <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-850 shrink-0">
    <Link to="/" className="flex items-center gap-2 focus:outline-none" onClick={onCloseMobile}>
      <div className="h-8 w-8 rounded bg-brand-500 flex items-center justify-center text-white font-bold text-base shrink-0">
        E
      </div>
      {!isCollapsed && (
        <span className="font-bold text-sm text-gray-100 tracking-wider">
          EMPIRE <span className="text-brand-500 font-semibold">INTERIOR</span>
        </span>
      )}
    </Link>
  </div>
);

const SidebarFooter: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => (
  <div className="p-4 border-t border-zinc-850/40 text-center bg-zinc-950/40 shrink-0">
    {!isCollapsed ? (
      <p className="text-[10px] text-zinc-500 font-medium">ERP v1.4.2 • Frontend Prototype</p>
    ) : (
      <div className="h-2 w-2 rounded-full bg-emerald-500 mx-auto animate-pulse" title="System Online"></div>
    )}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isOpenMobile,
  onCloseMobile
}) => {
  const { pathname } = useLocation();
  
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    'group-overview': true,
    'group-projects': true,
    'group-procurement': false,
    'group-finance': false,
    'group-masters': false,
    'group-reports': false,
    'group-admin': false
  });

  const toggleGroup = (groupId: string) => {
    if (isCollapsed) return;
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  React.useEffect(() => {
    if (isCollapsed) {
      setExpandedGroups({
        'group-overview': true,
        'group-projects': false,
        'group-procurement': false,
        'group-finance': false,
        'group-masters': false,
        'group-reports': false,
        'group-admin': false
      });
    }
  }, [isCollapsed]);

  const renderNavItems = (items: typeof NAVIGATION_CONFIG[0]['items'], groupId: string) => {
    const isGroupExpanded = expandedGroups[groupId] || isCollapsed;

    if (!isGroupExpanded) return null;

    return (
      <ul className="space-y-1.5 mt-1.5 px-3">
        {items.map((item) => {
          const LucideIcon = (Icons as any)[item.icon || 'HelpCircle'];
          const isActive = pathname === item.path;

          return (
            <li key={item.id} className="relative group/item">
              <Link
                to={item.path}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded text-xs transition-all duration-150 font-sans focus:outline-none focus:ring-1 focus:ring-brand-500/50',
                  isActive
                    ? 'bg-brand-500 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-sidebar-hover hover:text-white',
                  isCollapsed && 'justify-center p-2'
                )}
              >
                {LucideIcon && (
                  <LucideIcon
                    className={cn(
                      'h-4 w-4 shrink-0 stroke-[1.75]',
                      isActive ? 'text-white' : 'text-zinc-400 group-hover/item:text-white'
                    )}
                  />
                )}
                
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold rounded shadow-md pointer-events-none opacity-0 group-hover/item:opacity-100 transition-all duration-150 whitespace-nowrap z-50 translate-x-1 group-hover/item:translate-x-0">
                    {item.label}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderNavigation = (collapsed: boolean) => (
    <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
      {NAVIGATION_CONFIG.map((group) => {
        const isGroupExpanded = expandedGroups[group.id];
        
        return (
          <div key={group.id} className="space-y-1">
            {!collapsed ? (
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-zinc-550 uppercase tracking-widest hover:text-white transition-colors text-left focus:outline-none cursor-pointer"
                aria-expanded={isGroupExpanded}
              >
                <span>{group.label}</span>
                <Icons.ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-zinc-550 transform transition-transform duration-200',
                    isGroupExpanded ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </button>
            ) : (
              <div className="border-t border-zinc-850/50 my-2 first:hidden"></div>
            )}

            {renderNavItems(group.items, group.id)}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{ '--sidebar-width': isCollapsed ? '4rem' : '15rem' } as React.CSSProperties}
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden md:flex h-dvh w-[var(--sidebar-width)] flex-col bg-[#121214] border-r border-zinc-800/30 transition-all duration-300 text-white font-sans'
        )}
      >
        <SidebarBrand isCollapsed={isCollapsed} onCloseMobile={onCloseMobile} />
        {renderNavigation(isCollapsed)}
        <SidebarFooter isCollapsed={isCollapsed} />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isOpenMobile && (
        <>
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          <aside
            style={{ '--sidebar-width': '15rem' } as React.CSSProperties}
            className="fixed inset-y-0 left-0 z-50 flex h-dvh w-[var(--sidebar-width)] flex-col bg-[#121214] border-r border-zinc-800/30 md:hidden text-white font-sans"
          >
            <SidebarBrand isCollapsed={false} onCloseMobile={onCloseMobile} />
            {renderNavigation(false)}
            <SidebarFooter isCollapsed={false} />
          </aside>
        </>
      )}
    </>
  );
};

