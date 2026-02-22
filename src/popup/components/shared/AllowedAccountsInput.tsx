import * as React from "react";
import { Input } from "@/popup/components/ui/input";
import { Button } from "@/popup/components/ui/button";
import { X } from "lucide-react";

export interface AllowedAccountsInputProps {
  value: string[];
  onChange: (accounts: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, "");
}

export function AllowedAccountsInput({
  value,
  onChange,
  disabled = false,
  placeholder = "Add account handle",
}: AllowedAccountsInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleAdd = () => {
    const normalized = normalizeHandle(inputValue);
    if (!normalized) return;
    if (value.includes(normalized)) {
      setInputValue("");
      return;
    }
    onChange([...value, normalized]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (account: string) => {
    onChange(value.filter((a) => a !== account));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled || !normalizeHandle(inputValue)}
        >
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((account) => (
            <li
              key={account}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 text-sm"
            >
              @{account}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(account)}
                  className="rounded p-0.5 hover:bg-muted"
                  aria-label={`Remove ${account}`}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
