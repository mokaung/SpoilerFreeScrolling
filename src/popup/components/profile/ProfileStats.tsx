import type { MediaProfile } from "@/shared/types";

export interface ProfileStatsProps {
  profile: MediaProfile;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const { stats, createdAt } = profile;
  const tweetsBlocked = stats.tweetsBlocked ?? 0;
  const lastBlocked = stats.lastBlocked
    ? formatDateTime(stats.lastBlocked)
    : "Never";
  const activeSince = formatDate(createdAt);

  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Tweets blocked</span>
        <span>{tweetsBlocked}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Last blocked</span>
        <span>{lastBlocked}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Active since</span>
        <span>{activeSince}</span>
      </div>
    </div>
  );
}
