import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "brand"
    | "info"
    | "purple";
  size?: "default" | "sm";
}

const badgeVariants: Record<string, string> = {
  default: "bg-[#0F172A] text-white border border-transparent",
  secondary: "bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]",
  destructive: "bg-red-50 text-red-700 border border-red-200",
  outline: "text-[#334155] border border-[#CBD5E1] bg-white",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  brand: "bg-[#C45B2A]/10 text-[#C45B2A] border border-[#C45B2A]/20 font-semibold",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
};

export function Badge({
  className = "",
  variant = "default",
  size = "default",
  ...props
}: BadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs";
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#C45B2A]/30 focus:ring-offset-2 focus:ring-offset-white ${
        badgeVariants[variant] || badgeVariants.default
      } ${sizeClass} ${className}`}
      {...props}
    />
  );
}

