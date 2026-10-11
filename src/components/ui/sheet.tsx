"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!open || !mounted) return null;

  const hasCustomMaxW = /\bmax-w-/.test(className);
  const defaultWidthClasses = hasCustomMaxW ? "" : "sm:max-w-xl md:max-w-2xl lg:max-w-3xl";

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
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
          className={`w-screen sm:w-[90vw] ${defaultWidthClasses} h-[100dvh] max-h-[100dvh] bg-white shadow-2xl ${
            effectiveSide === "left"
              ? "border-r border-gray-200 animate-drawer-left"
              : "border-l border-gray-200 animate-drawer-right"
          } flex flex-col justify-between overflow-hidden ${className}`}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
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
      className={`shrink-0 p-3.5 sm:p-5 border-b border-gray-100 flex items-start sm:items-center justify-between bg-white z-10 gap-2 ${className}`}
    >
      <div className="space-y-1 min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0 cursor-pointer -me-1 sm:me-0"
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
      className={`text-base sm:text-lg font-bold tracking-tight text-brand-dark flex items-center gap-2 ${className}`}
      {...props}
    />
  );
}

export function SheetDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-gray-500 font-normal ${className}`} {...props} />
  );
}

export function SheetContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 space-y-4 sm:space-y-5 ${className}`} {...props} />;
}

export function SheetFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`shrink-0 p-3 sm:p-4 border-t border-gray-100 bg-gray-50/90 flex items-center justify-end gap-3 z-10 ${className}`}
      {...props}
    />
  );
}
