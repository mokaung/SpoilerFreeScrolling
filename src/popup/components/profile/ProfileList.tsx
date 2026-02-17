import React from "react";
import { ProfileListRow } from "./ProfileListRow";
import type { MediaProfile } from "../../../shared/types";

export interface ProfileListProps {
  profiles: MediaProfile[];
  onSelectProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onToggleEnabled: (id: string) => void;
}

export function ProfileList({
  profiles,
  onSelectProfile,
  onDeleteProfile,
  onToggleEnabled,
}: ProfileListProps) {
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {profiles.map((profile) => (
        <li key={profile.id}>
          <ProfileListRow
            profile={profile}
            onSelect={() => onSelectProfile(profile.id)}
            onDelete={() => onDeleteProfile(profile.id)}
            onToggleEnabled={() => onToggleEnabled(profile.id)}
          />
        </li>
      ))}
    </ul>
  );
}
