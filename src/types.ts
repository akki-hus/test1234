export interface Slide {
  id: number;
  title: string;
  bullets: string[];
  narration: string;
  imagePrompt: string; // backward compatible single prompt
  imageUrl: string;    // backward compatible single URL
  imagePrompts: string[]; // List of multiple high-fidelity sequential visual prompts
  imageUrls: string[];    // List of multiple high-fidelity sequential image URLs
  audioUrl: string; // base64 or CDN URL
  duration: number; // estimated duration in seconds
}

export interface GenerationResponse {
  success: boolean;
  topic: string;
  slides: Slide[];
  error?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  standard: string; // "1" to "12"
  board: string; // "CBSE" | "ICSE" | "State Board" | "IGCSE" | "IB" | "Other"
  onboarded: boolean;
  isGuest: boolean;
  savedReelsCount: number;
}
