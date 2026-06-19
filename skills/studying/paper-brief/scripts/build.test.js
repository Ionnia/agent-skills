"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BUILD = path.join(__dirname, "build.js");

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "paper-brief-build-"));
}

// Retained blocks only; first block is NOT prereq (prereq no longer exists).
const VALID = `{
  title: "Test Brief",
  lang: "ru",
  topics: [
    { id: "a", title: "A", blocks: [ { type: "text", html: "<p>hi</p>" } ] },
    { id: "b", title: "B", blocks: [ { type: "text", html: "<p>b</p>" } ],
      children: [ { id: "c", title: "C", blocks: [ { type: "text", html: "<p>c</p>" } ] } ] }
  ]
}`;

test("valid data builds an html file and prints OK", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, VALID);
  const out = execFileSync("node", [BUILD, dataPath, "my-brief", dir], { encoding: "utf8" });
  const htmlPath = path.join(dir, "my-brief.html");
  assert.ok(fs.existsSync(htmlPath), "html file should exist");
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.ok(html.includes("Test Brief"), "spliced data should be present");
  assert.ok(html.includes("/*__CONSPECT_DATA_START__*/"), "start marker preserved");
  assert.ok(html.includes("/*__CONSPECT_DATA_END__*/"), "end marker preserved");
  assert.match(out, /OK: "Test Brief" . 3 topics/);
});

test("a topic whose first block is text (not prereq) builds fine", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, `{ title: "X", topics: [ { id: "a", title: "A", blocks: [ { type: "text", html: "<p>x</p>" } ] } ] }`);
  const r = spawnSync("node", [BUILD, dataPath, "ok", dir], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(dir, "ok.html")));
});

test("a topic with empty blocks array fails", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, `{ title: "X", topics: [ { id: "a", title: "A", blocks: [] } ] }`);
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /non-empty array/);
});

for (const removed of ["prereq", "example", "selfcheck"]) {
  test(`${removed} block is rejected`, () => {
    const dir = tmpDir();
    const dataPath = path.join(dir, "data.js");
    fs.writeFileSync(dataPath, `{ title: "X", topics: [ { id: "a", title: "A", blocks: [ { type: "${removed}", items: [] } ] } ] }`);
    const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
    assert.notStrictEqual(r.status, 0, "should exit non-zero");
    assert.match(r.stderr, /not supported in paper-brief/);
    assert.ok(!fs.existsSync(path.join(dir, "broken.html")), "no file on failure");
  });
}

test("duplicate ids fail with non-zero exit and write no file", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, VALID.replace('id: "b"', 'id: "a"'));
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0, "should exit non-zero");
  assert.match(r.stderr, /duplicate topic ids/);
  assert.ok(!fs.existsSync(path.join(dir, "broken.html")), "no file on failure");
});

test("eaten LaTeX backslash (control char) fails", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  const formFeed = String.fromCharCode(12);
  const obj = { title: "X", topics: [ { id: "a", title: "A", blocks: [ { type: "text", html: "$$" + formFeed + "rac{a}{b}$$" } ] } ] };
  fs.writeFileSync(dataPath, JSON.stringify(obj));
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /control character/);
});

test("image block without a figure warns but still builds", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, `{ title: "X", topics: [ { id: "a", title: "A", blocks: [ { type: "image", caption: "c" } ] } ] }`);
  const r = spawnSync("node", [BUILD, dataPath, "warned", dir], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, "warning is non-fatal");
  assert.match(r.stderr, /WARN a: image block has no/);
  assert.ok(fs.existsSync(path.join(dir, "warned.html")));
});

const TABLE_OK = `{
  title: "T", lang: "ru",
  topics: [ { id: "a", title: "A", blocks: [
    { type: "table",
      headers: ["Name", "Formula", "Range"],
      rows: [ ["ReLU", "max(0,x)", "[0, inf)"], ["Tanh", "tanh x", "(-1, 1)"] ],
      align: ["left", "left", "right"],
      rowHeader: true,
      caption: "Comparison" }
  ] } ]
}`;

test("valid table block builds an html file with the data spliced in", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, TABLE_OK);
  const r = spawnSync("node", [BUILD, dataPath, "tbl", dir], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, r.stderr);
  const htmlPath = path.join(dir, "tbl.html");
  assert.ok(fs.existsSync(htmlPath));
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.ok(html.includes("ReLU"), "table cell data should be spliced into the output");
  assert.ok(html.includes("Comparison"), "table caption should be spliced into the output");
});

test("non-string table caption fails", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, TABLE_OK.replace('caption: "Comparison"', 'caption: { x: 1 }'));
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /caption must be a string/);
  assert.ok(!fs.existsSync(path.join(dir, "broken.html")));
});

test("ragged table row fails", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, TABLE_OK.replace('["Tanh", "tanh x", "(-1, 1)"]', '["Tanh", "tanh x"]'));
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /expected 3/);
  assert.ok(!fs.existsSync(path.join(dir, "broken.html")));
});

test("empty table headers fail", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, TABLE_OK.replace('["Name", "Formula", "Range"]', '[]'));
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /non-empty headers array/);
});

test("formula block with empty explain fails", () => {
  const dir = tmpDir();
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, `{ title: "X", topics: [ { id: "a", title: "A", blocks: [ { type: "formula", tex: "a=b", explain: "" } ] } ] }`);
  const r = spawnSync("node", [BUILD, dataPath, "broken", dir], { encoding: "utf8" });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /formula block needs non-empty/);
});
