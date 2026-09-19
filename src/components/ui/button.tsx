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
    "bg-brand-dark text-white hover:bg-brand-dark-hover shadow-sm active:translate-y-0",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm active:translate-y-0",
  outline:
    "border border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] shadow-xs",
  secondary:
    "bg-[#F1F5F9] text-brand-dark hover:bg-[#E2E8F0] active:translate-y-0",
  ghost:
    "text-[#64748B] hover:bg-[#F1F5F9] hover:text-brand-dark",
  link:
    "text-brand-orange underline-offset-4 hover:underline p-0 h-auto font-semibold",
  brand:
    "bg-brand-orange text-white hover:bg-brand-orange-deep shadow-[0_4px_14px_rgba(196,91,42,0.28)] hover:shadow-[0_6px_20px_rgba(196,91,42,0.35)] active:translate-y-0",
  brandOutline:
    "border border-brand-orange/30 text-brand-orange bg-brand-orange/5 hover:bg-brand-orange/10 hover:border-brand-orange",
  success:
    "bg-emerald-50 text-emerald-950 border border-emerald-300 hover:bg-emerald-100 shadow-2xs active:translate-y-0",
  sidebar:
    "bg-transparent text-slate-300 hover:bg-white/[0.08] hover:text-white active:bg-white/[0.12]",
  sidebarActive:
    "bg-brand-orange text-white shadow-[0_10px_24px_rgba(196,91,42,0.25)] hover:bg-brand-orange-deep",
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
    let baseVariant = variantStyles[variant] || variantStyles.default;

    // Filter out default text/bg/border colors from variant if caller provided custom ones in className
    if (/(?:^|\s)text-(?!(?:xs|sm|base|lg|xl|2xl|3xl|4xl|left|right|center|justify|start|end)\b)[^\s]+/.test(className)) {
      baseVariant = baseVariant.replace(/(?:^|\s)text-[^\s]+/g, "");
    }
    if (/(?:^|\s)bg-[^\s]+/.test(className)) {
      baseVariant = baseVariant.replace(/(?:^|\s)bg-[^\s]+/g, "");
    }
    if (/(?:^|\s)border-[^\s]+/.test(className)) {
      baseVariant = baseVariant.replace(/(?:^|\s)border-[^\s]+/g, "");
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center ${justifyClass} gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C45B2A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${baseVariant} ${
          sizeStyles[size] || sizeStyles.default
        } ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
