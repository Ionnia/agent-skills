"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const v = require("./validate.js");

const doc = (over = {}) => ({
  title: "T", lang: "ru",
  topics: [{ id: "a", title: "A", blocks: [{ type: "prereq", items: [] }, { type: "text", html: "<p>x</p>" }] }],
  ...over,
});

test("a minimal valid document passes and returns its ids", () => {
  const r = v.validateDocument(doc());
  assert.deepStrictEqual(r.ids, ["a"]);
});

test("missing prereq-first is rejected", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [{ type: "text", html: "<p>x</p>" }] }] });
  assert.throws(() => v.validateDocument(d), /first block must be type prereq/);
});

test("duplicate ids are rejected", () => {
  const d = doc({ topics: [
    { id: "a", title: "A", blocks: [{ type: "prereq", items: [] }] },
    { id: "a", title: "B", blocks: [{ type: "prereq", items: [] }] },
  ] });
  assert.throws(() => v.validateDocument(d), /duplicate/);
});

test("formula without explain is rejected", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [
    { type: "prereq", items: [] }, { type: "formula", tex: "x", explain: "" },
  ] }] });
  assert.throws(() => v.validateDocument(d), /formula/);
});

test("control character (eaten LaTeX backslash) is caught", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [
    { type: "prereq", items: [] }, { type: "text", html: "\f rac" },
  ] }] });
  assert.throws(() => v.validateDocument(d), /control character/);
});

test("table with wrong row width is rejected", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [
    { type: "prereq", items: [] },
    { type: "table", headers: ["h1", "h2"], rows: [["only-one"]] },
  ] }] });
  assert.throws(() => v.validateDocument(d), /table row 0/);
});

test("dangling internal link is rejected", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [
    { type: "prereq", items: [] }, { type: "text", html: '<a href="#ghost">x</a>' },
  ] }] });
  assert.throws(() => v.validateDocument(d), /#ghost/);
});

test("resolvable internal link passes", () => {
  const d = doc({ topics: [
    { id: "a", title: "A", blocks: [{ type: "prereq", items: [] }, { type: "text", html: '<a href="#b">x</a>' }] },
    { id: "b", title: "B", blocks: [{ type: "prereq", items: [{ title: "A", url: "#a" }] }] },
  ] });
  assert.doesNotThrow(() => v.validateDocument(d));
});
