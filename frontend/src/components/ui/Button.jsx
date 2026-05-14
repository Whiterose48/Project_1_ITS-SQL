import React from 'react';

export default function Button({ children, onClick, className = '', type = 'button', ariaLabel, disabled = false, title }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={`inline-flex items-center justify-center select-none rounded-2xl font-black transition-all focus:outline-none focus:ring-4 focus:ring-[#FF9900]/30 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
