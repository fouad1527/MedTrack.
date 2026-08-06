import React, { useState } from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  className?: string;
  textClassName?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  className = "w-9 h-9",
  textClassName = "text-xs font-bold"
}) => {
  const [imgError, setImgError] = useState(false);

  // Compute initials
  const getInitials = (str: string) => {
    if (!str) return 'M';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  if (avatarUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-800 shrink-0 ${className}`}>
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-emerald-600 text-white font-bold flex items-center justify-center border border-indigo-500/30 shadow-sm shrink-0 select-none ${className}`}
      title={name}
    >
      <span className={textClassName}>{initials}</span>
    </div>
  );
};
