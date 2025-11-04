import React from 'react';

export const ChatBubbleLeftRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-6 h-6"}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.371c-1.13.113-2.097.957-2.097 2.097v1.65a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-1.65c0-1.136-.967-1.984-2.097-2.097l-3.722-.371A2.25 2.25 0 0 1 2.25 15v-4.286c0-.97.616-1.813 1.5-2.097m16.5 0a9.023 9.023 0 0 0-5.14-2.836 9.003 9.003 0 0 0-1.215 0c-1.83.364-3.593 1.18-5.14 2.836m11.49 0c.269.02.53.05.786.092a11.445 11.445 0 0 1-13.064 0c.256-.042.517-.072.786-.092m11.49 0h.008v.004h-.008V8.511Z"
    />
  </svg>
);