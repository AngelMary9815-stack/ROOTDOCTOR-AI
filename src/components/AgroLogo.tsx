import * as React from 'react';

interface AgroLogoProps {
  className?: string;
}

export function AgroLogoMark({ className = 'h-7 w-7' }: AgroLogoProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="9" fill="#14532D" />
      <path
        d="M26.5 9.5C19.5 9.5 13.5 13 11.2 19.2C10.5 21.1 10.4 23.2 10.9 25.1C12.8 25.6 14.9 25.5 16.8 24.8C23 22.5 26.5 16.5 26.5 9.5Z"
        fill="#22C55E"
        fillOpacity="0.22"
        stroke="#86EFAC"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 26.5L18.5 17.5"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M15.5 20.5H20.5M18.5 17.5V13.5"
        stroke="#86EFAC"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="21.5" cy="20.5" r="1.5" fill="#FFFFFF" />
      <circle cx="18.5" cy="13" r="1.5" fill="#FFFFFF" />
      <circle cx="9.5" cy="26.5" r="1.6" fill="#86EFAC" />
    </svg>
  );
}
