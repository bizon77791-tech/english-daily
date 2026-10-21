import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(html, /<!doctype html>/i, "index.html must declare an HTML doctype");
assert.match(html, /<html\b[^>]*lang=["']ru["']/i, "document language should be Russian");
assert.match(html, /<title>\s*English Daily/i, "page title should identify English Daily");

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const inlineScripts = scripts.filter(([, attrs]) => !/\bsrc\s*=/.test(attrs));
assert.ok(inlineScripts.length > 0, "expected at least one inline application script");
for (const [, , source] of inlineScripts) {
  assert.doesNotMatch(source, /^\s*$/, "inline script must not be empty");
  new vm.Script(source, { filename: "index.html:inline-script" });
}

for (const id of [
  "tab-home", "tab-study", "tab-library", "tab-quiz", "tab-profile",
  "studyEn", "studyRu", "quizOptions", "homeLearned", "categoryFilter"
]) {
  assert.ok(html.includes('id="' + id + '"'), "missing required element id: " + id);
}

for (const module of ["words", "numbers", "phrases", "sentences"]) {
  assert.ok(html.includes('openModule(\'' + module + '\')'), "missing learning module: " + module);
}
for (const fn of [
  "showTab", "openModule", "openLibrary", "renderStudy", "nextItem",
  "previousItem", "markLearned", "renderLibrary", "renderQuiz",
  "checkAnswer", "updateStats", "resetProgress"
]) {
  assert.match(html, new RegExp("function\\s+" + fn + "\\s*\\("), "missing expected function: " + fn);
}
assert.doesNotMatch(html, /playPronunciation|playRemotePronunciation|speechSynthesis|audioStatus|<audio\b/i,
  "audio playback should be removed from the app for now");
assert.match(html, /localStorage\.setItem\("englishDailyProgressV2"/,
  "learning progress should remain saved locally");
assert.match(html, /first\|первый/, "ordinal numbers should be included");
assert.match(html, /How much does it cost\?\|Сколько это стоит\?/, "useful everyday phrases should be included");

console.log("PASS: HTML document metadata");
console.log("PASS: inline JavaScript syntax");
console.log("PASS: four learning modules and navigation");
console.log("PASS: audio code removed");
console.log("PASS: progress saving and learning content");
