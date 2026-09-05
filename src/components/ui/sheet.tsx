"use client";

import * as React from "react";
import { X } from "lucide-react";

export function Sheet({
  open,
  onOpenChange,
  children,
  side = "right",
  className = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) {
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Slide-over Container */}
      <div className={`fixed inset-y-0 ${side === "right" ? "right-0" : "left-0"} max-w-full flex pl-10 sm:pl-16`}>
        <div className={`w-screen max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col justify-between overflow-y-auto animate-slide-in ${className}`}>
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
    <div className={`p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10 ${className}`}>
      <div className="space-y-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
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
      className={`text-lg font-bold tracking-tight text-[#251516] flex items-center gap-2 ${className}`}
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
  return <div className={`p-6 space-y-6 flex-1 ${className}`} {...props} />;
}

export function SheetFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-6 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end gap-3 sticky bottom-0 z-10 ${className}`}
      {...props}
    />
  );
}
