import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white rounded-2xl border-2 border-slate-100 ${hover ? 'hover:shadow-xl hover:border-slate-200 transition-all duration-300 cursor-pointer' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

export default Card;