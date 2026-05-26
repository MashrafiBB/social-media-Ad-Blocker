export interface BlockSchedule {
  enabled: boolean;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  days: number[];    // 0 = Sunday, 1 = Monday, etc.
}

export interface ShieldSettings {
  instagramReels: boolean;
  youtubeShorts: boolean;
  facebookReels: boolean;
  restrictFullApp: boolean; // Block entire app instead of just Reels during focus hours
}

export interface FocusTimer {
  durationMinutes: number;
  secondsRemaining: number;
  isActive: boolean;
  isPaused: boolean;
}

export interface PasswordProtection {
  hash: string; // MD5/SHA or simple text for local mockup
  hint: string;
  isEnabled: boolean;
  frictionSeconds: number; // Seconds of wait before typing password is allowed
}

export interface BlockAttempt {
  id: string;
  timestamp: string; // ISO String
  app: 'Instagram' | 'Facebook' | 'YouTube';
  attemptType: 'Reels Feed' | 'App Start';
  quote: string;
}

export interface AppStats {
  instagramBlocks: number;
  youtubeBlocks: number;
  facebookBlocks: number;
  totalFocusMinutes: number;
}
