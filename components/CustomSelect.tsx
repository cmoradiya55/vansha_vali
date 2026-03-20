'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  listClassName?: string;
  required?: boolean;
  id?: string;
}

/**
 * Dropdown that opens below the trigger with the SAME width as the input (not wider).
 * Use instead of native <select> when dropdown list must match input width.
 */
export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'પસંદ કરો',
  className = '',
  listClassName = '',
  required = false,
  id,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : '';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className={`w-full text-left rounded-lg border border-gray-300 px-3 py-2.5 text-sm sm:text-base bg-white min-h-[2.75rem] flex items-center justify-between gap-2 focus:border-yellow-500 focus:outline-none ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
      >
        <span className={!displayLabel ? 'text-gray-600' : 'text-gray-900'}>
          {displayLabel || placeholder}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute z-[100] top-full left-0 right-0 mt-1 py-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto w-full min-w-0 max-w-full box-border text-gray-900 ${listClassName}`}
        >
          <li
            role="option"
            aria-selected={value === ''}
            onClick={() => handleSelect('')}
            className={`px-3 py-2.5 text-sm cursor-pointer text-gray-900 hover:bg-gray-100 hover:text-gray-900 ${value === '' ? 'bg-yellow-50 text-yellow-900' : ''} ${listClassName}`}
          >
            {placeholder}
          </li>
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`px-3 py-2.5 text-sm cursor-pointer text-gray-900 hover:bg-gray-100 hover:text-gray-900 ${value === opt.value ? 'bg-yellow-50 text-yellow-900' : ''} ${listClassName}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      {required && (
        <input
          tabIndex={-1}
          required
          aria-hidden
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          readOnly
          value={value}
          onChange={() => {}}
        />
      )}
    </div>
  );
}
