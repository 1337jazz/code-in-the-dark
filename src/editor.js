import _ from "underscore";
import ace from "ace-builds";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-vibrant_ink";
import "ace-builds/src-noconflict/ext-searchbox";

const debouncedSaveContent = _.debounce(saveContent, 300);

const editor = setupAce();
loadContent();
editor.focus();
editor.getSession().on("change", debouncedSaveContent);

function setupAce() {
  const editor = ace.edit("editor");

  editor.setShowPrintMargin(false);
  editor.setHighlightActiveLine(false);
  editor.setFontSize(20);
  editor.setTheme("ace/theme/vibrant_ink");
  editor.getSession().setMode("ace/mode/html");
  editor.session.setOption("useWorker", false);
  editor.session.setFoldStyle("manual");
  editor.$blockScrolling = Infinity;

  return editor;
}

function loadContent() {
  let content;
  if (!(content = localStorage["content"])) {
    return;
  }
  return editor.setValue(content, -1);
}

function saveContent() {
  return (localStorage["content"] = editor.getValue());
}

function getCursorPosition() {
  let { left, top } = editor.renderer.$cursorLayer.getPixelPosition();
  left += editor.renderer.gutterWidth + 4;
  top -= editor.renderer.scrollTop;
  return { x: left, y: top };
}

export { editor, getCursorPosition };
