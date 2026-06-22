"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const s = require("./store.js");

test("slugify normalizes titles", () => {
  assert.strictEqual(s.slugify("Предел Функции 2!"), "2"); // cyrillic dropped, digit kept
  assert.strictEqual(s.slugify("Chain Rule"), "chain-rule");
  assert.strictEqual(s.slugify("!!!"), "topic");
});

test("uniqueTopicId suffixes on collision", () => {
  const obj = { topics: [{ id: "x", blocks: [] }, { id: "x-2", blocks: [] }] };
  assert.strictEqual(s.uniqueTopicId(obj, "x"), "x-3");
  assert.strictEqual(s.uniqueTopicId(obj, "y"), "y");
});

test("nextBlockId increments across the tree", () => {
  const obj = { topics: [{ id: "a", blocks: [{ _id: "b1" }, { _id: "b4" }], children: [{ id: "c", blocks: [{ _id: "b2" }] }] }] };
  assert.strictEqual(s.nextBlockId(obj), "b5");
  assert.strictEqual(s.nextBlockId({ topics: [{ id: "a", blocks: [] }] }), "b1");
});

test("uniqueBlockId rejects duplicates, accepts free ids", () => {
  const obj = { topics: [{ id: "a", blocks: [{ _id: "b1", type: "table" }] }] };
  assert.strictEqual(s.uniqueBlockId(obj, "t-main"), "t-main");
  assert.throws(() => s.uniqueBlockId(obj, "b1"), /already exists/);
});

test("lastBlockOfType returns highest-numbered matching block", () => {
  const obj = { topics: [{ id: "a", blocks: [
    { _id: "b1", type: "table" }, { _id: "b5", type: "table" }, { _id: "b3", type: "resources" },
  ] }] };
  assert.strictEqual(s.lastBlockOfType(obj, "table"), "b5");
  assert.strictEqual(s.lastBlockOfType(obj, "resources"), "b3");
  assert.strictEqual(s.lastBlockOfType(obj, "image"), null);
});

test("lastBlockOfType prefers a later custom-id block over an earlier auto id", () => {
  const obj = { topics: [{ id: "a", blocks: [
    { _id: "b1", type: "table" }, { _id: "custom", type: "table" },
  ] }] };
  assert.strictEqual(s.lastBlockOfType(obj, "table"), "custom");
});

test("findTopic / findBlock locate nodes", () => {
  const obj = { topics: [{ id: "a", blocks: [{ _id: "b1", type: "text" }], children: [{ id: "c", blocks: [] }] }] };
  assert.strictEqual(s.findTopic(obj, "c").topic.id, "c");
  assert.strictEqual(s.findBlock(obj, "b1").block.type, "text");
  assert.strictEqual(s.findTopic(obj, "nope"), null);
});

test("resolvePos handles end / index / before / after", () => {
  const arr = [{ id: "p" }, { id: "q" }];
  assert.strictEqual(s.resolvePos(arr, "end", "id"), 2);
  assert.strictEqual(s.resolvePos(arr, "before:q", "id"), 1);
  assert.strictEqual(s.resolvePos(arr, "after:p", "id"), 1);
  assert.strictEqual(s.resolvePos(arr, 0, "id"), 0);
  assert.throws(() => s.resolvePos(arr, "before:zzz", "id"), /zzz/);
});

test("insertTopic / removeTopic / rewriteLinks / insertBlock mutate the tree", () => {
  const obj = { title: "T", topics: [] };
  s.insertTopic(obj, { id: "a", title: "A", blocks: [] });
  s.insertTopic(obj, { id: "c", title: "C", blocks: [] }, "a");
  assert.strictEqual(obj.topics[0].children[0].id, "c");
  const bid = s.insertBlock(obj, "a", { type: "text", html: '<a href="#c">x</a>' });
  assert.match(bid, /^b\d+$/);
  s.rewriteLinks(obj, "c", "gamma");
  assert.ok(JSON.stringify(obj).includes("#gamma"));
  const removed = s.removeTopic(obj, "a");
  assert.deepStrictEqual(removed, ["a", "c"]);
  assert.deepStrictEqual(obj.topics, []);
});
