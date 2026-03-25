/**
 * Debounced endpoint search input.
 * Waits 300ms after the user stops typing before triggering the filter,
 * preventing excessive API calls during fast typing.
 */

import React, { useState, useEffect, useRef } from 'react';

export default function SearchInput({ value, onChange }) {
  const [local, setLocal] = useState(value || '');
  const timerRef = useRef(null);

  // Sync external value changes (e.g., filter reset)
  useEffect(() => {
    setLocal(value || '');
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocal(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), 300);
  };

  const handleClear = () => {
    setLocal('');
    clearTimeout(timerRef.current);
    onChange('');
  };

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <circle cx="6" cy="6" r="4.5" />
        <path d="M9.5 9.5L13 13" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder="Search endpoints..."
        className="w-full pl-9 pr-8 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-500 transition-colors"
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
