"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { parseArgs, treeView } = require("./cli.js");

test("parseArgs splits positionals and flags", () => {
  const r = parseArgs(["add-topic", "--title", "A B", "--id=x", "--flag"]);
  assert.deepStrictEqual(r._, ["add-topic"]);
  assert.strictEqual(r.flags.title, "A B");
  assert.strictEqual(r.flags.id, "x");
  assert.strictEqual(r.flags.flag, true);
});

test("repeated flags collect into an array", () => {
  const r = parseArgs(["x", "--h", "a", "--h", "b"]);
  assert.deepStrictEqual(r.flags.h, ["a", "b"]);
});

test("treeView shows ids, titles and block summaries", () => {
  const obj = { title: "T", topics: [
    { id: "a", title: "A", blocks: [{ _id: "b1", type: "prereq" }, { _id: "b2", type: "text" }],
      children: [{ id: "c", title: "C", blocks: [{ _id: "b3", type: "prereq" }] }] },
  ] };
  const out = treeView(obj);
  assert.match(out, /a\s+"A"/);
  assert.match(out, /text:b2/);
  assert.match(out, /\bc\b\s+"C"/);
});
