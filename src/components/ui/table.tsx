import * as React from "react";

export function Table({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-gray-200/90 bg-white shadow-2xs">
      <table
        className={`w-full min-w-[1800px] border-collapse text-xs text-start text-gray-700 ${className}`}
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
      className={`border-b border-gray-200 bg-gray-50/90 text-xs font-bold text-gray-700 ${className}`}
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
      className={`divide-y divide-gray-100 [&_tr:last-child]:border-0 ${className}`}
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
      className={`border-t border-gray-200 bg-gray-50 font-medium text-gray-900 ${className}`}
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
      className={`transition-colors hover:bg-gray-50/80 data-[state=selected]:bg-gray-100 ${className}`}
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
      className={`h-11 px-4 py-3 text-start align-middle font-bold text-gray-700 whitespace-nowrap shrink-0 [&:has([role=checkbox])]:pr-0 ${className}`}
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
      className={`mt-4 text-xs text-gray-500 ${className}`}
      {...props}
    />
  );
}
