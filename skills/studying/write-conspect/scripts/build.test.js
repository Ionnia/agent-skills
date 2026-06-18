"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BUILD = path.join(__dirname, "build.js");

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "conspect-build-"));
}

const VALID = `{
  title: "Test Conspect",
  lang: "ru",
  topics: [
    { id: "a", title: "A", blocks: [ { type: "prereq", items: [] }, { type: "text", html: "<p>hi</p>" } ] },
    { id: "b", title: "B", blocks: [ { type: "prereq", items: [{ title: "A", url: "#a" }] } ],
      children: [ { id: "c", title: "C", blocks: [ { type: "prereq", items: [] } ] } ] }
  ]
}`;

test("valid data builds an html file and prints OK", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, VALID);
  const out = execFileSync("node", [BUILD, dataPath, "my-notes", dir], { encoding: "utf8" });
  const htmlPath = path.join(dir, "my-notes.html");
  assert.ok(fs.existsSync(htmlPath), "html file should exist");
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.ok(html.includes("Test Conspect"), "spliced data should be present");
  assert.ok(html.includes("/*__CONSPECT_DATA_START__*/"), "start marker preserved");
  assert.ok(html.includes("/*__CONSPECT_DATA_END__*/"), "end marker preserved");
  assert.match(out, /OK: "Test Conspect" . 3 topics/);
});

test("output dir defaults to cwd when omitted", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, VALID);
  execFileSync("node", [BUILD, dataPath, "in-cwd"], { encoding: "utf8", cwd: dir });
  assert.ok(fs.existsSync(path.join(dir, "in-cwd.html")));
});

test("duplicate ids fail with non-zero exit and write no file", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, VALID.replace('id: "b"', 'id: "a"'));
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0, "should exit non-zero");
  assert.match(r.stderr, /duplicate topic ids/);
  assert.ok(!fs.existsSync(path.join(dir, "broken.html")), "no file on failure");
});

test("missing prereq-first block fails", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, `{ title: "X", topics: [ { id: "a", title: "A", blocks: [ { type: "text", html: "<p>x</p>" } ] } ] }`);
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /first block must be type prereq/);
});

test("eaten LaTeX backslash (control char) fails", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  const formFeed = String.fromCharCode(12);
  const obj = { title: "X", topics: [ { id: "a", title: "A", blocks: [ { type: "prereq", items: [] }, { type: "text", html: "$$" + formFeed + "rac{a}{b}$$" } ] } ] };
  fs.writeFileSync(dataPath, JSON.stringify(obj));
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /control character/);
});

test("image block without a figure warns but still builds", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, `{ title: "X", topics: [ { id: "a", title: "A", blocks: [ { type: "prereq", items: [] }, { type: "image", caption: "c" } ] } ] }`);
  const r = spawnSync("node", [BUILD, dataPath, "warned", dir], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, "warning is non-fatal");
  assert.match(r.stderr, /WARN a: image block has no/);
  assert.ok(fs.existsSync(path.join(dir, "warned.html")));
});
