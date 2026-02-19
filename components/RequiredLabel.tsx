// 'use client';

// import React from 'react';

// interface RequiredLabelProps {
//   children: React.ReactNode;
//   className?: string;
// }

// /**
//  * RequiredLabel component that displays label with "ફરજિયાત" (compulsory) indicator
//  * Uses Nano Sans Gujarati font for the compulsory text
//  */
// export default function RequiredLabel({ children, className = '' }: RequiredLabelProps) {
//   return (
//     <label className={`${className} flex items-center`}>
//       <span>{children}</span>
//       <span 
//         className="text-red-600 font-semibold text-xs sm:text-sm"
//         style={{ fontFamily: "'Noto Sans Gujarati', sans-serif" }}
//       >
//         *
//       </span>
//     </label>
//   );
// }




'use client';

import React from 'react';

interface RequiredLabelProps {
  /** id of the input this label is for */
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * RequiredLabel component
 * - Accessible (label is correctly linked to input)
 * - Shows required (*) indicator
 * - Gujarati font supported
 */
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
