import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'gradient',
  onClick,
  className = '',
  icon: Icon,
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button'
}) => {
  const [ripples, setRipples] = React.useState([]);

  const variants = {
    gradient: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50',
    electric: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50',
    green: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/50',
    sunset: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/50',
    neomorph: 'neomorph text-slate-900 hover:shadow-md',
    outline: 'bg-transparent border-3 border-purple-600 text-purple-600 hover:bg-purple-50',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/50',
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-6 py-3.5 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        relative overflow-hidden rounded-2xl font-bold flex items-center justify-center gap-2.5
        transition-all duration-300
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative flex items-center gap-2.5">
        {loading && (
          <div className="spinner spinner-sm" />
        )}
        {!loading && Icon && <Icon size={20} strokeWidth={2.5} />}
        {children}
      </span>
    </motion.button>
  );
};

export default Button;