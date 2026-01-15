'use client';

import { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  size?: 'small' | 'default';
}

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

export default function DatePickerComponent({
  value,
  onChange,
  placeholder = 'તારીખ પસંદ કરો',
  className = '',
  label,
  size = 'default',
}: DatePickerComponentProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const datePickerRef = useRef<DatePicker>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      } else {
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      // Format date as YYYY-MM-DD for HTML date input compatibility
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="mb-1 block text-xs sm:text-sm font-medium text-black">
          {label}
        </label>
      )}
      <div className="relative">
         <DatePicker
           ref={datePickerRef}
           selected={selectedDate}
           onChange={handleDateChange}
           dateFormat="dd/MM/yyyy"
           placeholderText={placeholder}
           className={`w-full rounded-lg border border-gray-300 focus:border-yellow-500 focus:outline-none text-black bg-white ${
             size === 'small' 
               ? 'px-1.5 py-1 pr-8 text-[10px] min-h-[28px]' 
               : 'px-2 sm:px-3 py-2 pr-10 text-sm sm:text-base'
           } ${className}`}
           calendarClassName="!font-sans"
           wrapperClassName="w-full"
           showPopperArrow={false}
         />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (datePickerRef.current) {
              const input = datePickerRef.current.input;
              if (input) {
                input.focus();
                input.click();
              }
            }
          }}
          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0.5 z-10 ${
            size === 'small' ? 'right-2' : 'right-2 sm:right-3'
          }`}
          aria-label="Open calendar"
          tabIndex={-1}
        >
          <CalendarIcon className={`pointer-events-none ${
            size === 'small' ? 'h-3.5 w-3.5' : 'h-4 w-4 sm:h-5 sm:w-5'
          }`} />
        </button>
      </div>
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container {
          width: 100%;
        }
         .react-datepicker__input-container {
           width: 100% !important;
         }
         .react-datepicker__input-container input {
           width: 100% !important;
           min-height: auto;
           height: auto;
           overflow: visible !important;
           text-overflow: clip !important;
           white-space: nowrap;
           box-sizing: border-box;
         }
        .react-datepicker {
          font-family: inherit;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .react-datepicker__header {
          background-color: #fef3c7;
          border-bottom: 1px solid #d1d5db;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          padding-top: 0.75rem;
        }
        .react-datepicker__current-month {
          color: #92400e;
          font-weight: 600;
          font-size: 0.875rem;
          padding-bottom: 0.5rem;
        }
        .react-datepicker__day-name {
          color: #92400e;
          font-weight: 600;
          width: 2rem;
          line-height: 2rem;
        }
        .react-datepicker__day {
          width: 2rem;
          line-height: 2rem;
          margin: 0.166rem;
          border-radius: 0.375rem;
        }
        .react-datepicker__day:hover {
          background-color: #fef3c7;
          border-radius: 0.375rem;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #f59e0b;
          color: white;
          border-radius: 0.375rem;
        }
        .react-datepicker__day--selected:hover,
        .react-datepicker__day--keyboard-selected:hover {
          background-color: #d97706;
        }
        .react-datepicker__day--today {
          font-weight: 600;
          border: 1px solid #f59e0b;
        }
        .react-datepicker__navigation {
          top: 0.75rem;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #92400e;
        }
        .react-datepicker__navigation:hover *::before {
          border-color: #78350f;
        }
      `}</style>
    </div>
  );
}

