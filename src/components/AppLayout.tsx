import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ErrorBoundary } from './ErrorBoundary';
import { cn } from '../utils/cn';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Auto-detect responsive viewport size
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // Tailwind md breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-x-hidden">
      {/* Expanded/Collapsed Desktop Sidebar & Mobile drawer overlay */}
      <Sidebar
        isCollapsed={isCollapsed}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Viewport Panel */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300',
          isCollapsed ? 'md:ml-16' : 'md:ml-60'
        )}
      >
        <Header
          sidebarOpen={isOpenMobile}
          setSidebarOpen={setIsOpenMobile}
          isMobile={isMobile}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
        
        {/* Core page scroll window */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-full">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
export default AppLayout;

