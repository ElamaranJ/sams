import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  delay = 0,
  variant = 'white',
  glow = false,
  gradient = false
}) => {
  const variants = {
    white: 'bg-white border border-slate-100',
    glass: 'glass-card',
    neomorph: 'neomorph',
    gradient: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white',
    dark: 'bg-slate-900 text-white border border-slate-800',
  };

  const hoverClasses = hover
    ? 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer'
    : '';

  const glowClasses = glow
    ? 'hover-glow'
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        rounded-3xl
        transition-all duration-300
        ${variants[variant]}
        ${hoverClasses}
        ${glowClasses}
        ${gradient ? 'gradient-border' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;