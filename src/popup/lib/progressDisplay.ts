import type { MediaProfile } from "@/shared/types";

/** Format progress for display by media type. Returns empty string for Movie. */
export function formatProgress(profile: MediaProfile): string {
  const { mediaType, userProgress } = profile;
  if (!userProgress?.trim()) return "";

  switch (mediaType) {
    case "book":
      return userProgress.length > 20
        ? userProgress.slice(0, 18) + "…"
        : userProgress.replace(/^chapter\s+/i, "Ch ");
    case "tv":
      return userProgress; // e.g. "S3 E5"
    case "movie":
      return "";
    case "game":
      return userProgress.length > 24 ? userProgress.slice(0, 22) + "…" : userProgress;
    default:
      return userProgress;
  }
}
