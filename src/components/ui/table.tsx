import * as React from "react";

export function Table({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  const hasCustomMinW = className.includes("min-w-");
  return (
    <div 
      className="relative w-full overflow-x-auto rounded-2xl border border-[#E2DDD1] bg-[#FAF8F5] shadow-xs"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <table
        className={`w-full ${hasCustomMinW ? "" : "min-w-[650px]"} border-collapse text-xs text-start text-[#334155] ${className}`}
        style={{ tableLayout: "auto" }}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`border-b border-[#E2DDD1] bg-[#EFEBE2] text-xs font-semibold text-[#475569] ${className}`}
      {...props}
    />
  );
}

export function TableBody({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={`divide-y divide-[#EAE5DA] [&_tr:last-child]:border-0 ${className}`}
      {...props}
    />
  );
}

export function TableFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={`border-t border-[#E2DDD1] bg-[#EFEBE2] font-medium text-brand-dark ${className}`}
      {...props}
    />
  );
}

export function TableRow({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`transition-colors hover:bg-[#F2EEE5] data-[state=selected]:bg-[#EAE5DA] ${className}`}
      {...props}
    />
  );
}

export function TableHead({
  className = "",
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-10 px-4 py-2.5 text-start align-middle font-semibold text-[#475569] whitespace-nowrap shrink-0 [&:has([role=checkbox])]:pr-0 ${className}`}
      style={{ display: "table-cell", whiteSpace: "nowrap" }}
      {...props}
    />
  );
}

export function TableCell({
  className = "",
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-4 py-3 align-middle text-xs text-start whitespace-nowrap shrink-0 [&:has([role=checkbox])]:pr-0 ${className}`}
      style={{ display: "table-cell", whiteSpace: "nowrap" }}
      {...props}
    />
  );
}

export function TableCaption({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={`mt-4 text-xs text-[#64748B] ${className}`}
      {...props}
    />
  );
}

