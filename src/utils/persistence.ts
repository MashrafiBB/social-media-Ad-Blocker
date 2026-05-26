import { BlockSchedule, ShieldSettings, FocusTimer, PasswordProtection, BlockAttempt, AppStats } from '../types';

export const DEFAULT_SCHEDULE: BlockSchedule = {
  enabled: true,
  startTime: '09:00',
  endTime: '17:00',
  days: [1, 2, 3, 4, 5], // Monday - Friday
};

export const DEFAULT_SHIELD_SETTINGS: ShieldSettings = {
  instagramReels: true,
  youtubeShorts: true,
  facebookReels: true,
  restrictFullApp: false,
};

export const DEFAULT_TIMER: FocusTimer = {
  durationMinutes: 25,
  secondsRemaining: 1500,
  isActive: false,
  isPaused: false,
};

export const DEFAULT_PASSWORD: PasswordProtection = {
  hash: '1234',
  hint: 'The default test code is: 1234',
  isEnabled: true,
  frictionSeconds: 5, // Wait 5 seconds to bypass (friction shield)
};

export const DEFAULT_STATS: AppStats = {
  instagramBlocks: 8,
  youtubeBlocks: 14,
  facebookBlocks: 5,
  totalFocusMinutes: 120,
};

const KEYS = {
  SCHEDULE: 'shield_schedule',
  SHIELD_SETTINGS: 'shield_settings',
  TIMER: 'shield_timer',
  PASSWORD: 'shield_password',
  ATTEMPTS: 'shield_attempts',
  STATS: 'shield_stats',
};

export const persistence = {
  getScheduleOnly(): BlockSchedule {
    const data = localStorage.getItem(KEYS.SCHEDULE);
    return data ? JSON.parse(data) : DEFAULT_SCHEDULE;
  },
  saveSchedule(schedule: BlockSchedule) {
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
  },

  getShieldSettings(): ShieldSettings {
    const data = localStorage.getItem(KEYS.SHIELD_SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SHIELD_SETTINGS;
  },
  saveShieldSettings(settings: ShieldSettings) {
    localStorage.setItem(KEYS.SHIELD_SETTINGS, JSON.stringify(settings));
  },

  getTimer(): FocusTimer {
    const data = localStorage.getItem(KEYS.TIMER);
    return data ? JSON.parse(data) : DEFAULT_TIMER;
  },
  saveTimer(timer: FocusTimer) {
    localStorage.setItem(KEYS.TIMER, JSON.stringify(timer));
  },

  getPassword(): PasswordProtection {
    const data = localStorage.getItem(KEYS.PASSWORD);
    return data ? JSON.parse(data) : DEFAULT_PASSWORD;
  },
  savePassword(protect: PasswordProtection) {
    localStorage.setItem(KEYS.PASSWORD, JSON.stringify(protect));
  },

  getAttempts(): BlockAttempt[] {
    const data = localStorage.getItem(KEYS.ATTEMPTS);
    if (!data) {
      // Seed some starting logs for immediate visualization interest
      const seed: BlockAttempt[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
          app: 'Instagram',
          attemptType: 'Reels Feed',
          quote: 'Focus is a muscle, keep it strong.'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          app: 'YouTube',
          attemptType: 'Reels Feed',
          quote: 'Short-term scrolling sacrifices long-term goals.'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          app: 'Facebook',
          attemptType: 'App Start',
          quote: 'Reclaim your brain. Block the quick dopamine.'
        }
      ];
      localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(data);
  },
  saveAttempts(attempts: BlockAttempt[]) {
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));
  },

  getStats(): AppStats {
    const data = localStorage.getItem(KEYS.STATS);
    return data ? JSON.parse(data) : DEFAULT_STATS;
  },
  saveStats(stats: AppStats) {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  }
};
