import React from 'react';

interface UserAvatarProps {
  userId: string;
  className?: string;
}

// Simple hash function to get a number from a string
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// A fixed set of colors to choose from
const colors = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
];

export const UserAvatar: React.FC<UserAvatarProps> = ({ userId, className = 'w-10 h-10' }) => {
  const shortId = userId.substring(0, 6).toUpperCase();
  const firstLetters = shortId.substring(0, 2);
  
  // Get a deterministic color based on the userId
  const colorIndex = simpleHash(userId) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ backgroundColor: bgColor }}
      title={`Player-${shortId}`}
    >
      {firstLetters}
    </div>
  );
};