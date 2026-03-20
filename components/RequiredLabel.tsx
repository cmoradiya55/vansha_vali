'use client';

import React from 'react';

interface RequiredLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export default function RequiredLabel({
  htmlFor,
  children,
  className = '',
}: RequiredLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`flex items-center gap-1 text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
      <span>{children}</span>
      <span
        className="text-red-600 font-semibold text-xs sm:text-sm"
        style={{ fontFamily: "'Noto Sans Gujarati', sans-serif" }}
        aria-hidden="true"
      >
        *
      </span>
    </label>
  );
}
