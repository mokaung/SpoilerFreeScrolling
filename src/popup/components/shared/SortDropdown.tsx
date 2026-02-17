import React from "react";
import { ChevronDown } from "lucide-react";

export const SORT_OPTIONS = [
  { value: "a-z", label: "A–Z" },
  { value: "z-a", label: "Z–A" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "enabled", label: "Enabled First" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export interface SortDropdownProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="relative inline-block min-w-[140px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortValue)}
        className="h-9 w-full appearance-none rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-3 pr-8 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
    </div>
  );
}
