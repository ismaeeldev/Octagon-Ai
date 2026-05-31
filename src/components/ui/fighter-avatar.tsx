"use client";

import { useState } from "react";

interface FighterAvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  sizeClassName?: string;
}

export function FighterAvatar({ src, name, className = "", sizeClassName = "w-20 h-20" }: FighterAvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const displayName = name || "Fighter";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2);

  let cleanSrc = src;
  if (cleanSrc && cleanSrc.startsWith("https://ufc.com")) {
    cleanSrc = cleanSrc.replace("https://ufc.com", "https://www.ufc.com");
  }

  const hasImage = cleanSrc && cleanSrc !== "null" && cleanSrc !== "undefined" && cleanSrc.trim() !== "" && !error;

  return (
    <div className={`relative rounded-full bg-zinc-950/40 border border-zinc-800 flex items-end justify-center overflow-hidden shrink-0 shadow-inner group-hover:border-primary/30 transition-colors ${sizeClassName} ${className}`}>
      {/* Loading Skeleton */}
      {!loaded && hasImage && (
        <div className="absolute inset-0 bg-zinc-900/60 rounded-full animate-pulse border border-zinc-850"></div>
      )}
      
      {/* Pedestal glow */}
      <div className="absolute bottom-0 w-12 h-12 bg-primary/5 rounded-full blur-md"></div>
      
      {hasImage ? (
        <img
          src={cleanSrc || undefined}
          alt={displayName}
          referrerPolicy="no-referrer"
          className={`h-[90%] object-contain select-none z-10 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] transition-all duration-300 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-500 font-black tracking-tighter uppercase text-sm select-none z-10">
          {initials}
        </div>
      )}
    </div>
  );
}
