import { useState, useCallback, useEffect } from "react";
import { BackButton } from "@/popup/components/shared/BackButton";
import { ProfileStats } from "@/popup/components/profile/ProfileStats";
import { KeywordsSection } from "@/popup/components/profile/KeywordsSection";
import { SensitivitySlider } from "@/popup/components/shared/SensitivitySlider";
import { AllowedAccountsInput } from "@/popup/components/shared/AllowedAccountsInput";
import { LoadingSpinner } from "@/popup/components/shared/LoadingSpinner";
import { Button } from "@/popup/components/ui/button";
import { Input } from "@/popup/components/ui/input";
import { Label } from "@/popup/components/ui/label";
import { Switch } from "@/popup/components/ui/switch";
import { Textarea } from "@/popup/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/popup/components/ui/select";
import { Separator } from "@/popup/components/ui/separator";
import { formatProgress } from "@/popup/lib/progressDisplay";
import { storage } from "@/shared/storage";
import type { MediaProfile } from "@/shared/types";

const MEDIA_TYPES = [
  { value: "book", label: "Book" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "game", label: "Game" },
] as const;
type MediaType = (typeof MEDIA_TYPES)[number]["value"];

function buildUserProgress(
  mediaType: MediaType,
  bookChapter: string,
  bookAdditionalInfo: string,
  tvSeason: string,
  tvEpisode: string,
  gameFreeform: string
): string | undefined {
  switch (mediaType) {
    case "book": {
      const ch = bookChapter.trim();
      if (!ch) return undefined;
      const extra = bookAdditionalInfo.trim();
      return extra ? `${ch}. ${extra}` : ch;
    }
    case "tv": {
      const s = tvSeason.trim();
      const e = tvEpisode.trim();
      if (!s || !e) return undefined;
      return `S${s} E${e}`;
    }
    case "movie":
      return undefined;
    case "game":
      return gameFreeform.trim() || undefined;
    default:
      return undefined;
  }
}

function parseProgress(mediaType: MediaType, userProgress?: string): {
  bookChapter: string;
  bookAdditionalInfo: string;
  tvSeason: string;
  tvEpisode: string;
  gameFreeform: string;
} {
  const empty = {
    bookChapter: "",
    bookAdditionalInfo: "",
    tvSeason: "",
    tvEpisode: "",
    gameFreeform: "",
  };
  const raw = userProgress?.trim() ?? "";
  if (!raw) return empty;
  switch (mediaType) {
    case "book": {
      const dot = raw.indexOf(". ");
      if (dot >= 0)
        return {
          bookChapter: raw.slice(0, dot).trim(),
          bookAdditionalInfo: raw.slice(dot + 2).trim(),
          tvSeason: "",
          tvEpisode: "",
          gameFreeform: "",
        };
      return { ...empty, bookChapter: raw };
    }
    case "tv": {
      const match = raw.match(/S?\s*(\d+)\s*E\s*(\d+)/i);
      if (match)
        return {
          bookChapter: "",
          bookAdditionalInfo: "",
          tvSeason: match[1],
          tvEpisode: match[2],
          gameFreeform: "",
        };
      return empty;
    }
    case "game":
      return { ...empty, gameFreeform: raw };
    default:
      return empty;
  }
}

export interface ProfileDetailViewProps {
  profileId: string;
  profiles: MediaProfile[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onProfileChange?: () => void;
}

export function ProfileDetailView({
  profileId,
  profiles,
  onBack,
  onDelete,
  onProfileChange,
}: ProfileDetailViewProps) {
  const profile = profiles.find((p) => p.id === profileId);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editMediaType, setEditMediaType] = useState<MediaType>("tv");
  const [editBookChapter, setEditBookChapter] = useState("");
  const [editBookAdditionalInfo, setEditBookAdditionalInfo] = useState("");
  const [editTvSeason, setEditTvSeason] = useState("");
  const [editTvEpisode, setEditTvEpisode] = useState("");
  const [editGameFreeform, setEditGameFreeform] = useState("");
  const [editSensitivity, setEditSensitivity] = useState(5);
  const [editAllowedAccounts, setEditAllowedAccounts] = useState<string[]>([]);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && isEditing) {
      setEditTitle(profile.title);
      setEditMediaType(profile.mediaType);
      setEditSensitivity(profile.sensitivity);
      setEditAllowedAccounts(profile.allowedAccounts);
      const parsed = parseProgress(profile.mediaType, profile.userProgress);
      setEditBookChapter(parsed.bookChapter);
      setEditBookAdditionalInfo(parsed.bookAdditionalInfo);
      setEditTvSeason(parsed.tvSeason);
      setEditTvEpisode(parsed.tvEpisode);
      setEditGameFreeform(parsed.gameFreeform);
    }
  }, [profile, isEditing]);

  const handleToggleEnabled = useCallback(async () => {
    if (!profile) return;
    try {
      await storage.toggleProfile(profileId);
      onProfileChange?.();
    } catch (e) {
      console.error("Error toggling:", e);
    }
  }, [profileId, profile, onProfileChange]);

  const handleRegenerate = useCallback(async () => {
    if (!profile) return;
    setRegenerateError(null);
    setRegenerating(true);
    try {
      setRegenerateError("Keyword generation is not configured (OpenRouter skipped).");
    } finally {
      setRegenerating(false);
    }
  }, [profile]);

  const handleSaveEdit = useCallback(async () => {
    if (!profile) return;
    setEditError(null);
    if (!editTitle.trim()) {
      setEditError("Title is required.");
      return;
    }
    if (editMediaType === "book" && !editBookChapter.trim()) {
      setEditError("Chapter is required for Book.");
      return;
    }
    if (editMediaType === "tv" && (!editTvSeason.trim() || !editTvEpisode.trim())) {
      setEditError("Season and episode are required for TV.");
      return;
    }
    const userProgress = buildUserProgress(
      editMediaType,
      editBookChapter,
      editBookAdditionalInfo,
      editTvSeason,
      editTvEpisode,
      editGameFreeform
    );
    const updated: MediaProfile = {
      ...profile,
      title: editTitle.trim(),
      mediaType: editMediaType,
      userProgress,
      sensitivity: editSensitivity,
      allowedAccounts: editAllowedAccounts,
    };
    try {
      await storage.saveProfile(updated);
      onProfileChange?.();
      setIsEditing(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to save.");
    }
  }, [
    profile,
    editTitle,
    editMediaType,
    editBookChapter,
    editBookAdditionalInfo,
    editTvSeason,
    editTvEpisode,
    editGameFreeform,
    editSensitivity,
    editAllowedAccounts,
    onProfileChange,
  ]);

  if (!profile) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <BackButton onClick={onBack} />
        <h2 className="mt-2 text-lg font-semibold">Media Detail</h2>
        <p className="mt-1 text-sm text-muted-foreground">Media not found.</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4">
        <BackButton onClick={() => setIsEditing(false)} />
        <h2 className="mt-2 text-lg font-semibold">Edit Media</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Media type</Label>
            <Select
              value={editMediaType}
              onValueChange={(v) => setEditMediaType(v as MediaType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Media type" />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {editMediaType === "book" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-book-chapter">Which chapter you're on</Label>
                <Input
                  id="edit-book-chapter"
                  placeholder="e.g. Chapter 5"
                  value={editBookChapter}
                  onChange={(e) => setEditBookChapter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-book-info">Additional info (optional)</Label>
                <Textarea
                  id="edit-book-info"
                  placeholder="e.g. just finished the trial"
                  value={editBookAdditionalInfo}
                  onChange={(e) => setEditBookAdditionalInfo(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}
          {editMediaType === "tv" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Which episode you're on</p>
              <div className="flex gap-2">
              <div className="space-y-2 flex-1">
                <Label htmlFor="edit-tv-season">Season</Label>
                <Input
                  id="edit-tv-season"
                  type="number"
                  min={1}
                  value={editTvSeason}
                  onChange={(e) => setEditTvSeason(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="edit-tv-episode">Episode</Label>
                <Input
                  id="edit-tv-episode"
                  type="number"
                  min={1}
                  value={editTvEpisode}
                  onChange={(e) => setEditTvEpisode(e.target.value)}
                />
              </div>
              </div>
            </div>
          )}
          {editMediaType === "game" && (
            <div className="space-y-2">
              <Label htmlFor="edit-game">Where you're at</Label>
              <Textarea
                id="edit-game"
                placeholder="e.g. Just beat first boss"
                value={editGameFreeform}
                onChange={(e) => setEditGameFreeform(e.target.value)}
                rows={2}
              />
            </div>
          )}
          <SensitivitySlider
            value={editSensitivity}
            onValueChange={setEditSensitivity}
          />
          <div className="space-y-2">
            <Label>Allowed accounts</Label>
            <AllowedAccountsInput
              value={editAllowedAccounts}
              onChange={setEditAllowedAccounts}
            />
          </div>
          {editError && (
            <p className="text-sm text-destructive">{editError}</p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSaveEdit}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progressDisplay =
    profile.mediaType === "game"
      ? profile.userProgress ?? ""
      : profile.mediaType === "movie"
        ? null
        : formatProgress(profile);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4">
      <BackButton onClick={onBack} />
      <div className="mt-2 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold truncate">{profile.title}</h2>
        <Switch
          checked={profile.enabled}
          onCheckedChange={handleToggleEnabled}
          aria-label={profile.enabled ? "Disable" : "Enable"}
        />
      </div>

      <div className="mt-4 space-y-4">
          {profile.mediaType !== "game" && (
            <>
              <div>
                <p className="text-sm text-muted-foreground capitalize">{profile.mediaType}</p>
              </div>
              <Separator />
            </>
          )}

          {progressDisplay != null && progressDisplay !== "" && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-1">Progress</h3>
                <p className="text-sm text-muted-foreground">{progressDisplay}</p>
              </div>
              <Separator />
            </>
          )}

          <div>
            <h3 className="text-sm font-medium mb-1">Blocking Strictness</h3>
            <p className="text-sm text-muted-foreground">{profile.sensitivity}/10</p>
          </div>
          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-1">Stats</h3>
            <ProfileStats profile={profile} />
          </div>
          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-1">Allowed accounts</h3>
            {profile.allowedAccounts.length > 0 ? (
              <ul className="text-sm text-muted-foreground">
                {profile.allowedAccounts.map((handle) => (
                  <li key={handle}>@{handle}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None</p>
            )}
          </div>
          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-1">Keywords</h3>
            <KeywordsSection keywords={profile.keywords} />
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="accent"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <>
                <LoadingSpinner className="mr-2" />
                Regenerating…
              </>
            ) : (
              "Regenerate keywords"
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(profileId)}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
          {regenerateError && (
            <p className="w-full text-sm text-destructive">{regenerateError}</p>
          )}
          </div>
      </div>
    </div>
  );
}
