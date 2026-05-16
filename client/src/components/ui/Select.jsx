import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ 
  label, 
  value, 
  onChange, 
  required = false,
  icon: Icon,
  className = '',
  children
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm text-slate-600 tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full py-3 bg-slate-50 border border-primary-500 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium text-sm text-slate-700 appearance-none cursor-pointer
            ${Icon ? 'pl-14 pr-12' : 'pl-5 pr-12'}
          `}
        >
          {children}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
};

export default Select;
