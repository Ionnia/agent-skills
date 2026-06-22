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

test("variadic flags greedily consume space-separated values", () => {
  const r = parseArgs(["add-table", "--headers", "A", "B", "C", "--row-header"]);
  assert.deepStrictEqual(r.flags.headers, ["A", "B", "C"]);
  assert.strictEqual(r.flags["row-header"], true);
  assert.deepStrictEqual(r._, ["add-table"]); // B, C NOT dropped into positionals
});

test("variadic flag with one value still yields an array", () => {
  const r = parseArgs(["x", "--headers", "Only"]);
  assert.deepStrictEqual(r.flags.headers, ["Only"]);
});

test("non-variadic flag consumes exactly one token", () => {
  const r = parseArgs(["show", "--title", "A", "extra"]);
  assert.strictEqual(r.flags.title, "A");
  assert.deepStrictEqual(r._, ["show", "extra"]);
});

test("variadic --cell still supports repeated flags", () => {
  const r = parseArgs(["add-table-row", "b1", "--cell", "a", "--cell", "b"]);
  assert.deepStrictEqual(r.flags.cell, ["a", "b"]);
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
