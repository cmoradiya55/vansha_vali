'use client';

import React from 'react';

interface RequiredLabelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * RequiredLabel component that displays label with "ફરજિયાત" (compulsory) indicator
 * Uses Nano Sans Gujarati font for the compulsory text
 */
export default function RequiredLabel({ children, className = '' }: RequiredLabelProps) {
  return (
    <label className={`${className} flex items-center gap-1`}>
      <span>{children}</span>
      <span 
        className="text-red-600 font-semibold text-xs sm:text-sm"
        style={{ fontFamily: "'Noto Sans Gujarati', sans-serif" }}
      >
        ફરજિયાત
      </span>
    </label>
  );
}

