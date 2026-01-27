import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '', 
  icon: Icon, 
  size = 'md', 
  fullWidth = false 
}) => {
  const variants = {
    primary: 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-800/30',
    secondary: 'bg-white hover:bg-gray-50 text-slate-800 border-2 border-slate-200',
    accent: 'bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-lg shadow-amber-400/30',
    ghost: 'hover:bg-slate-100 text-slate-700',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </motion.button>
  );
};

export default Button;