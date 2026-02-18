import React from 'react';
import { motion } from 'framer-motion';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Floating Label */}
      {label && (
        <motion.label
          animate={{
            top: isFocused || value ? '-10px' : '16px',
            fontSize: isFocused || value ? '12px' : '16px',
            color: isFocused ? '#8B5CF6' : '#64748B'
          }}
          className="absolute left-4 bg-white px-2 font-semibold pointer-events-none transition-all z-10"
        >
          {label}
        </motion.label>
      )}

      {/* Input Container */}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={20} />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={!label ? placeholder : ''}
          className={`
            w-full 
            ${Icon ? 'pl-12' : 'pl-4'} 
            pr-4 py-4
            bg-white
            border-2 
            ${error ? 'border-red-500' : isFocused ? 'border-purple-500' : 'border-slate-200'}
            rounded-2xl
            text-slate-900 
            font-medium
            focus:outline-none
            transition-all duration-300
            ${isFocused ? 'shadow-lg shadow-purple-500/20' : 'shadow-sm'}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
          `}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm font-semibold mt-2 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;