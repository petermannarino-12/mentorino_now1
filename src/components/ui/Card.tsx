import React, { memo } from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = memo(({ children, className }) => (
  <div className={cn("bg-white p-6 rounded-2xl shadow-sm border border-slate-100", className)}>
    {children}
  </div>
);
