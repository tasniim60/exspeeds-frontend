import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "brand"
    | "brandOutline"
    | "sidebar"
    | "sidebarActive"
    | "sidebarDanger";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
}

const variantStyles: Record<string, string> = {
  default:
    "bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-sm active:translate-y-0",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm active:translate-y-0",
  outline:
    "border border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] shadow-xs",
  secondary:
    "bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] active:translate-y-0",
  ghost:
    "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
  link:
    "text-[#C45B2A] underline-offset-4 hover:underline p-0 h-auto font-semibold",
  brand:
    "bg-[#C45B2A] text-white hover:bg-[#A94A1F] shadow-[0_4px_14px_rgba(196,91,42,0.28)] hover:shadow-[0_6px_20px_rgba(196,91,42,0.35)] active:translate-y-0",
  brandOutline:
    "border border-[#C45B2A]/30 text-[#C45B2A] bg-[#C45B2A]/5 hover:bg-[#C45B2A]/10 hover:border-[#C45B2A]",
  sidebar:
    "bg-transparent text-slate-300 hover:bg-white/[0.08] hover:text-white active:bg-white/[0.12]",
  sidebarActive:
    "bg-[#C45B2A] text-white shadow-[0_10px_24px_rgba(196,91,42,0.25)] hover:bg-[#A34920]",
  sidebarDanger:
    "bg-transparent text-red-200 hover:bg-red-500/10 hover:text-red-100",
};

const sizeStyles: Record<string, string> = {
  default: "h-9 px-4 py-2 text-sm",
  xs: "h-7 px-2.5 text-xs rounded-md",
  sm: "h-8 rounded-lg px-3 text-xs",
  lg: "h-11 rounded-xl px-6 text-base",
  icon: "h-9 w-9 p-0 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", disabled, ...props }, ref) => {
    const justifyClass = className.includes("justify-") ? "" : "justify-center";
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center ${justifyClass} gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C45B2A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${
          variantStyles[variant] || variantStyles.default
        } ${sizeStyles[size] || sizeStyles.default} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
