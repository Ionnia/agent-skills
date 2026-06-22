"use strict";

const BLOCK_TYPES = ["text", "attention", "image", "formula", "resources", "table"];
const REMOVED_TYPES = ["prereq", "example", "selfcheck"];
const PREREQ_FIRST = false;

function hasControlChar(s) {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 8 || c === 11 || c === 12 || (c >= 14 && c <= 31)) return true;
  }
  return false;
}

function validateBlock(blk, topicId) {
  const warnings = [];
  if (REMOVED_TYPES.includes(blk.type))
    throw new Error(topicId + ": block type " + JSON.stringify(blk.type) + " is not supported in paper-brief (prereq/example/selfcheck were removed; use text/image/formula/table/attention/resources)");
  if (!BLOCK_TYPES.includes(blk.type))
    throw new Error(topicId + ": unknown block type " + JSON.stringify(blk.type));
  if (blk.type === "image" && !blk.svg && !blk.canvas && !blk.src)
    warnings.push("WARN " + topicId + ": image block has no svg/canvas/src (placeholder is deprecated)");
  if (blk.type === "formula" && (typeof blk.tex !== "string" || !blk.tex.trim() || typeof blk.explain !== "string" || !blk.explain.trim()))
    throw new Error(topicId + ": formula block needs non-empty string tex and explain");
  if (blk.type === "table") {
    if (!Array.isArray(blk.headers) || blk.headers.length === 0)
      throw new Error(topicId + ": table block needs a non-empty headers array");
    for (const h of blk.headers)
      if (typeof h !== "string") throw new Error(topicId + ": table headers must all be strings");
    if (!Array.isArray(blk.rows) || blk.rows.length === 0)
      throw new Error(topicId + ": table block needs a non-empty rows array");
    for (let i = 0; i < blk.rows.length; i++) {
      const row = blk.rows[i];
      if (!Array.isArray(row) || row.length !== blk.headers.length)
        throw new Error(topicId + ": table row " + i + " has " + (Array.isArray(row) ? row.length : "non-array") + " cells, expected " + blk.headers.length);
      for (const c of row)
        if (typeof c !== "string") throw new Error(topicId + ": table row " + i + " cells must all be strings");
    }
    if (blk.align !== undefined) {
      if (!Array.isArray(blk.align) || blk.align.length !== blk.headers.length)
        throw new Error(topicId + ": table align must be an array of length " + blk.headers.length);
      for (const a of blk.align)
        if (!["left", "center", "right"].includes(a)) throw new Error(topicId + ": table align entries must be left, center or right");
    }
    if (blk.rowHeader !== undefined && typeof blk.rowHeader !== "boolean")
      throw new Error(topicId + ": table rowHeader must be a boolean");
    if (blk.caption !== undefined && typeof blk.caption !== "string")
      throw new Error(topicId + ": table caption must be a string");
  }
  return { warnings };
}

function validateDocument(obj) {
  if (typeof obj.title !== "string" || !obj.title) throw new Error("title must be a non-empty string");
  if (obj.lang !== undefined && !["ru", "en"].includes(obj.lang)) throw new Error("lang must be ru or en");
  if (!Array.isArray(obj.topics) || obj.topics.length === 0) throw new Error("topics must be a non-empty array");

  const ids = [];
  const warnings = [];
  (function walk(topics) {
    for (const t of topics) {
      if (!/^[a-z0-9-]+$/.test(t.id || "")) throw new Error("bad topic id: " + JSON.stringify(t.id));
      ids.push(t.id);
      if (typeof t.title !== "string" || !t.title) throw new Error(t.id + ": title missing");
      if (!Array.isArray(t.blocks) || t.blocks.length === 0)
        throw new Error(t.id + ": blocks must be a non-empty array");
      if (PREREQ_FIRST && t.blocks[0].type !== "prereq")
        throw new Error(t.id + ": first block must be type prereq");
      for (const blk of t.blocks) warnings.push(...validateBlock(blk, t.id).warnings);
      if (t.children) walk(t.children);
    }
  })(obj.topics);

  if (new Set(ids).size !== ids.length) throw new Error("duplicate topic ids");

  (function scan(val, p) {
    if (typeof val === "string") {
      if (hasControlChar(val))
        throw new Error("control character in " + p + " - a LaTeX backslash was eaten by JSON escaping (e.g. a single-backslash \\frac parsed as form-feed + rac). Fix the formulas or switch to String.raw.");
    } else if (val && typeof val === "object") {
      for (const k of Object.keys(val)) scan(val[k], p + "." + k);
    }
  })(obj, "data");

  const idSet = new Set(ids);
  (function links(val, p) {
    if (typeof val === "string") {
      const re = /#([a-z0-9-]+)/g;
      let m;
      while ((m = re.exec(val)) !== null) {
        if (val.includes('href="#' + m[1] + '"') || val === "#" + m[1]) {
          if (!idSet.has(m[1])) throw new Error("dangling internal link #" + m[1] + " in " + p);
        }
      }
    } else if (val && typeof val === "object") {
      for (const k of Object.keys(val)) links(val[k], p + "." + k);
    }
  })(obj, "data");

  return { ids, warnings };
}

module.exports = { BLOCK_TYPES, REMOVED_TYPES, PREREQ_FIRST, hasControlChar, validateBlock, validateDocument };
