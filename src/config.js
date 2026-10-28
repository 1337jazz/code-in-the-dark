// Contest settings, rebuild the Docker image after changing these

// ==== Viewer ====
// Seconds the viewer shows the editor before each preview
export const PREVIEW_TICK = 20;
// Seconds the viewer shows each preview
export const PREVIEW_SECONDS = 10;
// Requested screen share size and frame rate
export const SCREEN_SHARE_WIDTH = 3840;
export const SCREEN_SHARE_HEIGHT = 2160;
export const SCREEN_SHARE_FRAME_RATE = 60;

// ==== Editor ====
// Ask for confirmation before leaving the editor page
export const WARN_BEFORE_LEAVING = false;
export const EDITOR_FONT_SIZE = 20;

// ==== Game ====
// Milliseconds without typing before the streak ends
export const STREAK_TIMEOUT = 10 * 1000;
// Streak length that turns on power mode
export const POWER_MODE_ACTIVATION_THRESHOLD = 1;
// Show an exclamation every this many characters
export const EXCLAMATION_EVERY = 10;
export const EXCLAMATIONS = [
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
