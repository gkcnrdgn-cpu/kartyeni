
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.97] disabled:opacity-50 text-sm flex items-center justify-center gap-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 ";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20",
    accent: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20",
    secondary: "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    ghost: "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100"
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
