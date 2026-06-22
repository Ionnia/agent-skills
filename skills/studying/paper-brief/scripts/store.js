"use strict";
const fs = require("node:fs");
const DEFAULT_STORE = "conspect.json";

function load(p) {
  let raw;
  try { raw = fs.readFileSync(p, "utf8"); }
  catch (e) { throw new Error("no store at " + p + " — run init first"); }
  try { return JSON.parse(raw); }
  catch (e) { throw new Error("store at " + p + " is not valid JSON: " + e.message); }
}

function save(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n"); }

function slugify(str) {
  const out = String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return out || "topic";
}

function allTopics(obj) {
  const acc = [];
  (function walk(ts) { for (const t of ts || []) { acc.push(t); if (t.children) walk(t.children); } })(obj.topics);
  return acc;
}

function uniqueTopicId(obj, base) {
  const taken = new Set(allTopics(obj).map((t) => t.id));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) { const cand = base + "-" + n; if (!taken.has(cand)) return cand; }
}

function nextBlockId(obj) {
  let max = 0;
  for (const t of allTopics(obj))
    for (const b of t.blocks || []) {
      const m = /^b(\d+)$/.exec(b._id || "");
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  return "b" + (max + 1);
}

function findTopic(obj, id) {
  let found = null;
  (function walk(siblings) {
    for (let i = 0; i < siblings.length; i++) {
      const t = siblings[i];
      if (t.id === id) { found = { topic: t, siblings, index: i }; return; }
      if (t.children) walk(t.children);
      if (found) return;
    }
  })(obj.topics);
  return found;
}

function findBlock(obj, blockId) {
  for (const t of allTopics(obj)) {
    const i = (t.blocks || []).findIndex((b) => b._id === blockId);
    if (i >= 0) return { block: t.blocks[i], topic: t, blocks: t.blocks, index: i };
  }
  return null;
}

function resolvePos(arr, pos, key) {
  if (pos === undefined || pos === "end") return arr.length;
  if (typeof pos === "number") return Math.max(0, Math.min(arr.length, pos));
  const asNum = /^\d+$/.test(String(pos)) ? parseInt(pos, 10) : null;
  if (asNum !== null) return Math.max(0, Math.min(arr.length, asNum));
  const m = /^(before|after):(.+)$/.exec(String(pos));
  if (!m) throw new Error("bad --pos: " + pos);
  const idx = arr.findIndex((x) => x[key] === m[2]);
  if (idx < 0) throw new Error("--pos references unknown id: " + m[2]);
  return m[1] === "before" ? idx : idx + 1;
}

function insertTopic(obj, topic, parentId, pos) {
  let arr;
  if (!parentId) arr = obj.topics;
  else {
    const f = findTopic(obj, parentId);
    if (!f) throw new Error("--parent references unknown topic: " + parentId);
    f.topic.children = f.topic.children || [];
    arr = f.topic.children;
  }
  arr.splice(resolvePos(arr, pos, "id"), 0, topic);
}

function removeTopic(obj, id) {
  const f = findTopic(obj, id);
  if (!f) throw new Error("no topic with id " + id);
  const removed = [];
  (function collect(t) { removed.push(t.id); for (const c of t.children || []) collect(c); })(f.topic);
  f.siblings.splice(f.index, 1);
  return removed;
}

function rewriteLinks(obj, oldId, newId) {
  (function walk(v) {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object")
      for (const k of Object.keys(v)) {
        if (typeof v[k] === "string") v[k] = v[k].split("#" + oldId).join("#" + newId);
        else walk(v[k]);
      }
  })(obj);
}

function insertBlock(obj, topicId, block, pos) {
  const f = findTopic(obj, topicId);
  if (!f) throw new Error("no topic with id " + topicId);
  block._id = nextBlockId(obj);
  f.topic.blocks = f.topic.blocks || [];
  f.topic.blocks.splice(resolvePos(f.topic.blocks, pos, "_id"), 0, block);
  return block._id;
}

module.exports = {
  DEFAULT_STORE, load, save, slugify, allTopics, uniqueTopicId, nextBlockId,
  findTopic, findBlock, resolvePos, insertTopic, removeTopic, rewriteLinks, insertBlock,
};
