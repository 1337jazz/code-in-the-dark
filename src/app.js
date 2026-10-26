import _ from "underscore";
import { editor, getCursorPosition } from "./editor.js";
import {
    renderStreak,
    refreshStreakBar,
    showExclamation,
    burstParticles,
    shakeEditor,
    setPowerMode,
} from "./effects.js";

// ==================
// ==== Settings ====
// ==================
const POWER_MODE_ACTIVATION_THRESHOLD = 1;
const STREAK_TIMEOUT = 10 * 1000; // 10 seconds
const EXCLAMATION_EVERY = 10;
const WARN_BEFORE_LEAVING = false;

// ==================
// ====  Globals ====
// ==================
let currentStreak = 0;
let powerMode = false;

// Debounced and throttled functions
const debouncedEndStreak = _.debounce(endStreak, STREAK_TIMEOUT);
const throttledShake = _.throttle(shake, 100, { trailing: false });
const throttledSpawnParticles = _.throttle(spawnParticles, 25, {
    trailing: false,
});

// ==================
// == DOM Elements ==
// ==================
const $instructionsContainer = document.querySelector(".instructions-container");
const $instructionsButton = document.querySelector(".instructions-button");
const $reference = document.querySelector(".reference-screenshot-container");
const $nameTag = document.querySelector(".name-tag");
const $result = document.querySelector(".result");
const $finish = document.querySelector(".finish-button");

// ==================
// ====  Events ====
// ==================
// Fires when the editor changes
editor.getSession().on("change", onChange);

// Fires when the user tries to leave the page, if enabled
if (WARN_BEFORE_LEAVING) {
    window.addEventListener("beforeunload", (e) => {
        e.preventDefault();
    });
}
// Fires when the user clicks the reference image
$instructionsContainer.addEventListener("click", onClickInstructions);

// Fires when the user clicks the name tag
$instructionsButton.addEventListener("click", onClickInstructions);

// Fires when the user clicks the reference image
$reference.addEventListener("click", onClickReference);

// Fires when the user clicks the finish button
$finish.addEventListener("click", onClickFinish);

// Fires when the user clicks the name tag
$nameTag.addEventListener("click", () => getName(true));

// =============================================================================
// ========================= ENTRY POINT =======================================
// =============================================================================

// First, get the name of the user if it's not already stored
getName();

// Fires when the editor changes - this is the main event loop!
function onChange(e) {
    // If it's an insert action, increase the streak
    const insertTextAction = e.action === "insert";
    if (insertTextAction) {
        increaseStreak();
        debouncedEndStreak();
    }

    // Shake the screen in power mode
    if (powerMode) {
        throttledShake();
    }

    // Get the position of the cursor (row and column)
    const pos = insertTextAction ? e.end : e.start;

    // Get the token from the editor for this change
    const token = editor.session.getTokenAt(pos.row, pos.column);

    // Spawn particles if there is at least one token, and we're in power mode
    return _.defer(() => {
        if (token && powerMode) {
            return throttledSpawnParticles(token.type);
        }
    });
}

// Gets the name from the user, use forceUpdate to force a new name
function getName(forceUpdate) {
    let name = !forceUpdate && localStorage["name"];
    while (!name || !name.trim()) {
        name = prompt("What's your name?");
    }
    localStorage["name"] = name;
    return ($nameTag.textContent = name);
}

function increaseStreak() {
    currentStreak++;

    // Show exclamation if necessary
    if (currentStreak > 0 && currentStreak % EXCLAMATION_EVERY === 0) {
        showExclamation();
    }

    // Activate power mode if necessary
    if (currentStreak >= POWER_MODE_ACTIVATION_THRESHOLD && !powerMode) {
        activatePowerMode();
    }

    // Add more time to the streak bar
    refreshStreakBar(STREAK_TIMEOUT);

    // Update the streak counter
    return renderStreak(currentStreak);
}

function endStreak() {
    currentStreak = 0;
    renderStreak(currentStreak);
    return deactivatePowerMode();
}

function activatePowerMode() {
    powerMode = true;
    return setPowerMode(true);
}

function deactivatePowerMode() {
    powerMode = false;
    return setPowerMode(false);
}

function shake() {
    const intensity =
        1 + 2 * Math.random() * Math.floor((currentStreak - POWER_MODE_ACTIVATION_THRESHOLD) / 100);
    return shakeEditor(intensity);
}

function spawnParticles(type) {
    const { x, y } = getCursorPosition();
    return burstParticles(x, y, type);
}

function onClickInstructions() {
    document.body.classList.toggle("show-instructions");
    if (!document.body.classList.contains("show-instructions")) {
        return editor.focus();
    }
}

function onClickReference() {
    $reference.classList.toggle("active");
    if (!$reference.classList.contains("active")) {
        return editor.focus();
    }
}

function onClickFinish() {
    const confirm = prompt(`\
This will show the results of your code. Doing this before the round is over \
WILL DISQUALIFY YOU. Are you sure you want to proceed? Type \"yes\" to confirm.\
`);

    if ((confirm != null ? confirm.toLowerCase() : undefined) === "yes") {
        $result.contentWindow.postMessage(editor.getValue(), "*");
        return ($result.style.display = "block");
    }
}
