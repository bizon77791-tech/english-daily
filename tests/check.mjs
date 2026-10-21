import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(html, /<!doctype html>/i, "index.html must declare an HTML doctype");
assert.match(html, /<html\b[^>]*lang=["']ru["']/i, "document language should be Russian");
assert.match(html, /<title>\s*Фото ИИ/i, "page title should identify the photo editor");

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const inlineScripts = scripts.filter(([, attrs]) => !/\bsrc\s*=/.test(attrs));
assert.ok(inlineScripts.length > 0, "expected at least one inline application script");
for (const [, , source] of inlineScripts) {
  assert.doesNotMatch(source, /^\s*$/, "inline script must not be empty");
  new vm.Script(source, { filename: "index.html:inline-script" });
}

for (const id of [
  "photoInput", "originalPreview", "promptInput", "strength", "size",
  "editBtn", "status", "resultCard", "resultPreview", "saveBtn", "openBtn"
]) {
  assert.ok(html.includes('id="' + id + '"'), "missing required photo editor element id: " + id);
}

assert.match(html, /https:\/\/aihorde\.net\/api\/v2\/generate\/async/,
  "AI Horde generation endpoint should be connected");
assert.match(html, /generate\/check\//, "generation status polling should be implemented");
assert.match(html, /source_processing:\s*'img2img'/, "photo-to-photo mode should be configured");
assert.match(html, /0000000000/, "anonymous no-registration API key should be used");
assert.match(html, /downloadResult/, "saving the resulting image should be implemented");
assert.match(html, /data-prompt=/, "quick edit prompts should be available");
assert.doesNotMatch(html, /English Daily|englishDailyProgressV2|playPronunciation|speechSynthesis/i,
  "legacy English-learning app code should be removed");

console.log("PASS: HTML document metadata");
console.log("PASS: inline JavaScript syntax");
console.log("PASS: photo upload, prompt, strength, and size controls");
console.log("PASS: AI Horde image-to-image request and status polling");
console.log("PASS: result preview and save/open controls");
