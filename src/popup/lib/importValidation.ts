import type { MediaProfile, KeyWordRule } from "@/shared/types";

const MEDIA_TYPES = ["book", "tv", "movie", "game"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

function isMediaType(v: unknown): v is MediaType {
  return typeof v === "string" && MEDIA_TYPES.includes(v as MediaType);
}

function isValidKeyword(v: unknown): v is KeyWordRule {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.term === "string" &&
    typeof o.riskLevel === "number" &&
    o.riskLevel >= 0 &&
    o.riskLevel <= 10
  );
}

function isValidStats(v: unknown): MediaProfile["stats"] | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.tweetsBlocked !== "number") return null;
  if (o.lastBlocked !== undefined && typeof o.lastBlocked !== "number")
    return null;
  return {
    tweetsBlocked: o.tweetsBlocked,
    lastBlocked: o.lastBlocked as number | undefined,
  };
}

export interface ImportResult {
  valid: MediaProfile[];
  skipped: { index: number; reason: string }[];
}

/**
 * Validates an array of unknown items into MediaProfile[].
 * Invalid items are skipped; reasons are collected.
 * Does not check for duplicate IDs (caller should filter against existing).
 */
export function validateImportData(data: unknown): ImportResult {
  const valid: MediaProfile[] = [];
  const skipped: { index: number; reason: string }[] = [];

  if (!Array.isArray(data)) {
    return { valid: [], skipped: [] };
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item || typeof item !== "object") {
      skipped.push({ index: i + 1, reason: "Invalid or missing profile" });
      continue;
    }
    const o = item as Record<string, unknown>;

    if (typeof o.id !== "string" || !o.id.trim()) {
      skipped.push({ index: i + 1, reason: "Missing or invalid id" });
      continue;
    }
    if (typeof o.title !== "string" || !o.title.trim()) {
      skipped.push({ index: i + 1, reason: "Missing or invalid title" });
      continue;
    }
    if (!isMediaType(o.mediaType)) {
      skipped.push({ index: i + 1, reason: "Invalid media type" });
      continue;
    }
    if (!Array.isArray(o.keywords)) {
      skipped.push({ index: i + 1, reason: "Keywords must be an array" });
      continue;
    }
    const keywords: KeyWordRule[] = [];
    for (let k = 0; k < o.keywords.length; k++) {
      if (!isValidKeyword(o.keywords[k])) {
        skipped.push({
          index: i + 1,
          reason: `Invalid keyword at position ${k + 1}`,
        });
        keywords.length = 0;
        break;
      }
      keywords.push(o.keywords[k] as KeyWordRule);
    }
    if (keywords.length !== o.keywords.length) continue;

    if (typeof o.sensitivity !== "number" || o.sensitivity < 0 || o.sensitivity > 10) {
      skipped.push({ index: i + 1, reason: "Invalid sensitivity (must be 0–10)" });
      continue;
    }
    if (!Array.isArray(o.allowedAccounts)) {
      skipped.push({ index: i + 1, reason: "Allowed accounts must be an array" });
      continue;
    }
    const allowedAccounts = o.allowedAccounts.every((a: unknown) => typeof a === "string")
      ? (o.allowedAccounts as string[])
      : [];
    if (o.allowedAccounts.length !== allowedAccounts.length) {
      skipped.push({ index: i + 1, reason: "Allowed accounts must be strings" });
      continue;
    }
    if (typeof o.enabled !== "boolean") {
      skipped.push({ index: i + 1, reason: "Missing or invalid enabled" });
      continue;
    }
    if (typeof o.createdAt !== "number") {
      skipped.push({ index: i + 1, reason: "Missing or invalid createdAt" });
      continue;
    }
    const stats = isValidStats(o.stats);
    if (!stats) {
      skipped.push({ index: i + 1, reason: "Invalid stats" });
      continue;
    }
    if (typeof o.useAIClassifier !== "boolean") {
      skipped.push({ index: i + 1, reason: "Missing or invalid useAIClassifier" });
      continue;
    }
    const userProgress =
      o.userProgress !== undefined && o.userProgress !== null
        ? String(o.userProgress)
        : undefined;

    valid.push({
      id: String(o.id).trim(),
      title: String(o.title).trim(),
      mediaType: o.mediaType,
      userProgress: userProgress?.trim() || undefined,
      keywords,
      sensitivity: o.sensitivity,
      allowedAccounts,
      enabled: o.enabled,
      createdAt: o.createdAt,
      stats,
      useAIClassifier: o.useAIClassifier,
    });
  }

  return { valid, skipped };
}
