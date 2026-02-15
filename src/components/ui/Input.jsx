import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  icon: Icon,
  error,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}
        </label>
      )}
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
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 rounded-xl border-2 ${
            error 
              ? 'border-red-500 focus:border-red-600' 
              : 'border-slate-200 focus:border-blue-500'
          } focus:outline-none transition-colors ${
            disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
          }`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;