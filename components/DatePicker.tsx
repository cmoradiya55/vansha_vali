'use client';

import CalenderIcon from '@/public/custom-icon/all-icons/CalenderIcon';
import React, { useMemo, useRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/* ===================== TYPES ===================== */

interface DatePickerComponentProps {
  id?: string;
  value: string; // yyyy-mm-dd
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'small' | 'default';
  /** default=box border | underline=bottom border only | plain=no border */
  variant?: 'default' | 'underline' | 'plain';
  disabled?: boolean;
  hideIcon?: boolean;
}

/* ===================== GUJARATI DIGITS ===================== */

const gujaratiDigits: Record<string, string> = {
  '0': '૦',
  '1': '૧',
  '2': '૨',
  '3': '૩',
  '4': '૪',
  '5': '૫',
  '6': '૬',
  '7': '૭',
  '8': '૮',
  '9': '૯',
};

function toGujaratiDigits(text: string): string {
  return text
    .split('')
    .map((char) => gujaratiDigits[char] || char)
    .join('');
}

const CustomInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { variant?: 'default' | 'underline' | 'plain' }>(
  ({ value, variant = 'default', ...rest }, ref) => {
    const displayValue = typeof value === 'string' ? toGujaratiDigits(value) : value;
    const baseClass =
      variant === 'plain'
        ? `w-full border-0 bg-transparent text-black focus:outline-none focus:ring-0 pb-0 ${rest.className || ''}`
        : variant === 'underline'
        ? `w-full border-0 border-b border-black rounded-none bg-transparent text-black focus:outline-none focus:ring-0 focus:border-black pb-0 ${rest.className || ''}`
        : `w-full rounded-lg border border-gray-300 bg-white text-black focus:border-yellow-500 focus:outline-none ${rest.className || ''}`;
    return (
      <input
        ref={ref}
        readOnly
        value={displayValue as any}
        {...rest}
        className={baseClass}
      />
    );
  }
);

CustomInput.displayName = 'CustomInput';

export default function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'તારીખ પસંદ કરો',
  className = '',
  size = 'default',
  variant = 'default',
  disabled = false,
  hideIcon = false,
}: DatePickerComponentProps) {
  const pickerRef = useRef<ReactDatePicker>(null);

  /* ✅ Derived value (React best practice) */
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }, [value]);

  const handleChange = (date: Date | null) => {
    if (!date) {
      onChange('');
      return;
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    onChange(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className={`relative w-full${hideIcon ? ' flex items-end' : ''}${disabled ? ' opacity-60 cursor-not-allowed' : ''}`}>
      <ReactDatePicker
        id={id}
        ref={pickerRef}
        selected={selectedDate}
        onChange={disabled ? () => {} : handleChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        disabled={disabled}

        /* ✅ MONTH & YEAR SELECT */
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        yearDropdownItemNumber={100}

        calendarClassName="!font-sans datepicker-calendar"
        wrapperClassName="w-full"
        showPopperArrow={false}
        popperClassName="datepicker-popper"
        popperPlacement="bottom-start"

        customInput={
          <CustomInput
            variant={variant}
            disabled={disabled}
            className={`${
              hideIcon
                ? 'px-0 py-0 pb-0 leading-none text-xs sm:text-sm'
                : size === 'small'
                  ? 'px-2 py-1 text-xs pr-8'
                  : 'px-3 py-2 text-sm pr-10'
            } ${className}${disabled ? ' cursor-not-allowed' : ''}`}
          />
        }
      />

      {/* Calendar Button */}
      {!disabled && !hideIcon && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Open calendar"
          onClick={() => pickerRef.current?.setOpen(true)}
          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
            ${size === 'small' ? 'right-2' : 'right-3'}`}
        >
          <CalenderIcon
            height={size === 'small' ? '1rem' : '1.25rem'}
            width={size === 'small' ? '1rem' : '1.25rem'}
            color="currentColor"
          />
        </button>
      )}
    </div>
  );
}
