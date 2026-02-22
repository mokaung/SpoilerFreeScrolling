import { useState, useCallback } from "react";
import { BackButton } from "@/popup/components/shared/BackButton";
import { SensitivitySlider } from "@/popup/components/shared/SensitivitySlider";
import { AllowedAccountsInput } from "@/popup/components/shared/AllowedAccountsInput";
import { Button } from "@/popup/components/ui/button";
import { Input } from "@/popup/components/ui/input";
import { Label } from "@/popup/components/ui/label";
import { Textarea } from "@/popup/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/popup/components/ui/select";
import { storage } from "@/shared/storage";
import type { MediaProfile } from "@/shared/types";

const MEDIA_TYPES = [
  { value: "book", label: "Book" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "game", label: "Game" },
] as const;
type MediaType = (typeof MEDIA_TYPES)[number]["value"];

function getTitleHint(mediaType: MediaType): string {
  switch (mediaType) {
    case "book":
      return "What did you read recently?";
    case "tv":
    case "movie":
      return "What did you watch recently?";
    case "game":
      return "What did you play recently?";
    default:
      return "What did you watch recently?";
  }
}

function getTitlePlaceholder(mediaType: MediaType): string {
  switch (mediaType) {
    case "book":
      return "E.g. The Way of Kings";
    case "tv":
      return "E.g. Severance";
    case "movie":
      return "E.g. Howl's Moving Castle";
    case "game":
      return "E.g. Yakuza series";
    default:
      return "E.g. Banana Gaming 2004";
  }
}

export interface CreateProfileViewProps {
  onBack: () => void;
  onCreated?: () => void;
}

function buildUserProgress(
  mediaType: MediaType,
  bookChapter: string,
  bookAdditionalInfo: string,
  tvSeason: string,
  tvEpisode: string,
  gameFreeform: string,
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

export function CreateProfileView({
  onBack,
  onCreated,
}: CreateProfileViewProps) {
  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("tv");
  const [bookChapter, setBookChapter] = useState("");
  const [bookAdditionalInfo, setBookAdditionalInfo] = useState("");
  const [tvSeason, setTvSeason] = useState("");
  const [tvEpisode, setTvEpisode] = useState("");
  const [gameFreeform, setGameFreeform] = useState("");
  const [sensitivity, setSensitivity] = useState(5);
  const [allowedAccounts, setAllowedAccounts] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = useCallback((): boolean => {
    if (!title.trim()) {
      setValidationError("Title is required.");
      return false;
    }
    if (mediaType === "book" && !bookChapter.trim()) {
      setValidationError("Chapter is required for Book.");
      return false;
    }
    if (mediaType === "tv" && (!tvSeason.trim() || !tvEpisode.trim())) {
      setValidationError("Season and episode are required for TV.");
      return false;
    }
    setValidationError(null);
    return true;
  }, [
    title,
    mediaType,
    bookChapter,
    bookAdditionalInfo,
    tvSeason,
    tvEpisode,
    gameFreeform,
  ]);

  const handleSave = useCallback(async () => {
    // #region agent log
    const valid = validate();
    if (!valid) fetch('http://127.0.0.1:7242/ingest/1e26f52c-5f07-47cf-b000-ca34bbc4417b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateProfileView.tsx:handleSave',message:'Validation failed',data:{validationError,title:title.trim(),mediaType},timestamp:Date.now(),hypothesisId:'validation'})}).catch(()=>{});
    // #endregion
    if (!valid) return;
    const userProgress = buildUserProgress(
      mediaType,
      bookChapter,
      bookAdditionalInfo,
      tvSeason,
      tvEpisode,
      gameFreeform,
    );
    const profile: MediaProfile = {
      id: storage.generateId(),
      title: title.trim(),
      mediaType,
      userProgress,
      keywords: [],
      sensitivity,
      allowedAccounts,
      useAIClassifier: false,
      enabled: true,
      createdAt: Date.now(),
      stats: { tweetsBlocked: 0 },
    };
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1e26f52c-5f07-47cf-b000-ca34bbc4417b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateProfileView.tsx:handleSave',message:'Create profile payload',data:{profile:{id:profile.id,title:profile.title,mediaType:profile.mediaType,userProgress:profile.userProgress,sensitivity:profile.sensitivity,allowedAccounts:profile.allowedAccounts,keywordsCount:profile.keywords.length,createdAt:profile.createdAt,stats:profile.stats}},timestamp:Date.now(),hypothesisId:'payload'})}).catch(()=>{});
    // #endregion
    try {
      await storage.saveProfile(profile);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1e26f52c-5f07-47cf-b000-ca34bbc4417b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateProfileView.tsx:handleSave',message:'Save profile success',data:{profileId:profile.id},timestamp:Date.now(),hypothesisId:'success'})}).catch(()=>{});
      // #endregion
      onCreated?.();
    } catch (e) {
      // #region agent log
      const err = e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : { raw: String(e) };
      fetch('http://127.0.0.1:7242/ingest/1e26f52c-5f07-47cf-b000-ca34bbc4417b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateProfileView.tsx:handleSave',message:'Save profile error',data:err,timestamp:Date.now(),hypothesisId:'error'})}).catch(()=>{});
      // #endregion
      console.error("Failed to save profile:", e);
      const message = e instanceof Error ? e.message : "Failed to save. Try again.";
      setValidationError(message);
    }
  }, [
    validate,
    title,
    mediaType,
    bookChapter,
    bookAdditionalInfo,
    tvSeason,
    tvEpisode,
    gameFreeform,
    sensitivity,
    allowedAccounts,
    onCreated,
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4">
      <BackButton onClick={onBack} />
      <h2 className="mt-2 text-lg font-semibold">Create Media</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {getTitleHint(mediaType)}
      </p>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="create-title">Title</Label>
          <Input
            id="create-title"
            placeholder={getTitlePlaceholder(mediaType)}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Media type</Label>
          <Select
            value={mediaType}
            onValueChange={(v) => setMediaType(v as MediaType)}
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

        {mediaType === "book" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="create-book-chapter">Which chapter you're on</Label>
              <Input
                id="create-book-chapter"
                placeholder="e.g. Chapter 5"
                value={bookChapter}
                onChange={(e) => setBookChapter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-book-info">
                Additional info (optional)
              </Label>
              <Textarea
                id="create-book-info"
                placeholder="e.g. just finished the trial"
                value={bookAdditionalInfo}
                onChange={(e) => setBookAdditionalInfo(e.target.value)}
                rows={2}
              />
            </div>
          </>
        )}

        {mediaType === "tv" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Which episode you're on</p>
            <div className="flex gap-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="create-tv-season">Season</Label>
              <Input
                id="create-tv-season"
                type="number"
                min={1}
                placeholder="3"
                value={tvSeason}
                onChange={(e) => setTvSeason(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="create-tv-episode">Episode</Label>
              <Input
                id="create-tv-episode"
                type="number"
                min={1}
                placeholder="5"
                value={tvEpisode}
                onChange={(e) => setTvEpisode(e.target.value)}
              />
            </div>
            </div>
          </div>
        )}

        {mediaType === "game" && (
          <div className="space-y-2">
            <Label htmlFor="create-game">Where you're at</Label>
            <Textarea
              id="create-game"
              placeholder="e.g. Just beat first boss, in swamp"
              value={gameFreeform}
              onChange={(e) => setGameFreeform(e.target.value)}
              rows={2}
            />
          </div>
        )}

        <SensitivitySlider value={sensitivity} onValueChange={setSensitivity} />

        <div className="space-y-2">
          <Label>Allowed accounts</Label>
          <AllowedAccountsInput
            value={allowedAccounts}
            onChange={setAllowedAccounts}
          />
        </div>

        {validationError && (
          <p className="text-sm text-destructive">{validationError}</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
