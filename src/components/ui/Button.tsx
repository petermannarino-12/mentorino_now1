import React from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({ className, variant = "primary", loading, children, ...props }) => {
  const base = "px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs transition-all min-h-[44px]";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    secondary: "bg-gray-800 text-white hover:bg-gray-700",
    outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
  };

  return (
    <button
      className={cn(base, variants[variant], loading && "opacity-70 cursor-not-allowed", className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};
