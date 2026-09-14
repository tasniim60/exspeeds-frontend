"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Sheet({
  open,
  onOpenChange,
  children,
  side,
  className = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) {
  const { isRTL } = useLanguage();
  // In RTL, the sidebar is on the right -> drawer opens on the left ("left").
  // In LTR, the sidebar is on the left -> drawer opens on the right ("right").
  const effectiveSide = side !== undefined ? side : isRTL ? "left" : "right";

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Slide-over Container */}
      <div
        className={`fixed inset-y-0 ${
          effectiveSide === "left"
            ? "left-0 pr-0 sm:pr-8 md:pr-12"
            : "right-0 pl-0 sm:pl-8 md:pl-12"
        } max-w-full flex z-50`}
      >
        <div
          className={`w-screen max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white shadow-2xl ${
            effectiveSide === "left"
              ? "border-r border-gray-200 animate-drawer-left"
              : "border-l border-gray-200 animate-drawer-right"
          } flex flex-col justify-between overflow-y-auto ${className}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function SheetHeader({
  className = "",
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className={`p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10 ${className}`}
    >
      <div className="space-y-1 min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0 cursor-pointer"
          aria-label="Close drawer"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function SheetTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`text-base sm:text-lg font-bold tracking-tight text-[#0F172A] flex items-center gap-2 ${className}`}
      {...props}
    />
  );
}

export function SheetDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-gray-500 font-normal truncate ${className}`} {...props} />
  );
}

export function SheetContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-x-hidden ${className}`} {...props} />;
}

export function SheetFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-4 sm:p-6 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end gap-3 sticky bottom-0 z-10 ${className}`}
      {...props}
    />
  );
}
