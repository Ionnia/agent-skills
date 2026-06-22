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
function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), "paper-brief-cli-")); }
function readStore(dir) { return JSON.parse(fs.readFileSync(path.join(dir, "conspect.json"), "utf8")); }
function lastTok(r) { return r.stdout.trim().split(/\s+/).pop(); }

test("init creates a store; set-meta updates it; tree shows structure", () => {
  const dir = tmp();
  let r = run(["init", "--title", "My Brief", "--lang", "en"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  const store = readStore(dir);
  assert.strictEqual(store.title, "My Brief");
  assert.strictEqual(store.lang, "en");
  assert.deepStrictEqual(store.topics, []);

  r = run(["set-meta", "--title", "Renamed"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(readStore(dir).title, "Renamed");

  r = run(["tree"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
});

test("add-topic creates a prereq-free topic with addressable ids", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  let r = run(["add-topic", "--title", "Setup"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.stdout, /setup/);
  r = run(["add-topic", "--title", "Sub", "--parent", "setup"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  const obj = readStore(dir);
  assert.strictEqual(obj.topics[0].id, "setup");
  assert.deepStrictEqual(obj.topics[0].blocks, []);
  assert.strictEqual(obj.topics[0].children[0].id, "sub");
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
  assert.deepStrictEqual(obj.topics[0].blocks.map((b) => b.type), ["text", "formula", "image"]);
  assert.strictEqual(obj.topics[0].blocks[1].tex, "\\frac{a}{b}");
});

test("stray positional after a single-value flag fails loudly", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const r = run(["add-text", "--topic", "a", "STRAY"], { cwd: dir, input: "<p>x</p>" });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /unexpected argument/);
});

test("add-table accepts space-separated --headers and --cell", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const bid = lastTok(run(["add-table", "--topic", "a", "--headers", "H1", "H2", "H3"], { cwd: dir }));
  assert.strictEqual(run(["add-table-row", bid, "--cell", "x", "y", "z"], { cwd: dir }).status, 0);
  assert.deepStrictEqual(readStore(dir).topics[0].blocks[0].headers, ["H1", "H2", "H3"]);
});

test("table built via add-table + add-table-row validates row width", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const bid = lastTok(run(["add-table", "--topic", "a", "--headers", "H1", "--headers", "H2"], { cwd: dir }));
  assert.strictEqual(run(["add-table-row", bid, "--cell", "x", "--cell", "y"], { cwd: dir }).status, 0);
  assert.notStrictEqual(run(["add-table-row", bid, "--cell", "only"], { cwd: dir }).status, 0);
});

test("add-table --id + add-table-row --last batch without round-trip", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  assert.strictEqual(run(["add-table", "--topic", "a", "--id", "tbl", "--headers", "H1", "H2"], { cwd: dir }).status, 0);
  assert.strictEqual(run(["add-table-row", "tbl", "--cell", "a", "b"], { cwd: dir }).status, 0);
  assert.strictEqual(run(["add-table-row", "--last", "--cell", "c", "d"], { cwd: dir }).status, 0);
  const blk = readStore(dir).topics[0].blocks[0];
  assert.strictEqual(blk._id, "tbl");
  assert.deepStrictEqual(blk.rows, [["a", "b"], ["c", "d"]]);
});

test("duplicate --id is rejected", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  run(["add-table", "--topic", "a", "--id", "dup", "--headers", "H"], { cwd: dir });
  const r = run(["add-resources", "--topic", "a", "--id", "dup"], { cwd: dir });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /already exists/);
});

test("resources built via add-resources + add-resource-item", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const bid = lastTok(run(["add-resources", "--topic", "a"], { cwd: dir }));
  assert.strictEqual(run(["add-resource-item", bid, "--title", "Paper", "--url", "https://x"], { cwd: dir }).status, 0);
  assert.strictEqual(readStore(dir).topics[0].blocks[0].items[0].title, "Paper");
});

test("edit-block / move-block / remove-block operate by block id", () => {
  const dir = tmp();
  run(["init", "--title", "T"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  const bid = lastTok(run(["add-text", "--topic", "a"], { cwd: dir, input: "<p>old</p>" }));
  assert.strictEqual(run(["edit-block", bid], { cwd: dir, input: "<p>new</p>" }).status, 0);
  let obj = readStore(dir);
  assert.strictEqual(obj.topics[0].blocks[0].html, "<p>new</p>");
  assert.strictEqual(run(["remove-block", bid], { cwd: dir }).status, 0);
  obj = readStore(dir);
  assert.strictEqual(obj.topics[0].blocks.length, 0);
});

test("build renders HTML from a prereq-free brief store", () => {
  const dir = tmp();
  run(["init", "--title", "Brief"], { cwd: dir });
  run(["add-topic", "--title", "A", "--id", "a"], { cwd: dir });
  run(["add-text", "--topic", "a"], { cwd: dir, input: "<p>body</p>" });
  const r = run(["build", "out"], { cwd: dir });
  assert.strictEqual(r.status, 0, r.stderr);
  const html = fs.readFileSync(path.join(dir, "out.html"), "utf8");
  assert.ok(html.includes("Brief") && html.includes("<p>body</p>"));
  assert.match(html, /<title>Brief<\/title>/);
  assert.ok(html.includes("/*__CONSPECT_DATA_START__*/"), "markers preserved");
  assert.ok(!html.includes("_id"), "internal ids stripped");
});

test("build fails (no file) when a topic uses a removed block type", () => {
  const dir = tmp();
  run(["init", "--title", "X"], { cwd: dir });
  fs.writeFileSync(path.join(dir, "conspect.json"), JSON.stringify({ title: "X", lang: "ru", topics: [{ id: "a", title: "A", blocks: [{ _id: "b1", type: "selfcheck", items: [] }] }] }));
  const r = run(["build", "out"], { cwd: dir });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /not supported in paper-brief/);
  assert.ok(!fs.existsSync(path.join(dir, "out.html")), "no file on failure");
});
