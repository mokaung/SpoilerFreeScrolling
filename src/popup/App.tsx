import React, { useState, useCallback, useEffect } from "react";
import { PopupHeader } from "./components/PopupHeader";
import { MainView } from "./components/views/MainView";
import { CreateProfileView } from "./components/views/CreateProfileView";
import { ProfileDetailView } from "./components/views/ProfileDetailView";
import { SettingsView } from "./components/views/SettingsView";
import { DeleteConfirmModal } from "./components/shared/DeleteConfirmModal";
import { storage } from "../shared/storage";
import type { MediaProfile } from "../shared/types";

export type View = "list" | "create" | "detail" | "settings";

const MOCK_PROFILES: MediaProfile[] = [
  {
    id: "1",
    title: "Breaking Bad",
    mediaType: "tv",
    userProgress: "S5 E8",
    keywords: [],
    sensitivity: 6,
    allowedAccounts: [],
    useAIClassifier: false,
    enabled: true,
    createdAt: Date.now() - 86400000,
    stats: { tweetsBlocked: 12, lastBlocked: Date.now() - 3600000 },
  },
  {
    id: "2",
    title: "Harry Potter series",
    mediaType: "book",
    userProgress: "Chapter 12",
    keywords: [],
    sensitivity: 8,
    allowedAccounts: [],
    useAIClassifier: false,
    enabled: true,
    createdAt: Date.now() - 172800000,
    stats: { tweetsBlocked: 0 },
  },
  {
    id: "3",
    title: "Spider-Man: No Way Home",
    mediaType: "movie",
    keywords: [],
    sensitivity: 5,
    allowedAccounts: [],
    useAIClassifier: false,
    enabled: false,
    createdAt: Date.now() - 259200000,
    stats: { tweetsBlocked: 3 },
  },
];

export function App() {
  const [view, setView] = useState<View>("list");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<MediaProfile[]>(MOCK_PROFILES);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or default to false
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', darkMode.toString());
    }
  }, [darkMode]);

  const goToList = useCallback(() => {
    setView("list");
    setSelectedProfileId(null);
  }, []);

  const goToCreate = useCallback(() => {
    setView("create");
    setSelectedProfileId(null);
  }, []);

  const goToDetail = useCallback((profileId: string) => {
    setView("detail");
    setSelectedProfileId(profileId);
  }, []);

  const goToSettings = useCallback(() => {
    setView("settings");
    setSelectedProfileId(null);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirmId) {
      setProfiles((prev) => prev.filter((p) => p.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setView("list");
      setSelectedProfileId(null);
    }
  }, [deleteConfirmId]);

  const handleToggleEnabled = useCallback(async (id: string) => {
    // Update UI immediately for responsive toggle
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    
    // Persist to storage only in extension context (skip in dev mode)
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      try {
        await storage.toggleProfile(id);
      } catch (error) {
        console.error("Error toggling profile:", error);
        // Revert UI change if storage update fails
        setProfiles((prev) =>
          prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
        );
      }
    }
  }, []);

  let content: React.ReactNode;

  if (view === "create") {
    content = <CreateProfileView onBack={goToList} />;
  } else if (view === "detail" && selectedProfileId) {
    content = (
      <ProfileDetailView
        profileId={selectedProfileId}
        profiles={profiles}
        onBack={goToList}
      />
    );
  } else if (view === "settings") {
    content = <SettingsView onBack={goToList} />;
  } else {
      content = (
        <MainView
          profiles={profiles}
          onNew={goToCreate}
          onSelectProfile={goToDetail}
          onDeleteProfile={handleDeleteRequest}
          onToggleEnabled={handleToggleEnabled}
        />
      );
  }

  return (
    <div className="flex min-h-full flex-col bg-white dark:bg-gray-900">
      <PopupHeader 
        onSettingsClick={goToSettings} 
        darkMode={darkMode} 
        onToggleDarkMode={() => setDarkMode(!darkMode)} 
      />
      <main className="min-h-0 flex-1 overflow-auto">{content}</main>
      <DeleteConfirmModal
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
