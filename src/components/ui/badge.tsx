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
  default: "bg-gray-900 text-white hover:bg-gray-800",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  destructive: "bg-red-50 text-red-700 border border-red-200/80",
  outline: "text-gray-700 border border-gray-200 bg-white",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
  warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
  brand: "bg-[#C45B2A]/10 text-[#C45B2A] border border-[#C45B2A]/20",
  info: "bg-sky-50 text-sky-700 border border-sky-200/80",
  purple: "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
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
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
        badgeVariants[variant] || badgeVariants.default
      } ${sizeClass} ${className}`}
      {...props}
    />
  );
}
