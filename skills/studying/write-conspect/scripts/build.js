#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const START = "/*__CONSPECT_DATA_START__*/";
const END = "/*__CONSPECT_DATA_END__*/";

function fail(msg) {
  console.error("ERROR: " + msg);
  process.exit(1);
}

// True if the string contains a C0 control character other than tab/newline/CR.
// These appear when a LaTeX backslash is eaten by JSON escaping
// (e.g. "\frac" parsed as form-feed + "rac"). Written as a char-code scan
// rather than a regex with \u escapes on purpose.
function hasControlChar(s) {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 8 || c === 11 || c === 12 || (c >= 14 && c <= 31)) return true;
  }
  return false;
}

const [, , dataPath, conspectName, outDir] = process.argv;
if (!dataPath || !conspectName) {
  fail("usage: node build.js <data.js> <conspect-name> [output-dir]");
}

const templatePath = path.join(__dirname, "..", "templates", "template.html");

let template, data;
try {
  template = fs.readFileSync(templatePath, "utf8");
} catch (e) {
  fail("cannot read template at " + templatePath + ": " + e.message);
}
try {
  data = fs.readFileSync(dataPath, "utf8").trim();
} catch (e) {
  fail("cannot read data file at " + dataPath + ": " + e.message);
}

// --- Splice ---
const beforeStart = template.split(START);
if (beforeStart.length !== 2) fail("template must contain exactly one " + START);
const afterEnd = beforeStart[1].split(END);
if (afterEnd.length !== 2) fail("template must contain exactly one " + END);
const spliced = beforeStart[0] + START + "\n" + data + "\n" + END + afterEnd[1];

// --- Validate ---
let obj;
try {
  obj = new Function("return (" + data + ")")();
} catch (e) {
  fail("data expression does not evaluate as JS: " + e.message);
}

if (typeof obj.title !== "string" || !obj.title) fail("title must be a non-empty string");
if (obj.lang !== undefined && !["ru", "en"].includes(obj.lang)) fail("lang must be ru or en");
if (!Array.isArray(obj.topics) || obj.topics.length === 0) fail("topics must be a non-empty array");

const known = ["prereq", "text", "attention", "example", "image", "formula", "selfcheck", "resources"];
const ids = [];
const warnings = [];
try {
  (function walk(topics) {
    for (const t of topics) {
      if (!/^[a-z0-9-]+$/.test(t.id || "")) throw new Error("bad topic id: " + JSON.stringify(t.id));
      ids.push(t.id);
      if (typeof t.title !== "string" || !t.title) throw new Error(t.id + ": title missing");
      if (!Array.isArray(t.blocks) || t.blocks.length === 0 || t.blocks[0].type !== "prereq")
        throw new Error(t.id + ": first block must be type prereq");
      for (const blk of t.blocks) {
        if (!known.includes(blk.type)) throw new Error(t.id + ": unknown block type " + JSON.stringify(blk.type));
        if (blk.type === "image" && !blk.svg && !blk.canvas && !blk.src)
          warnings.push("WARN " + t.id + ": image block has no svg/canvas/src (placeholder is deprecated)");
        if (blk.type === "formula" && (typeof blk.tex !== "string" || !blk.tex.trim() || typeof blk.explain !== "string" || !blk.explain.trim()))
          throw new Error(t.id + ": formula block needs non-empty string tex and explain");
      }
      if (t.children) walk(t.children);
    }
  })(obj.topics);

  if (new Set(ids).size !== ids.length) throw new Error("duplicate topic ids");

  (function scan(v, p) {
    if (typeof v === "string") {
      if (hasControlChar(v))
        throw new Error("control character in " + p + " - a LaTeX backslash was eaten by JSON escaping (e.g. a single-backslash \\frac parsed as form-feed + rac). Fix the formulas or switch to String.raw.");
    } else if (v && typeof v === "object") {
      for (const k of Object.keys(v)) scan(v[k], p + "." + k);
    }
  })(obj, "data");
} catch (e) {
  fail(e.message);
}

// --- Write (only after validation passes) ---
const targetDir = outDir || process.cwd();
const outPath = path.join(targetDir, conspectName + ".html");
try {
  fs.writeFileSync(outPath, spliced);
} catch (e) {
  fail("cannot write output to " + outPath + ": " + e.message);
}

for (const w of warnings) console.error(w);
console.log('OK: "' + obj.title + '" — ' + ids.length + " topics → " + outPath);
