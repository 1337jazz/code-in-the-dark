import ace from "ace-builds";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-vibrant_ink";
import "ace-builds/src-noconflict/ext-searchbox";
import { CONTENT_KEY } from "./storage.js";
import { EDITOR_FONT_SIZE } from "./config.js";

const editor = setupAce();
loadContent();
editor.focus();
editor.getSession().on("change", saveContent);

function setupAce() {
  const editor = ace.edit("editor");

  editor.setShowPrintMargin(false);
  editor.setHighlightActiveLine(false);
  editor.setFontSize(EDITOR_FONT_SIZE);
  editor.setTheme("ace/theme/vibrant_ink");
  editor.getSession().setMode("ace/mode/html");
  editor.session.setOption("useWorker", false);
  editor.session.setFoldStyle("manual");
  editor.$blockScrolling = Infinity;

  return editor;
}

function loadContent() {
  let content;
  if (!(content = localStorage[CONTENT_KEY])) {
    return;
  }
  return editor.setValue(content, -1);
}

function saveContent() {
  return (localStorage[CONTENT_KEY] = editor.getValue());
}

function getCursorPosition() {
  let { left, top } = editor.renderer.$cursorLayer.getPixelPosition();
  left += editor.renderer.gutterWidth + 4;
  top -= editor.renderer.scrollTop;
  return { x: left, y: top };
}

export { editor, getCursorPosition };
