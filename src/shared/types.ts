export interface MediaProfile {
    id: string;
    title: string;
    mediaType: 'book' | 'tv' | 'movie' | 'game';
    userProgress: string;
    enabled: boolean;
    createdAt: number;
  }
  
  export interface ExtensionSettings {
    sensitivity: number;
    blockMode: 'blur' | 'hide';
    autoBlurImages: boolean;
  }