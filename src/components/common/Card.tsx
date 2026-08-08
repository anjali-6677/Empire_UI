import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'compact' | 'normal' | 'spacious';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'normal',
}) => {
  const paddingStyles = {
    none: 'p-0',
    compact: 'p-3.5 sm:p-4',
    normal: 'p-5 sm:p-6',
    spacious: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-white border border-[#E2E6EC] rounded-2xl shadow-xs transition-shadow ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
export default Card;
