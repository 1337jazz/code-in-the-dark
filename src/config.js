// ------> Contest settings, rebuild the Docker image after changing these!!!!

// ========================
// ======== VIEWER ========
// ========================

// How many seconds between each preview
export const PREVIEW_TICK = 5;

// How many seconds to show the preview for
export const PREVIEW_SECONDS = 100;

// Seconds after the last change before the viewer reloads the preview - lower = faster refresh, but higher flicker
// in testing 0.1 seems to be fine
export const RENDER_DELAY = 0.1;

// Scrreen share size and frame rate (maybe just leave these alone unless something is broken)
export const SCREEN_SHARE_WIDTH = 3840;
export const SCREEN_SHARE_HEIGHT = 2160;
export const SCREEN_SHARE_FRAME_RATE = 60;

// ========================
// ==== EDITOR SETTINGS ===
// ========================

// Weather or not to warn before a browser refresh during the contest. Keep this true in a real contest, but nice to leave off in dev
export const WARN_BEFORE_LEAVING = true;
export const EDITOR_FONT_SIZE = 20;

// ========================
// ==== GAME SETTINGS  ====
// ========================

// Seconds without typing before the streak ends
export const STREAK_TIMEOUT = 10;

// Streak length that turns on power mode
export const POWER_MODE_ACTIVATION_THRESHOLD = 200;

// Show an exclamation every this many characters
export const EXCLAMATION_EVERY = 10;

// Exclamations that pop up - add as many as you like, a random one is chosen every EXCLAMATION_EVERY times
export const EXCLAMATIONS = [
  "10x developer unlocked!!",
  "Super!",
  "Radical!",
  "Fantastic!",
  "Great!",
  "OMG",
  "Whoah!",
  ":O",
  "Nice!",
  "Claude please make me win no mistakes",
  "Splendid!",
  "Wild!",
  "Grand!",
  "Impressive!",
  "Stupendous!",
  "Extreme!",
  "Awesome!",
];
