"use strict";
const store = require("./store.js");

function parseArgs(argv) {
  const _ = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      let key = a.slice(2), val = true;
      const eq = key.indexOf("=");
      if (eq >= 0) { val = key.slice(eq + 1); key = key.slice(0, eq); }
      else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) { val = argv[++i]; }
      if (key in flags) flags[key] = [].concat(flags[key], val);
      else flags[key] = val;
    } else _.push(a);
  }
  return { _, flags };
}

function treeView(obj) {
  const lines = [];
  (function walk(ts, depth) {
    for (const t of ts || []) {
      const blocks = (t.blocks || []).map((b) => b.type + ":" + (b._id || "?")).join(", ");
      lines.push("  ".repeat(depth) + t.id + '  "' + t.title + '"  [' + blocks + "]");
      if (t.children) walk(t.children, depth + 1);
    }
  })(obj.topics, 0);
  return lines.join("\n");
}

function showNode(obj, id) {
  const t = store.findTopic(obj, id);
  if (t) return JSON.stringify(t.topic, null, 2);
  const b = store.findBlock(obj, id);
  if (b) return JSON.stringify(b.block, null, 2);
  throw new Error("no topic or block with id " + id);
}

module.exports = { parseArgs, treeView, showNode };
