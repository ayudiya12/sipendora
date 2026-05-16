import React from 'react';
import { motion } from 'framer-motion';

const DataListCard = ({ 
  children, 
  className = '',
  onClick,
  hoverable = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white border-2 border-primary-200 rounded-2xl p-4 space-y-3
        hover:border-primary-300 transition-colors
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Header section with title and optional badge
export const DataListCardHeader = ({ 
  icon: Icon, 
  iconBg = 'bg-primary-100', 
  iconColor = 'text-primary-600',
  title, 
  subtitle,
  badge,
  badgeColor = 'bg-slate-100 text-slate-600'
}) => (
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
          <Icon size={18} />
        </div>
      )}
      <div>
        <p className="font-bold text-slate-800 text-sm">{title}</p>
        {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {badge && (
      <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border ${badgeColor}`}>
        {badge}
      </span>
    )}
  </div>
);

// Meta info row (date, time, etc)
export const DataListCardMeta = ({ items }) => (
  <div className="flex items-center gap-4 text-[10px] text-slate-500">
    {items.map((item, idx) => (
      <span key={idx} className="flex items-center gap-1">
        {item.icon && <item.icon size={12} />}
        {item.text}
      </span>
    ))}
  </div>
);

// Footer with main value and actions
export const DataListCardFooter = ({ 
  value,
  valueClass = 'font-black text-slate-900',
  actions
}) => (
  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
    <p className={valueClass}>{value}</p>
    {actions && (
      <div className="flex items-center gap-1">
        {actions}
      </div>
    )}
  </div>
);

export default DataListCard;
