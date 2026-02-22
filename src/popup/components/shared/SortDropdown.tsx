import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/popup/components/ui/select";

export const SORT_OPTIONS = [
  { value: "a-z", label: "A–Z" },
  { value: "z-a", label: "Z–A" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "enabled", label: "Enabled First" },
] as const;


// The sort value is the active sort option the user has selected
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export interface SortDropdownProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortValue)}>
      <SelectTrigger className="min-w-[140px] w-full">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
