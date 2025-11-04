import React from 'react';

export const FilmIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}
  >
    <path d="M4 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
    <path d="M16 12l5-2.5v5L16 12z" />
    <circle cx="7" cy="5" r="2" />
    <circle cx="13" cy="5" r="2" />
  </svg>
);
