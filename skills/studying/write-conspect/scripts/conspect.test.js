"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const CLI = path.join(__dirname, "conspect.js");
function run(args, { cwd, input } = {}) {
  return spawnSync("node", [CLI, ...args], { cwd, input, encoding: "utf8" });
}
function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), "conspect-cli-")); }
function readStore(dir) { return JSON.parse(fs.readFileSync(path.join(dir, "conspect.json"), "utf8")); }
function lastTok(r) { return r.stdout.trim().split(/\s+/).pop(); }

test("init creates a store; set-meta updates it; tree shows structure", () => {
  const dir = tmp();
  let r = run(["init", "--title", "My Notes", "--lang", "ru"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  const store = readStore(dir);
  assert.strictEqual(store.title, "My Notes");
  assert.strictEqual(store.lang, "ru");
  assert.deepStrictEqual(store.topics, []);

  r = run(["set-meta", "--title", "Renamed"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(readStore(dir).title, "Renamed");

  r = run(["tree"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
});

test("add-topic builds a tree with auto prereq and addressable ids", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  let r = run(["add-topic", "--title", "Intro"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /intro/);
  r = run(["add-topic", "--title", "Sub", "--parent", "intro"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  const obj = readStore(dir);
  assert.strictEqual(obj.topics[0].id, "intro");
  assert.strictEqual(obj.topics[0].blocks[0].type, "prereq");
  assert.strictEqual(obj.topics[0].children[0].id, "sub");
});

test("edit-topic --id rewrites internal links", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  run(["add-topic", "--title", "B", "--id", "b"], { cwd: dir });
  run(["add-text", "--topic", "b"], { cwd: dir, input: '<a href="#a">see A</a>' });
  const r = run(["edit-topic", "a", "--id", "alpha"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  const obj = readStore(dir);
  assert.strictEqual(obj.topics[0].id, "alpha");
  assert.strictEqual(obj.topics[1].blocks[1].html, '<a href="#alpha">see A</a>', "link rewritten");
});

test("remove-topic reports dangling links", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  run(["add-topic", "--title", "B", "--id", "b"], { cwd: dir });
  run(["add-text", "--topic", "b"], { cwd: dir, input: '<a href="#a">see A</a>' });
  const r = run(["remove-topic", "a"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stderr + r.stdout, /#a/);
});

test("add-text / add-formula / add-image build valid blocks", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  assert.strictEqual(run(["add-text", "--topic", "a"], { cwd: dir, input: "<p>hi</p>" }).status, 0);
  assert.strictEqual(run(["add-formula", "--topic", "a", "--tex", "\\frac{a}{b}", "--explain", "ratio"], { cwd: dir }).status, 0);
  const svg = path.join(dir, "f.svg"); fs.writeFileSync(svg, "<svg></svg>");
  assert.strictEqual(run(["add-image", "--topic", "a", "--svg", svg, "--caption", "fig"], { cwd: dir }).status, 0);
  const obj = readStore(dir);
  const types = obj.topics[0].blocks.map((b) => b.type);
  assert.deepStrictEqual(types, ["prereq", "text", "formula", "image"]);
  assert.strictEqual(obj.topics[0].blocks[2].tex, "\\frac{a}{b}");
});

test("add-formula rejects empty explain at mutation time", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const r = run(["add-formula", "--topic", "a", "--tex", "x", "--explain", ""], { cwd: dir });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /formula/);
});

test("prereq items are populated in place", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  assert.strictEqual(run(["add-prereq-item", "--topic", "a", "--title", "Algebra"], { cwd: dir }).status, 0);
  const obj = readStore(dir);
  assert.strictEqual(obj.topics[0].blocks[0].items[0].title, "Algebra");
});

test("multi-item selfcheck builds items one at a time", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const bid = lastTok(run(["add-selfcheck", "--topic", "a"], { cwd: dir }));
  assert.strictEqual(run(["add-selfcheck-item", bid, "--a", "ans"], { cwd: dir, input: "question?" }).status, 0);
  const obj = readStore(dir);
  assert.strictEqual(obj.topics[0].blocks[1].items[0].q, "question?");
  assert.strictEqual(obj.topics[0].blocks[1].items[0].a, "ans");
});

test("table built via add-table + add-table-row validates row width", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const bid = lastTok(run(["add-table", "--topic", "a", "--headers", "H1", "--headers", "H2"], { cwd: dir }));
  assert.strictEqual(run(["add-table-row", bid, "--cell", "x", "--cell", "y"], { cwd: dir }).status, 0);
  assert.notStrictEqual(run(["add-table-row", bid, "--cell", "only"], { cwd: dir }).status, 0);
});

test("resources built via add-resources + add-resource-item", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const bid = lastTok(run(["add-resources", "--topic", "a"], { cwd: dir }));
  assert.strictEqual(run(["add-resource-item", bid, "--title", "Book", "--url", "https://x"], { cwd: dir }).status, 0);
  assert.strictEqual(readStore(dir).topics[0].blocks[1].items[0].title, "Book");
});

test("edit-block / move-block / remove-block operate by block id", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const bid = lastTok(run(["add-text", "--topic", "a"], { cwd: dir, input: "<p>old</p>" }));
  assert.strictEqual(run(["edit-block", bid], { cwd: dir, input: "<p>new</p>" }).status, 0);
  let obj = readStore(dir);
  assert.strictEqual(obj.topics[0].blocks[1].html, "<p>new</p>");
  assert.strictEqual(run(["remove-block", bid], { cwd: dir }).status, 0);
  obj = readStore(dir);
  assert.strictEqual(obj.topics[0].blocks.length, 1);
});

test("build renders a self-contained HTML from the store", () => {
  const dir = tmp();
  run(["init", "--title", "Build Test"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  run(["add-text", "--topic", "a"], { cwd: dir, input: "<p>body</p>" });
  const r = run(["build", "out"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  const html = fs.readFileSync(path.join(dir, "out.html"), "utf8");
  assert.ok(html.includes("Build Test") && html.includes("<p>body</p>"));
  assert.ok(html.includes("/*__CONSPECT_DATA_START__*/"), "markers preserved");
  assert.ok(!html.includes("_id"), "internal ids stripped");
});

test("build fails (no file) when a topic lacks a prereq first block", () => {
  const dir = tmp();
  run(["init", "--title", "X"], { cwd: dir });
  fs.writeFileSync(path.join(dir, "conspect.json"), JSON.stringify({ title: "X", lang: "ru", topics: [{ id: "a", title: "A", blocks: [{ _id: "b1", type: "text", html: "<p>x</p>" }] }] }));
  const r = run(["build", "out"], { cwd: dir });
  assert.notStrictEqual(r.status, 0);
  assert.ok(!fs.existsSync(path.join(dir, "out.html")), "no file on failure");
});
