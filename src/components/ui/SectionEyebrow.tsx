import React from "react";

interface SectionEyebrowProps {
  children: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export function SectionEyebrow({
  children,
  centered = false,
  className = "",
}: SectionEyebrowProps) {
  if (centered) {
    return (
      <div
        className={`inline-flex items-center justify-center gap-2.5 text-[#C45B2A] text-xs sm:text-sm font-bold tracking-wide ${className}`}
      >
        <span className="w-4 h-[1.5px] bg-[#C45B2A]/60 rounded-full inline-block shrink-0" />
        <span>{children}</span>
        <span className="w-4 h-[1.5px] bg-[#C45B2A]/60 rounded-full inline-block shrink-0" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 text-[#C45B2A] text-xs sm:text-sm font-bold tracking-wide ${className}`}
    >
      <span className="w-5 h-[2px] bg-[#C45B2A] rounded-full inline-block shrink-0" />
      <span>{children}</span>
    </div>
  );
}

