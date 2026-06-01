import React from 'react';
import { cn } from '../../lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-bold text-slate-700">{label}</label>}
    <input
      className={cn("px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500", className)}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
