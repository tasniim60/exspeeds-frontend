"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-up">
      {/* Backdrop click dismiss */}
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>,
    document.body
  );
}

export function DialogContent({
  className = "",
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const hasCustomMaxW = className.includes("max-w-");
  const hasCustomPadding = className.includes("p-0") || className.includes("p-");

  return (
    <div
      className={`relative z-[100000] w-full ${hasCustomMaxW ? "" : "max-w-lg"} max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden ${className}`}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <div className={`flex-1 overflow-y-auto ${hasCustomPadding ? "" : "p-6 sm:p-8"}`}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-left border-b border-gray-100 pb-4 mb-5 ${className}`}
      {...props}
    />
  );
}

export function DialogTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`text-lg sm:text-xl font-bold tracking-tight text-[#251516] flex items-center gap-2 ${className}`}
      {...props}
    />
  );
}

export function DialogDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-xs text-gray-500 font-normal leading-relaxed ${className}`}
      {...props}
    />
  );
}

export function DialogFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-gray-100 mt-6 gap-2 ${className}`}
      {...props}
    />
  );
}
