import { CONTENT_KEY, NAME_KEY } from "./storage.js";

// Show the saved editor content and the contestant name
document.querySelector("#result").srcdoc = localStorage[CONTENT_KEY] ?? "";
document.querySelector(".name-tag").textContent = localStorage[NAME_KEY] ?? "";
