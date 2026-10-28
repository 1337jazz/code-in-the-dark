import { CONTENT_KEY, NAME_KEY, FINISHED_KEY } from "./storage.js";
import {
  PREVIEW_TICK,
  PREVIEW_SECONDS,
  SCREEN_SHARE_WIDTH,
  SCREEN_SHARE_HEIGHT,
  SCREEN_SHARE_FRAME_RATE,
} from "./config.js";

const $screen = document.querySelector("#screen");
const shareButton = document.querySelector("#share-button");
const $preview = document.querySelector("#preview");
const $countdown = document.querySelector("#countdown");

let showPreviewTimeout;
let hidePreviewTimeout;
let screenStream;
let countdownInterval;
let countdownLabel;
let countdownEndsAt;

// Stop switching and show the editor video
const stopSwitching = () => {
  clearTimeout(showPreviewTimeout);
  clearTimeout(hidePreviewTimeout);
  clearInterval(countdownInterval);
  $preview.classList.remove("visible");
  $countdown.hidden = true;
};

// Count down to the next switch
const startCountdown = (label, seconds) => {
  countdownLabel = label;
  countdownEndsAt = Date.now() + seconds * 1000;
};

// Write the remaining seconds into the countdown overlay
const renderCountdown = () => {
  const secondsLeft = Math.max(0, Math.ceil((countdownEndsAt - Date.now()) / 1000));
  $countdown.textContent = `${countdownLabel} ${secondsLeft}s`;
};

// Wait PREVIEW_TICK seconds, then show the preview
const scheduleNextPreview = () => {
  startCountdown("Preview in", PREVIEW_TICK);
  showPreviewTimeout = setTimeout(showPreview, PREVIEW_TICK * 1000);
};

// Show the preview and hide it again after PREVIEW_SECONDS
const showPreview = () => {
  $preview.classList.add("visible");
  startCountdown("Back to editor in", PREVIEW_SECONDS);
  hidePreviewTimeout = setTimeout(hidePreview, PREVIEW_SECONDS * 1000);
};

const hidePreview = () => {
  $preview.classList.remove("visible");
  scheduleNextPreview();
};

shareButton.addEventListener("click", async () => {

  // Open the browser share window
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      // try to get a 4k video
      width: {ideal: SCREEN_SHARE_WIDTH},
      height: {ideal: SCREEN_SHARE_HEIGHT},
      frameRate: SCREEN_SHARE_FRAME_RATE,
      displaySurface: "browser",
    },
    monitorTypeSurfaces: "exclude",
    selfBrowserSurface: "exclude",
  });
  // Prefer sharp text over smooth motion
  stream.getVideoTracks()[0].contentHint = "detail";
  screenStream = stream;
  $screen.srcObject = stream;
  shareButton.hidden = true;

  // Start the preview cycle while sharing
  if (!localStorage[FINISHED_KEY]) {
    scheduleNextPreview();
    renderCountdown();
    $countdown.hidden = false;
    countdownInterval = setInterval(renderCountdown, 250);
  }

  // Stop switching and show the button again when sharing stops
  stream.getVideoTracks()[0].addEventListener("ended", () => {
    stopSwitching();
    shareButton.hidden = false;
  });
});

// Fill the preview with the editor content and keep it updated
const updatePreview = () => ($preview.srcdoc = localStorage[CONTENT_KEY] ?? "");
updatePreview();

// Fill the name tag and keep it updated
const $nameTag = document.querySelector(".name-tag");
const updateName = () => ($nameTag.textContent = localStorage[NAME_KEY] ?? "");
updateName();

window.addEventListener("storage", (e) => {
  if (e.key === CONTENT_KEY) {
    updatePreview();
  }
  if (e.key === NAME_KEY) {
    updateName();
  }
  // Stop sharing and show the result when the contestant finishes
  if (e.key === FINISHED_KEY && e.newValue) {
    screenStream?.getTracks().forEach((track) => track.stop());
    location.replace("result.html");
  }
});
