import React from "react";
import { BackButton } from "../shared/BackButton";
import type { MediaProfile } from "../../../shared/types";

export interface ProfileDetailViewProps {
  profileId: string;
  profiles: MediaProfile[];
  onBack: () => void;
}

export function ProfileDetailView({
  profileId,
  profiles,
  onBack,
}: ProfileDetailViewProps) {
  const profile = profiles.find((p) => p.id === profileId);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <BackButton onClick={onBack} />
      <h2 className="mt-2 text-lg font-semibold">Profile Detail</h2>
      {profile ? (
        <p className="mt-1 text-sm text-gray-500">
          {profile.title} ({profile.mediaType})
        </p>
      ) : (
        <p className="mt-1 text-sm text-gray-500">Profile not found.</p>
      )}
    </div>
  );
}
