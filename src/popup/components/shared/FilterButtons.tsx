import React from "react";
import type { MediaProfile } from "@/shared/types";

const FILTER_OPTIONS: { value: "all" | MediaProfile["mediaType"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "game", label: "Game" },
  { value: "book", label: "Book" },
];

export type FilterValue = "all" | MediaProfile["mediaType"];

export interface FilterButtonsProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

// Define base classes so there's no duplication
const baseClasses =
  "flex-1 rounded-md text-sm font-medium cursor-pointer select-none flex items-center justify-center h-9 px-4 border transition-all";

export function FilterButtons({ value, onChange }: FilterButtonsProps) {
  return (
    <div className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
      <div className="flex gap-1">
        {FILTER_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <div
              key={opt.value}
              role="button"
              tabIndex={-1}
              className={`${baseClasses} ${
                selected
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
              }}
            >
              {opt.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
