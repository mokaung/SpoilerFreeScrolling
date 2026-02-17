import React from "react";
import { BackButton } from "../shared/BackButton";

export interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <BackButton onClick={onBack} />
      <h2 className="mt-2 text-lg font-semibold">Settings</h2>
      <p className="mt-1 text-sm text-gray-500">
        Keyword generation uses OpenRouter (free models). No setup needed.
      </p>
    </div>
  );
}
