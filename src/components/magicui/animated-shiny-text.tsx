"use client";

import React, { CSSProperties, FC, ReactNode } from "react";

interface AnimatedShinyTextProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className = "",
  shimmerWidth = 100,
}) => {
  return (
    <span
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={`mx-auto inline-block max-w-md text-slate-600/90 animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite] bg-gradient-to-r from-transparent via-white/80 via-50% to-transparent dark:text-slate-400/90 ${className}`}
    >
      {children}
    </span>
  );
};

