import React from "react";
import { BackButton } from "../shared/BackButton";

export interface CreateProfileViewProps {
  onBack: () => void;
}

export function CreateProfileView({ onBack }: CreateProfileViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <BackButton onClick={onBack} />
      <h2 className="mt-2 text-lg font-semibold">Create Profile</h2>
      <p className="mt-1 text-sm text-gray-500">(Form coming next)</p>
    </div>
  );
}
