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
  "photoInput", "originalPreview", "promptInput", "apiKey", "quality", "size",
  "editBtn", "status", "resultCard", "resultPreview", "saveBtn", "openBtn"
]) {
  assert.ok(html.includes('id="' + id + '"'), "missing required photo editor element id: " + id);
}

assert.match(html, /https:\/\/api\.openai\.com\/v1\/images\/edits/,
  "official OpenAI image editing endpoint should be connected");
assert.match(html, /model\x27,\x27gpt-image-2\.5-sunburst/, "GPT Image 2.5 editing model should be selected");
assert.match(html, /image\[\]/, "the original image should be sent as multipart image input");
assert.match(html, /apiKey/, "user must be able to enter an API key without embedding it in source code");
assert.doesNotMatch(html, /aihorde\.net|0000000000|source_processing:\s*'img2img'/,
  "the low-fidelity anonymous AI Horde integration should be removed");
assert.match(html, /downloadResult/, "saving the resulting image should be implemented");
assert.match(html, /gen\.pollinations\.ai\/v1\/images\/edits/, "Pollinations image editing fallback should be available");
assert.match(html, /value="local"/, "offline local enhancement mode should be available without an API key");
assert.match(html, /localEnhance/, "local enhancement should work without sending the image to a provider");
assert.match(html, /data-prompt=/, "quick edit prompts should be available");
assert.doesNotMatch(html, /English Daily|englishDailyProgressV2|playPronunciation|speechSynthesis/i,
  "legacy English-learning app code should be removed");

console.log("PASS: HTML document metadata");
console.log("PASS: inline JavaScript syntax");
console.log("PASS: photo upload, prompt, quality, size, and API-key controls");
console.log("PASS: OpenAI GPT Image editing request");
console.log("PASS: result preview and save/open controls");
