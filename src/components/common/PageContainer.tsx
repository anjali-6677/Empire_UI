import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-full px-4 sm:px-6 md:px-8 py-6 box-border font-sans text-xs space-y-6 ${className}`}>
      {children}
    </div>
  );
};
export default PageContainer;
