import React, { useMemo, useState } from "react";
import { Button } from "@/popup/components/ui/button";
import { SearchBar } from "@/popup/components/shared/SearchBar";
import { FilterButtons, type FilterValue } from "@/popup/components/shared/FilterButtons";
import { SortDropdown, type SortValue } from "@/popup/components/shared/SortDropdown";
import { ProfileList } from "@/popup/components/profile/ProfileList";
import type { MediaProfile } from "@/shared/types";

export interface MainViewProps {
  profiles: MediaProfile[];
  onNew: () => void;
  onSelectProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onToggleEnabled: (id: string) => void;
}

/**
 * This helper function filters and sorts the list of profiles based on user choices
 * @param profiles - The list of profiles to filter and sort
 * @param search - The search query to apply to the list
 * @param filter - The filter to apply to the list
 * @param sort - The sort order to apply to the list
 * @returns The filtered and sorted list of profiles
 */
function filterAndSort(
  profiles: MediaProfile[],
  search: string,
  filter: FilterValue,
  sort: SortValue
): MediaProfile[] {
  let list = profiles;

  // Search is applied by making query lowercase and filtering by title
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q));
  }
  if (filter !== "all") {
    list = list.filter((p) => p.mediaType === filter);
  }

  switch (sort) {
    case "a-z":
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "z-a":
      list = [...list].sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "newest":
      list = [...list].sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "oldest":
      list = [...list].sort((a, b) => a.createdAt - b.createdAt);
      break;
    case "enabled":
      list = [...list].sort((a, b) => (b.enabled ? 1 : 0) - (a.enabled ? 1 : 0));
      break;
  }

  return list;
}

export function MainView({
  profiles,
  onNew,
  onSelectProfile,
  onDeleteProfile,
  onToggleEnabled,
}: MainViewProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");

  const filtered = useMemo(
    () => filterAndSort(profiles, search, filter, sort),
    [profiles, search, filter, sort]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What are you enjoying right now?</h2>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <Button variant="accent" onClick={onNew}>
            New Media
          </Button>
        </div>
        <FilterButtons value={filter} onChange={setFilter} />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort:</span>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 py-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {profiles.length === 0
              ? "No medias yet"
              : "No medias match your search or filter"}
          </p>
          <Button variant="accent" size="sm" onClick={onNew} className="mt-3">
            New media
          </Button>
        </div>
      ) : (
        <ProfileList
          profiles={filtered}
          onSelectProfile={onSelectProfile}
          onDeleteProfile={onDeleteProfile}
          onToggleEnabled={onToggleEnabled}
        />
      )}
    </div>
  );
}
