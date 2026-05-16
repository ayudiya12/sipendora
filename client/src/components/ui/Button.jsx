import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled = false,
  icon: Icon
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-200',
    dark: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200',
    outline: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {Icon && <Icon size={20} />}
      {children}
    </motion.button>
  );
};

export default Button;
