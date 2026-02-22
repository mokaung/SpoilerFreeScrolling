import React, { useState, useRef, useCallback } from "react";
import { BackButton } from "@/popup/components/shared/BackButton";
import { Button } from "@/popup/components/ui/button";
import { Separator } from "@/popup/components/ui/separator";
import { DeleteConfirmModal } from "@/popup/components/shared/DeleteConfirmModal";
import { MessageModal } from "@/popup/components/shared/MessageModal";
import { storage } from "@/shared/storage";
import { validateImportData } from "@/popup/lib/importValidation";

export interface SettingsViewProps {
  onBack: () => void;
  onProfilesChange?: () => void;
}

export function SettingsView({ onBack, onProfilesChange }: SettingsViewProps) {
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState("Message");
  const [messageLines, setMessageLines] = useState<string[]>([]);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = useCallback((title: string, lines: string | string[]) => {
    setMessageTitle(title);
    setMessageLines(Array.isArray(lines) ? lines : [lines]);
    setMessageOpen(true);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const profiles = await storage.getProfiles();
      const json = JSON.stringify(profiles, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spoiler-free-profiles-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showMessage("Export failed", "Could not export profiles. Try again.");
    }
  }, [showMessage]);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsText(file);
        });
        let data: unknown;
        try {
          data = JSON.parse(text);
        } catch {
          showMessage("Import failed", "Could not read file. Please choose a valid JSON export.");
          return;
        }
        if (!Array.isArray(data)) {
          showMessage("Import failed", "File must contain a JSON array of profiles.");
          return;
        }
        const { valid, skipped } = validateImportData(data);
        const existing = await storage.getProfiles();
        const existingIds = new Set(existing.map((p) => p.id));
        const duplicateSkipped: { index: number; reason: string }[] = [];
        const toAdd = valid.filter((p) => {
          if (existingIds.has(p.id)) {
            duplicateSkipped.push({
              index: valid.indexOf(p) + 1,
              reason: "Profile already exists (duplicate ID)",
            });
            return false;
          }
          return true;
        });
        const allSkipped = [...skipped, ...duplicateSkipped];
        await storage.setProfiles(existing.concat(toAdd));
        onProfilesChange?.();
        if (allSkipped.length === 0) {
          showMessage("Import result", `${toAdd.length} profile${toAdd.length === 1 ? "" : "s"} added.`);
        } else {
          const skipReasons = allSkipped
            .map((s) => `Row ${s.index}: ${s.reason}`)
            .join("\n");
          showMessage(
            "Import result",
            `${toAdd.length} profile${toAdd.length === 1 ? "" : "s"} added. ${allSkipped.length} skipped:\n${skipReasons}`.split("\n")
          );
        }
      } catch (err) {
        showMessage("Import failed", "Something went wrong. Please try again.");
      }
    },
    [showMessage, onProfilesChange]
  );

  const handleDeleteAllConfirm = useCallback(async () => {
    try {
      await storage.deleteAllProfiles();
      setDeleteAllOpen(false);
      await onProfilesChange?.();
      onBack();
    } catch {
      showMessage("Error", "Could not delete all profiles. Try again.");
    }
  }, [onProfilesChange, onBack, showMessage]);

  const manifest =
    typeof chrome !== "undefined" && chrome.runtime?.getManifest
      ? chrome.runtime.getManifest()
      : null;
  const extensionName = manifest?.name ?? "Spoiler Free Scrolling";
  const extensionVersion = manifest?.version ?? "—";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4">
      <BackButton onClick={onBack} />
      <h2 className="mt-2 text-lg font-semibold">Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Keyword generation uses OpenRouter (free models). No setup needed.
      </p>

      <Separator className="my-4" />

      <h3 className="text-sm font-medium mb-1">Data</h3>
      <p className="text-sm text-muted-foreground mb-2">
        The exported file contains keywords that may spoil you. We recommend not
        opening the file; use it only to back up or move your data to another
        device.
      </p>
      <p className="text-sm text-muted-foreground mb-2">
        Export periodically to avoid losing data.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleExport}>
          Export profiles
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Import profiles
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportFile}
        />
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteAllOpen(true)}
        >
          Delete all profiles
        </Button>
      </div>

      <Separator className="my-4" />

      <h3 className="text-sm font-medium mb-1">About</h3>
      <p className="text-sm text-muted-foreground">
        {extensionName} · Version {extensionVersion}
      </p>

      <MessageModal
        open={messageOpen}
        onOpenChange={setMessageOpen}
        title={messageTitle}
        message={messageLines}
      />
      <DeleteConfirmModal
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        onConfirm={handleDeleteAllConfirm}
        title="Delete all profiles?"
        description="This will permanently delete all your media profiles. This cannot be undone."
        confirmLabel="Delete all"
      />
    </div>
  );
}
