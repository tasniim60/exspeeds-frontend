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
    | "brandOutline";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
}

const variantStyles: Record<string, string> = {
  default:
    "bg-[#251516] text-white hover:bg-[#382122] shadow-sm active:scale-[0.98]",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]",
  outline:
    "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 shadow-xs",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98]",
  ghost:
    "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
  link:
    "text-[#C45B2A] underline-offset-4 hover:underline p-0 h-auto font-medium",
  brand:
    "bg-[#C45B2A] text-white hover:bg-[#A34920] shadow-sm hover:shadow active:scale-[0.98]",
  brandOutline:
    "border border-[#C45B2A]/40 text-[#C45B2A] bg-[#C45B2A]/5 hover:bg-[#C45B2A]/10",
};

const sizeStyles: Record<string, string> = {
  default: "h-9 px-4 py-2 text-sm",
  xs: "h-7 px-2.5 text-xs",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-11 rounded-lg px-6 text-base",
  icon: "h-9 w-9 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C45B2A]/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${
          variantStyles[variant] || variantStyles.default
        } ${sizeStyles[size] || sizeStyles.default} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
