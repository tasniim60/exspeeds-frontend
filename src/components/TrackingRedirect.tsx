"use client";

import React from "react";
import { ExternalLink, Truck } from "lucide-react";
import { trackShipment } from "@/lib/tracking";

interface TrackingRedirectProps {
  carrier: string;
  awb: string;
  className?: string;
  variant?: "button" | "link" | "icon";
  label?: string;
  onTracked?: (res: ReturnType<typeof trackShipment>) => void;
}

export const TrackingRedirect: React.FC<TrackingRedirectProps> = ({
  carrier,
  awb,
  className = "",
  variant = "link",
  label,
  onTracked,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = trackShipment(carrier, awb);
    if (onTracked) {
      onTracked(result);
    }
  };

  const buttonText = label || "تتبع";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[#C45B2A] text-white hover:bg-[#a3471e] transition-colors cursor-pointer ${className}`}
      >
        <span>{buttonText}</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`Track AWB ${awb}`}
        className={`p-1.5 rounded-md text-gray-500 hover:text-[#C45B2A] hover:bg-orange-50 transition-colors cursor-pointer ${className}`}
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-xs font-bold text-[#C45B2A] hover:underline cursor-pointer ${className}`}
    >
      <span>{buttonText}</span>
      <ExternalLink className="w-3 h-3" />
    </button>
  );
};
