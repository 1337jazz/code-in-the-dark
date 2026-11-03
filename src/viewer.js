import _ from "underscore";
import { CONTENT_KEY, NAME_KEY, FINISHED_KEY, STARTED_KEY } from "./storage.js";
import {
  ENABLE_PREVIEW,
  PREVIEW_TICK,
  PREVIEW_SECONDS,
  MAX_PREVIEWS,
  RENDER_DELAY,
  SCREEN_SHARE_WIDTH,
  SCREEN_SHARE_HEIGHT,
  SCREEN_SHARE_FRAME_RATE,
} from "./config.js";

// ==================
// == DOM Elements ==
// ==================
const $screen = document.querySelector("#screen");
const $shareButton = document.querySelector("#share-button");
const $preview = document.querySelector("#preview");
const $countdown = document.querySelector("#countdown");
const $countdownLabel = document.querySelector("#countdown-label");
const $previewCount = document.querySelector("#preview-count");
const $nameTag = document.querySelector(".name-tag");

// ==================
// ====  Globals ====
// ==================
let countdownInterval;
let switchAt;
let previewCount = 0;

// Setup debounced functions
const debouncedRender = _.debounce(render, RENDER_DELAY * 1000);

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
  if (localStorage[STARTED_KEY]) startCycle();

  // Listen for when sharing stops and stop switching (also show the button again)
  stream.getVideoTracks()[0].addEventListener("ended", () => {
    stopSwitching();
    $screen.srcObject = null;
    $shareButton.hidden = false;
  });
}

// Fill the preview with the editor content and the name tag with the contestant name
function render() {
  $preview.srcdoc = localStorage[CONTENT_KEY] ?? "";
  $nameTag.textContent = localStorage[NAME_KEY] ?? "";
}

// Start switching between the editor and the preview
function startCycle() {
  if (!ENABLE_PREVIEW || previewCount >= MAX_PREVIEWS || localStorage[FINISHED_KEY]) return;

  clearInterval(countdownInterval);
  switchAt = Date.now() + PREVIEW_TICK * 1000;
  tick();
  $countdown.hidden = false;
  countdownInterval = setInterval(tick, 250);
}

function stopSwitching() {
  clearInterval(countdownInterval);
  $preview.classList.remove("visible");
  $countdown.hidden = true;
}

// Switch between the editor and the preview when the time is up, then update the countdown
function tick() {
  let showingPreview = $preview.classList.contains("visible");

  if (Date.now() >= switchAt) {
    // Stop switching once the last preview has finished
    if (showingPreview && previewCount >= MAX_PREVIEWS) {
      return stopSwitching();
    }

    showingPreview = $preview.classList.toggle("visible");
    if (showingPreview) previewCount++;
    switchAt = Date.now() + (showingPreview ? PREVIEW_SECONDS : PREVIEW_TICK) * 1000;
  }

  // Update the UI
  const label = showingPreview ? "Back to editor in" : `Preview ${previewCount + 1} of ${MAX_PREVIEWS} in`;
  const secondsLeft = Math.ceil((switchAt - Date.now()) / 1000);
  $countdownLabel.textContent = `${label} ${secondsLeft}s`;
  $previewCount.textContent = `${previewCount}/${MAX_PREVIEWS}`;
  $previewCount.hidden = !showingPreview;
}

// React to changes the editor makes to localStorage
function onStorageChange(e) {
  // When the contestant is finished, stop sharing and show the result
  if (e.key === FINISHED_KEY && e.newValue) {
    $screen.srcObject?.getTracks().forEach((track) => track.stop());
    return location.replace("result.html");
  }

  // When the contestant clicks start while sharing, start the preview cycle
  if (e.key === STARTED_KEY && e.newValue === "true" && $screen.srcObject) {
    return startCycle();
  }

  // When the contestant resets, stop the preview cycle and reset the preview count
  if (e.key === STARTED_KEY && e.newValue === null) {
    previewCount = 0;
    return stopSwitching();
  }

  // Otherwise the content or the name changed, so update the page
  debouncedRender();
}
