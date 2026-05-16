import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-semibold text-slate-700
            ${Icon ? 'pl-14 pr-5' : 'px-5'}
          `}
        />
      </div>
    </div>
  );
};

export default Input;
