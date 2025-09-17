
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-aura-surface rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <h3 className="text-lg font-semibold text-white p-4 border-b border-aura-primary">{title}</h3>
      <div className="h-full">
        {children}
      </div>
    </div>
  );
};
