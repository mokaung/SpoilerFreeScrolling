import React from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/popup/components/ui/button";
import { Switch } from "@/popup/components/ui/switch";
import { formatProgress } from "@/popup/lib/progressDisplay";
import type { MediaProfile } from "@/shared/types";

export interface ProfileListRowProps {
  profile: MediaProfile;
  onSelect: () => void;
  onDelete: () => void;
  onToggleEnabled: () => void;
}

export function ProfileListRow({
  profile,
  onSelect,
  onDelete,
  onToggleEnabled,
}: ProfileListRowProps) {
  const progress = formatProgress(profile);

  return (
    // The row is a button that navigates to the profile detail view
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className="flex items-center gap-2 py-3 px-2 -mx-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
    >
      {/* The switch is a button that toggles the enabled state of the profile */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center shrink-0"
      >
        <Switch
          checked={profile.enabled}
          onCheckedChange={onToggleEnabled}
          className="shrink-0"
          aria-label={`${profile.enabled ? "Disable" : "Enable"} spoiler blocking for ${profile.title}`}
        />
      </div>
      <div className="min-w-0 flex-1 flex items-center gap-2 min-h-[1.5rem]">
        <span className="font-medium text-gray-900 dark:text-white truncate text-sm leading-5">
          {profile.title}
        </span>
        {/* The progress is displayed for all media types except Movie */}
        {profile.mediaType !== "movie" && progress && (
          <span className="shrink-0 text-gray-500 dark:text-gray-400 tabular-nums text-sm leading-5">
            {progress}
          </span>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      {/* The delete button brings up the delete confirmation modal */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete media"
      >
        <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </Button>
    </div>
  );
}
