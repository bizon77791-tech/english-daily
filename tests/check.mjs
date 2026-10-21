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
  "tab-home", "tab-words", "tab-list", "tab-quiz", "tab-profile",
  "englishWord", "russianWord", "quizOptions", "homeLearned"
]) {
  assert.ok(html.includes('id="' + id + '"'), "missing required element id: " + id);
}

for (const fn of [
  "showTab", "renderWord", "nextWord", "markLearned",
  "playPronunciation", "renderQuiz", "checkAnswer", "updateStats", "resetProgress"
]) {
  assert.match(html, new RegExp("function\\s+" + fn + "\\s*\\("), "missing expected function: " + fn);
}

console.log("PASS: HTML document metadata");
console.log("PASS: inline JavaScript syntax");
console.log("PASS: core application elements and functions");
