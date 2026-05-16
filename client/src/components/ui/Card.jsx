import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', noPadding = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-primary-50 border rounded-3xl border-primary-500/90 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden
        ${!noPadding ? 'p-4' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
