#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { splice } = require("./render.js");
const { validateDocument } = require("./validate.js");

function fail(msg) {
  console.error("ERROR: " + msg);
  process.exit(1);
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
let spliced;
try {
  spliced = splice(template, data);
} catch (e) {
  fail(e.message);
}

// --- Validate ---
let obj;
try {
  obj = new Function("return (" + data + ")")();
} catch (e) {
  fail("data expression does not evaluate as JS: " + e.message);
}

let result;
try {
  result = validateDocument(obj);
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

for (const w of result.warnings) console.error(w);
console.log('OK: "' + obj.title + '" — ' + result.ids.length + " topics → " + outPath);
