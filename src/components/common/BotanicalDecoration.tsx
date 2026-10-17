import React from 'react';

export const WavyCornerDecoration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      width="180"
      height="140"
      viewBox="0 0 180 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 130C40 100 70 120 100 80C130 40 150 70 180 10"
        stroke="#F6A5C0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M5 140C35 110 65 130 95 90C125 50 145 80 175 20"
        stroke="#F8BCD0"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M0 150C30 120 60 140 90 100C120 60 140 90 170 30"
        stroke="#FCE3EC"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const BotanicalLeafIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-[#5F8D69]' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 4 13C4 7 11 3 20 3C20 12 16 19 11 20Z" />
      <path d="M5 19L14 10" />
    </svg>
  );
};

export const RoseFloralIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6 text-[#D82B76]' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C9.5 2 7.8 3.5 7.2 5.2C5.5 5.5 4 7 4 9C4 10.5 4.8 11.8 6 12.5C5.4 13.8 5.8 15.5 7 16.5C7.2 18.5 9 20 11 20C11.5 20 12 19.8 12.5 19.6C13.2 21 14.8 22 16.5 22C19 22 21 20 21 17.5C21 16.5 20.6 15.6 20 15C20.6 14.2 21 13.2 21 12C21 10.2 19.8 8.7 18.2 8.2C18.4 7.6 18.5 7 18.5 6.5C18.5 4 16.5 2 14 2C13.3 2 12.6 2.2 12 2.5V2Z" opacity="0.85"/>
      <circle cx="12" cy="11" r="2.5" fill="#FAF2EB" />
    </svg>
  );
};

export const SparkleStar: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 text-[#5F8D69]' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
};
