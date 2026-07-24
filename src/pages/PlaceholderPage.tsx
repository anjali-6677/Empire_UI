import * as React from 'react';
import { Link } from 'react-router-dom';
import { Construction, Home, ChevronRight } from 'lucide-react';

interface PlaceholderPageProps {
  moduleName: string;
  groupName?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  moduleName, 
  groupName = 'Module' 
}) => {

  return (
    <div className="flex flex-col gap-5 w-full font-sans text-xs pb-10 select-none">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-gray-400 uppercase">
        <Link to="/" className="hover:text-brand-600 transition-colors flex items-center justify-center p-0.5 rounded focus:outline-none">
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-450">{groupName}</span>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-gray-650">{moduleName}</span>
      </nav>

      {/* Page Header */}
      <div className="border-b border-gray-150 pb-4">
        <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-tight">{moduleName}</h1>
        <p className="text-[10.5px] text-gray-400 font-medium leading-normal">
          Manage and monitor ERP {moduleName.toLowerCase()} settings and operations.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-150 rounded-lg p-12 shadow-sm flex flex-col items-center justify-center text-center my-6 min-h-[300px]">
        <div className="p-4 bg-amber-50 rounded-full text-brand-500 mb-4 border border-amber-100 flex items-center justify-center">
          <Construction className="h-8 w-8 stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-bold text-gray-950 mb-1.5">Under Development</h3>
        <p className="text-[11.5px] text-gray-500 max-w-sm leading-relaxed mb-6 font-medium">
          The <span className="font-semibold text-gray-800">{moduleName}</span> frontend screen is scheduled for a future development phase. Under the prototype scope, this is a placeholder route.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse"></span>
          <span className="text-[9.5px] font-bold text-gray-450 uppercase tracking-widest">Frontend Prototype Status</span>
        </div>
      </div>
    </div>
  );
};
