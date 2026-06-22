"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const v = require("./validate.js");

const doc = (over = {}) => ({
  title: "T", lang: "ru",
  topics: [{ id: "a", title: "A", blocks: [{ type: "text", html: "<p>x</p>" }] }],
  ...over,
});

test("a minimal valid brief passes and returns its ids", () => {
  const r = v.validateDocument(doc());
  assert.deepStrictEqual(r.ids, ["a"]);
});

test("topics need no prereq-first block in paper-brief", () => {
  assert.doesNotThrow(() => v.validateDocument(doc()));
});

test("removed block types (prereq/example/selfcheck) are rejected", () => {
  for (const type of ["prereq", "example", "selfcheck"]) {
    const d = doc({ topics: [{ id: "a", title: "A", blocks: [{ type, items: [] }] }] });
    assert.throws(() => v.validateDocument(d), /not supported in paper-brief/);
  }
});

test("empty blocks array is rejected", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [] }] });
  assert.throws(() => v.validateDocument(d), /blocks must be a non-empty array/);
});

test("duplicate ids are rejected", () => {
  const d = doc({ topics: [
    { id: "a", title: "A", blocks: [{ type: "text", html: "x" }] },
    { id: "a", title: "B", blocks: [{ type: "text", html: "y" }] },
  ] });
  assert.throws(() => v.validateDocument(d), /duplicate/);
});

test("formula without explain is rejected", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [{ type: "formula", tex: "x", explain: "" }] }] });
  assert.throws(() => v.validateDocument(d), /formula/);
});

test("control character (eaten LaTeX backslash) is caught", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [{ type: "text", html: "\f rac" }] }] });
  assert.throws(() => v.validateDocument(d), /control character/);
});

test("table with wrong row width is rejected", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [
    { type: "table", headers: ["h1", "h2"], rows: [["only-one"]] },
  ] }] });
  assert.throws(() => v.validateDocument(d), /table row 0/);
});

test("dangling internal link is rejected", () => {
  const d = doc({ topics: [{ id: "a", title: "A", blocks: [{ type: "text", html: '<a href="#ghost">x</a>' }] }] });
  assert.throws(() => v.validateDocument(d), /#ghost/);
});

test("resolvable internal link passes", () => {
  const d = doc({ topics: [
    { id: "a", title: "A", blocks: [{ type: "text", html: '<a href="#b">x</a>' }] },
    { id: "b", title: "B", blocks: [{ type: "text", html: "y" }] },
  ] });
  assert.doesNotThrow(() => v.validateDocument(d));
});
