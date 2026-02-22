import type { MediaProfile } from "@/shared/types";

export class StorageManager {
  private readonly PROFILES_KEY = "mediaProfiles";

  private assertStorage(): void {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      throw new Error("Extension storage is not available. Open the app as an extension popup.");
    }
  }

  /**
   * Gets all media profiles from storage
   * @returns All media profiles
   */
  async getProfiles(): Promise<MediaProfile[]> {
    try {
      this.assertStorage();
      const result = (await chrome.storage.local.get(
        this.PROFILES_KEY,
      )) as Record<string, MediaProfile[] | undefined>;
      return result[this.PROFILES_KEY] ?? [];
    } catch (error) {
      console.error("Error getting profiles:", error);
      return [];
    }
  }

  /**
   * Gets a media profile from storage by ID
   * @param id - The ID of the media profile to get
   * @returns The media profile or null if it cannot be found
   */
  async getProfile(id: string): Promise<MediaProfile | null> {
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  }

  /**
   * Saves a media profile to storage
   * @param profile - The media profile to save
   */
  async saveProfile(profile: MediaProfile): Promise<void> {
    this.assertStorage();
    try {
      const profiles = await this.getProfiles();

      // Check if the profile already exists
      const existingIndex = profiles.findIndex((p) => p.id === profile.id);

      // If the profile already exists, update it
      if (existingIndex >= 0) {
        profiles[existingIndex] = profile;
      } else {
        // If the profile does not exist, create it
        profiles.push(profile);
      }

      // Save the profiles to storage
      await chrome.storage.local.set({ [this.PROFILES_KEY]: profiles });
      console.log("✅ Profile saved:", profile.title);
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  }

  /**
   * Updates a media profile in storage by ID
   * @param id - The ID of the media profile to update
   * @param updates - The updates to apply to the media profile
   */
  async updateProfile(
    id: string,
    updates: Partial<MediaProfile>,
  ): Promise<void> {
    try {
      const profiles = await this.getProfiles();
      // Check if the profile exists
      const index = profiles.findIndex((p) => p.id === id);

      // If the profile does not exist, throw an error
      if (index === -1) {
        throw new Error(`Profile with id ${id} not found`);
      }

      // Update the profile with the new values
      profiles[index] = { ...profiles[index], ...updates };

      // Save the profiles to storage
      await chrome.storage.local.set({ [this.PROFILES_KEY]: profiles });
      console.log("✅ Profile updated:", id);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Deletes a media profile from storage by ID
   * @param id - The ID of the profile to delete
   */
  async deleteProfile(id: string): Promise<void> {
    try {
      const profiles = await this.getProfiles();
      // Filter out the profile with the given ID
      const filtered = profiles.filter((p) => p.id !== id);

      // Save the filtered profiles to storage
      await chrome.storage.local.set({ [this.PROFILES_KEY]: filtered });
      console.log("✅ Profile deleted:", id);
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  }

  /**
   * Replaces the entire profiles list in storage.
   * Used for import (append then set) and delete-all (pass []).
   */
  async setProfiles(profiles: MediaProfile[]): Promise<void> {
    this.assertStorage();
    await chrome.storage.local.set({ [this.PROFILES_KEY]: profiles });
  }

  /**
   * Deletes all media profiles from storage.
   */
  async deleteAllProfiles(): Promise<void> {
    await this.setProfiles([]);
  }

  /**
   * Gets all enabled media profiles from storage
   * @returns All enabled media profiles
   */
  async getEnabledProfiles(): Promise<MediaProfile[]> {
    const profiles = await this.getProfiles();
    // Filter out the profiles that are not enabled
    return profiles.filter(p => p.enabled);
  }

  /**
   * Toggles the enabled status of a media profile by ID
   * @param id - The ID of the profile to toggle
   */
  async toggleProfile(id: string): Promise<void> {
    try {
      const profile = await this.getProfile(id);
      // Check if the profile exists
      if (!profile) {
        throw new Error(`Profile with id ${id} not found`);
      }

      // Update the profile with the new enabled status
      await this.updateProfile(id, { enabled: !profile.enabled });
    } catch (error) {
      console.error('Error toggling profile:', error);
      throw error;
    }
  }

  /**
   * Clears all data from storage
   */
  async clearAll(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Generates a unique ID
   * @returns A unique ID
   */
  generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Gets all profiles using AI classifier mode
   * @returns All profiles using AI classifier mode
   */
async getAIProfiles(): Promise<MediaProfile[]> {
    const profiles = await this.getProfiles();
    return profiles.filter(p => p.useAIClassifier);
  }
  
  /**
   * Gets all profiles using keyword mode
   * @returns All profiles using keyword mode
   */
  async getKeywordProfiles(): Promise<MediaProfile[]> {
    const profiles = await this.getProfiles();
    return profiles.filter(p => !p.useAIClassifier);
  }
}

// Export the storage manager as a singleton
export const storage = new StorageManager();
