import * as React from "react";
import { Slider } from "@/popup/components/ui/slider";
import { Label } from "@/popup/components/ui/label";

export interface SensitivitySliderProps {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * Spoiler-safe strictness slider 0–10. Label and copy do not mention risk levels or keywords.
 */
export function SensitivitySlider({
  value,
  onValueChange,
  disabled = false,
}: SensitivitySliderProps) {
  const handleChange = (values: number[]) => {
    const v = values[0];
    if (typeof v === "number") onValueChange(v);
  };

  return (
    <div className="space-y-2">
      <Label>How strict?</Label>
      <p className="text-xs text-muted-foreground">
        More = block more / Less = block fewer
      </p>
      <Slider
        min={0}
        max={10}
        step={1}
        value={[value]}
        onValueChange={handleChange}
        disabled={disabled}
      />
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
