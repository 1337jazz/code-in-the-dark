import { CONTENT_KEY, NAME_KEY, FINISHED_KEY } from "./storage.js";
import { PREVIEW_TICK, PREVIEW_SECONDS, SCREEN_SHARE_WIDTH, SCREEN_SHARE_HEIGHT, SCREEN_SHARE_FRAME_RATE } from "./config.js";

// ==================
// == DOM Elements ==
// ==================
const $screen = document.querySelector("#screen");
const $shareButton = document.querySelector("#share-button");
const $preview = document.querySelector("#preview");
const $countdown = document.querySelector("#countdown");
const $nameTag = document.querySelector(".name-tag");

// ==================
// ====  Globals ====
// ==================
let countdownInterval;
let switchAt;

// ==================
// ====  Events ====
// ==================

// Fires when the share button is clicked
$shareButton.addEventListener("click", onClickShare);

// Fires when localstorage changes
window.addEventListener("storage", onStorageChange);

// =============================================================================
// ========================= ENTRY POINT =======================================
// =============================================================================

// First, fill the preview with the editor content and update the name tag
render();

// Starts sharing editor tab and start the preview cycle
async function onClickShare() {
  // Open the browser share window
  const stream = await navigator.mediaDevices.getDisplayMedia({
    // FYI, many of these options only work on Chrome and Edge, Firefox ignores a lot
    video: {
      // Set the video config, try 4k as the default in the config
      width: { ideal: SCREEN_SHARE_WIDTH },
      height: { ideal: SCREEN_SHARE_HEIGHT },
      frameRate: SCREEN_SHARE_FRAME_RATE,
      displaySurface: "browser", // select a tab, not a window (Firefox ignores)
    },
    monitorTypeSurfaces: "exclude", // remove "entire screen" for sharing (Firefox ignores)
    selfBrowserSurface: "exclude", // hide the viewers own tab for sharing (Firefox ignores)
  });

  // Prefer sharp text over smooth motion (idk if this does anything lol)
  stream.getVideoTracks()[0].contentHint = "detail";
  $screen.srcObject = stream;
  $shareButton.hidden = true;

  // Start the preview cycle while sharing
  if (!localStorage[FINISHED_KEY]) {
    switchAt = Date.now() + PREVIEW_TICK * 1000;
    tick();
    $countdown.hidden = false;
    countdownInterval = setInterval(tick, 250);
  }

  // Listen for when sharing stops and stop switching (also show the button again)
  stream.getVideoTracks()[0].addEventListener("ended", () => {
    stopSwitching();
    $shareButton.hidden = false;
  });
}

// Fill the preview with the editor content and the name tag with the contestant name
function render() {
  $preview.srcdoc = localStorage[CONTENT_KEY] ?? "";
  $nameTag.textContent = localStorage[NAME_KEY] ?? "";
}

// Stop switching and show the editor video
function stopSwitching() {
  clearInterval(countdownInterval);
  $preview.classList.remove("visible");
  $countdown.hidden = true;
}

// Switch between the editor and the preview when the time is up, then update the countdown
function tick() {
  if (Date.now() >= switchAt) {
    const showingPreview = $preview.classList.toggle("visible");
    switchAt = Date.now() + (showingPreview ? PREVIEW_SECONDS : PREVIEW_TICK) * 1000;
  }

  // Update the UI
  const label = $preview.classList.contains("visible") ? "Back to editor in" : "Preview in";
  const secondsLeft = Math.ceil((switchAt - Date.now()) / 1000);
  $countdown.textContent = `${label} ${secondsLeft}s`;
}

// React to changes the editor makes to localStorage
function onStorageChange(e) {
  // When the contestant is finished, stop sharing and show the result
  if (e.key === FINISHED_KEY && e.newValue) {
    $screen.srcObject?.getTracks().forEach((track) => track.stop());
    return location.replace("result.html");
  }

  // Otherwise the content or the name changed, so update the page
  render();
}
