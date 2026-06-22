#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const store = require("./store.js");
const cli = require("./cli.js");
const validate = require("./validate.js");
const render = require("./render.js");

function fail(msg) { console.error("ERROR: " + msg); process.exit(1); }
function req(v, name) { if (v === undefined || v === true) fail(name + " is required"); }
function must(v, name) { if (v === undefined) fail(name + " is required"); return v; }
function say(cmd, id) { console.log("OK: " + cmd + " " + id); }

function storePath(flags) { return typeof flags.store === "string" ? flags.store : store.DEFAULT_STORE; }
function stdinPiped() { return !process.stdin.isTTY; }
function readStdin() {
  if (process.stdin.isTTY) return "";
  try { return fs.readFileSync(0, "utf8"); } catch (e) { return ""; }
}

// Main block content: --in <file> | stdin.
function mainContent(flags) {
  if (typeof flags.in === "string") return fs.readFileSync(flags.in, "utf8");
  return readStdin();
}

// Named field: --<name>-in <file> | --<name> <literal> | stdin (if allowed). undefined if absent.
function field(flags, name, { allowStdin = false } = {}) {
  if (typeof flags[name + "-in"] === "string") return fs.readFileSync(flags[name + "-in"], "utf8");
  if (typeof flags[name] === "string") return flags[name];
  if (allowStdin) return readStdin();
  return undefined;
}

// Build + validate + insert a single block; returns its id.
function emitBlock(flags, topicId, block, pos) {
  const p = storePath(flags); const obj = store.load(p);
  const { warnings } = validate.validateBlock(block, topicId); // throws on hard fault
  const id = store.insertBlock(obj, topicId, block, pos);
  store.save(p, obj);
  for (const w of warnings) console.error(w);
  return id;
}

// Mutate an existing block in place, re-validate it, save.
function mutateBlock(flags, bid, fn) {
  const p = storePath(flags); const obj = store.load(p);
  const f = store.findBlock(obj, bid); if (!f) fail("no block " + bid);
  fn(f.block);
  validate.validateBlock(f.block, f.topic.id);
  store.save(p, obj);
}

const commands = {
  init(flags) {
    if (typeof flags.title !== "string") fail("init needs --title");
    const obj = { title: flags.title, lang: typeof flags.lang === "string" ? flags.lang : "ru", topics: [] };
    store.save(storePath(flags), obj);
    console.log('OK: init "' + obj.title + '" → ' + storePath(flags));
  },
  "set-meta"(flags) {
    const p = storePath(flags); const obj = store.load(p);
    if (typeof flags.title === "string") obj.title = flags.title;
    if (typeof flags.lang === "string") obj.lang = flags.lang;
    store.save(p, obj);
    console.log("OK: set-meta");
  },
  tree(flags) { console.log(cli.treeView(store.load(storePath(flags)))); },
  show(flags, pos) {
    const id = pos[0]; if (!id) fail("show needs a topic or block id");
    console.log(cli.showNode(store.load(storePath(flags)), id));
  },

  // --- topics (paper-brief topics have no prereq block) ---
  "add-topic"(flags) {
    const p = storePath(flags); const obj = store.load(p);
    if (typeof flags.title !== "string") fail("add-topic needs --title");
    const id = store.uniqueTopicId(obj, typeof flags.id === "string" ? flags.id : store.slugify(flags.title));
    store.insertTopic(obj, { id, title: flags.title, blocks: [] }, typeof flags.parent === "string" ? flags.parent : undefined, flags.pos);
    store.save(p, obj);
    console.log("OK: add-topic " + id);
  },
  "edit-topic"(flags, pos) {
    const p = storePath(flags); const obj = store.load(p);
    const id = pos[0]; const f = store.findTopic(obj, id); if (!f) fail("no topic with id " + id);
    if (typeof flags.title === "string") f.topic.title = flags.title;
    if (typeof flags.id === "string" && flags.id !== id) {
      const newId = store.uniqueTopicId(obj, flags.id);
      f.topic.id = newId; store.rewriteLinks(obj, id, newId);
    }
    store.save(p, obj);
    console.log("OK: edit-topic " + f.topic.id);
  },
  "move-topic"(flags, pos) {
    const p = storePath(flags); const obj = store.load(p);
    const id = pos[0]; const f = store.findTopic(obj, id); if (!f) fail("no topic with id " + id);
    const moved = f.topic; f.siblings.splice(f.index, 1);
    store.insertTopic(obj, moved, typeof flags.parent === "string" ? flags.parent : undefined, flags.pos);
    store.save(p, obj);
    console.log("OK: move-topic " + id);
  },
  "remove-topic"(flags, pos) {
    const p = storePath(flags); const obj = store.load(p);
    const id = pos[0]; const removed = store.removeTopic(obj, id);
    const json = JSON.stringify(obj);
    const refs = removed.filter((rid) => json.includes("#" + rid));
    store.save(p, obj);
    if (refs.length) console.error("WARN: dangling links remain to removed topic(s): " + refs.map((r) => "#" + r).join(", "));
    console.log("OK: remove-topic " + id);
  },

  // --- prose blocks ---
  "add-text"(flags) { req(flags.topic, "--topic"); say("add-text", emitBlock(flags, flags.topic, { type: "text", html: mainContent(flags) }, flags.pos)); },
  "add-attention"(flags) { req(flags.topic, "--topic"); say("add-attention", emitBlock(flags, flags.topic, { type: "attention", html: mainContent(flags) }, flags.pos)); },
  "add-formula"(flags) {
    req(flags.topic, "--topic");
    const tex = must(field(flags, "tex"), "--tex");
    const explain = must(field(flags, "explain", { allowStdin: true }), "--explain");
    const b = { type: "formula", tex, explain };
    if (typeof flags.caption === "string") b.caption = flags.caption;
    say("add-formula", emitBlock(flags, flags.topic, b, flags.pos));
  },
  "add-image"(flags) {
    req(flags.topic, "--topic");
    const b = { type: "image" };
    if (typeof flags.svg === "string") b.svg = fs.readFileSync(flags.svg, "utf8");
    else if (typeof flags.canvas === "string") b.canvas = { draw: fs.readFileSync(flags.canvas, "utf8") };
    else if (typeof flags.src === "string") b.src = fs.readFileSync(flags.src, "utf8").trim();
    else if (typeof flags.raster === "string") b.src = execFileSync("python3", [path.join(__dirname, "image-to-inline.py"), flags.raster], { encoding: "utf8" }).trim();
    else fail("add-image needs one of --svg/--canvas/--src/--raster");
    if (typeof flags.caption === "string") b.caption = flags.caption;
    if (typeof flags.aspect === "string") b.aspect = flags.aspect;
    say("add-image", emitBlock(flags, flags.topic, b, flags.pos));
  },

  // --- table (multi-row) ---
  "add-table"(flags) {
    req(flags.topic, "--topic");
    const headers = [].concat(flags.headers || []).filter((h) => typeof h === "string");
    if (!headers.length) fail("add-table needs --headers");
    const b = { type: "table", headers, rows: [] };
    if (flags.align) b.align = [].concat(flags.align);
    if (flags["row-header"]) b.rowHeader = true;
    if (typeof flags.caption === "string") b.caption = flags.caption;
    // Full table validation (>=1 row) is deferred to build; insert the empty shell now.
    const p = storePath(flags); const obj = store.load(p);
    const id = store.insertBlock(obj, flags.topic, b, flags.pos);
    store.save(p, obj); say("add-table", id);
  },
  "add-table-row"(flags, pos) {
    const bid = pos[0]; if (!bid) fail("add-table-row needs <block-id>");
    const cells = [].concat(flags.cell || []).filter((c) => typeof c === "string");
    mutateBlock(flags, bid, (blk) => {
      if (cells.length !== blk.headers.length) throw new Error("row has " + cells.length + " cells, expected " + blk.headers.length);
      blk.rows.push(cells);
    });
    say("add-table-row", bid);
  },

  // --- resources (multi-item) ---
  "add-resources"(flags) {
    req(flags.topic, "--topic");
    const p = storePath(flags); const obj = store.load(p);
    const id = store.insertBlock(obj, flags.topic, { type: "resources", items: [] }, flags.pos);
    store.save(p, obj); say("add-resources", id);
  },
  "add-resource-item"(flags, pos) {
    const bid = pos[0]; if (!bid) fail("add-resource-item needs <block-id>");
    const item = {
      title: must(typeof flags.title === "string" ? flags.title : undefined, "--title"),
      url: must(typeof flags.url === "string" ? flags.url : undefined, "--url"),
    };
    if (typeof flags.note === "string") item.note = flags.note;
    mutateBlock(flags, bid, (blk) => { blk.items = blk.items || []; blk.items.push(item); });
    say("add-resource-item", bid);
  },

  // --- generic block ops (escape hatch) ---
  "add-block"(flags) {
    req(flags.topic, "--topic"); req(flags.type, "--type");
    say("add-block", emitBlock(flags, flags.topic, { type: String(flags.type), html: mainContent(flags) }, flags.pos));
  },
  "edit-block"(flags, pos) {
    const bid = pos[0]; if (!bid) fail("edit-block needs <block-id>");
    const content = typeof flags.in === "string" || stdinPiped() ? mainContent(flags) : undefined;
    mutateBlock(flags, bid, (blk) => {
      if (content !== undefined) blk.html = content;
      for (const k of ["tex", "explain", "caption", "title", "aspect"]) if (typeof flags[k] === "string") blk[k] = flags[k];
    });
    say("edit-block", bid);
  },
  "move-block"(flags, pos) {
    const bid = pos[0]; if (!bid) fail("move-block needs <block-id>"); req(flags.topic, "--topic");
    const p = storePath(flags); const obj = store.load(p);
    const f = store.findBlock(obj, bid); if (!f) fail("no block " + bid);
    const [blk] = f.blocks.splice(f.index, 1);
    const dest = store.findTopic(obj, flags.topic); if (!dest) fail("no topic " + flags.topic);
    dest.topic.blocks = dest.topic.blocks || [];
    dest.topic.blocks.splice(store.resolvePos(dest.topic.blocks, flags.pos, "_id"), 0, blk);
    store.save(p, obj); say("move-block", bid);
  },
  "remove-block"(flags, pos) {
    const bid = pos[0]; if (!bid) fail("remove-block needs <block-id>");
    const p = storePath(flags); const obj = store.load(p);
    const f = store.findBlock(obj, bid); if (!f) fail("no block " + bid);
    f.blocks.splice(f.index, 1); store.save(p, obj); say("remove-block", bid);
  },

  // --- whole-document ---
  validate(flags) {
    const obj = store.load(storePath(flags));
    const r = validate.validateDocument(obj);
    for (const w of r.warnings) console.error(w);
    console.log("OK: valid — " + r.ids.length + " topics");
  },
  build(flags, pos) {
    const name = pos[0]; if (!name) fail("build needs <name>");
    const outDir = pos[1] || process.cwd();
    const obj = store.load(storePath(flags));
    const r = validate.validateDocument(obj);
    const tpl = fs.readFileSync(path.join(__dirname, "..", "templates", "template.html"), "utf8");
    const html = render.splice(tpl, render.serialize(obj));
    const outPath = path.join(outDir, name + ".html");
    fs.writeFileSync(outPath, html);
    for (const w of r.warnings) console.error(w);
    console.log('OK: "' + obj.title + '" — ' + r.ids.length + " topics → " + outPath);
  },
};

function main() {
  const { _, flags } = cli.parseArgs(process.argv.slice(2));
  const cmd = _[0];
  if (!cmd || !commands[cmd]) fail("unknown command: " + (cmd || "(none)"));
  try { commands[cmd](flags, _.slice(1)); }
  catch (e) { fail(e.message); }
}
main();
