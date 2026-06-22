"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { splice, serialize, spliceTitle, START, END } = require("./render.js");

test("spliceTitle replaces the static title and escapes HTML", () => {
  const tpl = `<head><title>Конспект</title></head>`;
  const out = spliceTitle(tpl, 'A & B <x>');
  assert.match(out, /<title>A &amp; B &lt;x&gt;<\/title>/);
  assert.ok(!out.includes("Конспект"));
});

test("splice inserts data between the markers and preserves them", () => {
  const tpl = `head ${START}\nOLD\n${END} tail`;
  const out = splice(tpl, "NEW");
  assert.ok(out.includes(START) && out.includes(END), "markers preserved");
  assert.ok(out.includes("NEW") && !out.includes("OLD"), "data replaced");
  assert.match(out, /head .*tail/s);
});

test("splice throws when a marker is missing", () => {
  assert.throws(() => splice("no markers here", "x"), /exactly one/i);
});

test("serialize strips block _id and yields valid-JS JSON", () => {
  const obj = { title: "T", topics: [{ id: "a", title: "A", blocks: [{ _id: "b1", type: "text", html: "<p>hi</p>" }] }] };
  const s = serialize(obj);
  assert.ok(!s.includes("_id"), "no internal id leaks");
  const back = new Function("return (" + s + ")")();
  assert.strictEqual(back.topics[0].blocks[0].type, "text");
});
