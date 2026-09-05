"use client";

import * as React from "react";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({
  value,
  defaultValue = "",
  onValueChange,
  children,
  className = "",
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [tabValue, setTabValue] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setTabValue(value);
    }
  }, [value]);

  const handleValueChange = (val: string) => {
    if (value === undefined) {
      setTabValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: tabValue, onValueChange: handleValueChange }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gray-100/90 p-1 text-gray-500 border border-gray-200/60 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = "",
  badge,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; badge?: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs md:text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
        isActive
          ? "bg-white text-gray-900 shadow-xs border border-gray-200/60"
          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
      } ${className}`}
      {...props}
    >
      {children}
      {badge}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;

  return (
    <div
      className={`mt-4 focus-visible:outline-none animate-fadeIn ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
