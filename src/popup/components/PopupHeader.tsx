import React from "react";
import { Settings, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export interface PopupHeaderProps {
  onSettingsClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function PopupHeader({ onSettingsClick, darkMode, onToggleDarkMode }: PopupHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <img
        src={
          typeof chrome !== "undefined" && chrome.runtime?.getURL
            ? chrome.runtime.getURL("icon.svg")
            : "/icon.svg"
        }
        alt=""
        className="h-8 w-8 shrink-0 rounded-md object-contain"
        width={32}
        height={32}
      />
      <span className="text-md font-semibold text-gray-900 dark:text-white">
        Spoiler Free Scrolling
      </span>
      <div className="flex-1" aria-hidden />
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={(e) => {
          e.stopPropagation();
          onToggleDarkMode();
        }} 
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={onSettingsClick} aria-label="Settings">
        <Settings className="h-5 w-5" />
      </Button>
    </header>
  );
}
