export interface KeyWordRule {
  term: string;
  riskLevel: number; //0-10
}

export interface MediaProfile {
  id: string;
  title: string;
  mediaType: "book" | "tv" | "movie" | "game";
  userProgress?: string;
  keywords: KeyWordRule[];
  sensitivity: number;
  allowedAccounts: string[];
  useAIClassifier: boolean;
  enabled: boolean;
  createdAt: number;
  stats: {
    tweetsBlocked: number;
    lastBlocked?: number;
  }
}
export interface ExtractedTweet {
  id: string;
  author: string;
  text: string;
  hasImages: boolean;
  hasVideo: boolean;
  isQuoteTweet: boolean;
  quotedText?: string;
  hasLinkPreview: boolean;
  linkPreviewText?: string;
  timestamp: number;
  element: HTMLElement;
}
