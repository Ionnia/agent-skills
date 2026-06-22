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

// Resolve the block a row/item command targets: explicit <block-id>, or the
// most-recently-created block of `type` via --last.
function rowTarget(flags, pos, type, label) {
  if (pos[0]) return pos[0];
  if (flags.last) {
    const bid = store.lastBlockOfType(store.load(storePath(flags)), type);
    if (!bid) fail("no " + type + " block exists for --last");
    return bid;
  }
  fail(label + " needs <block-id> or --last");
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

  // --- topics ---
  "add-topic"(flags) {
    const p = storePath(flags); const obj = store.load(p);
    if (typeof flags.title !== "string") fail("add-topic needs --title");
    const id = store.uniqueTopicId(obj, typeof flags.id === "string" ? flags.id : store.slugify(flags.title));
    const topic = { id, title: flags.title, blocks: [{ _id: store.nextBlockId(obj), type: "prereq", items: [] }] };
    store.insertTopic(obj, topic, typeof flags.parent === "string" ? flags.parent : undefined, flags.pos);
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
  "add-example"(flags) {
    req(flags.topic, "--topic");
    const b = { type: "example", html: mainContent(flags) };
    if (typeof flags.title === "string") b.title = flags.title;
    say("add-example", emitBlock(flags, flags.topic, b, flags.pos));
  },
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

  // --- prereq (first block, populated in place) ---
  "set-prereq"(flags) {
    req(flags.topic, "--topic");
    const p = storePath(flags); const obj = store.load(p);
    const f = store.findTopic(obj, flags.topic); if (!f) fail("no topic " + flags.topic);
    const blk = f.topic.blocks[0];
    if (!blk || blk.type !== "prereq") fail("topic " + flags.topic + " has no prereq block");
    if (flags.clear) blk.items = [];
    store.save(p, obj); say("set-prereq", blk._id);
  },
  "add-prereq-item"(flags) {
    req(flags.topic, "--topic");
    const item = { title: must(typeof flags.title === "string" ? flags.title : undefined, "--title") };
    if (typeof flags.url === "string") item.url = flags.url;
    if (typeof flags.note === "string") item.note = flags.note;
    const p = storePath(flags); const obj = store.load(p);
    const f = store.findTopic(obj, flags.topic); if (!f) fail("no topic " + flags.topic);
    const blk = f.topic.blocks[0];
    if (!blk || blk.type !== "prereq") fail("topic " + flags.topic + " has no prereq block");
    blk.items.push(item);
    store.save(p, obj); say("add-prereq-item", blk._id);
  },

  // --- selfcheck (multi-item) ---
  "add-selfcheck"(flags) {
    req(flags.topic, "--topic");
    const b = { type: "selfcheck", items: [] };
    const p = storePath(flags); const obj = store.load(p);
    if (typeof flags.id === "string") b._id = store.uniqueBlockId(obj, flags.id);
    const id = store.insertBlock(obj, flags.topic, b, flags.pos);
    store.save(p, obj); say("add-selfcheck", id);
  },
  "add-selfcheck-item"(flags, pos) {
    const bid = rowTarget(flags, pos, "selfcheck", "add-selfcheck-item");
    const item = { q: must(field(flags, "q", { allowStdin: true }), "question") };
    const a = field(flags, "a"); if (typeof a === "string") item.a = a;
    mutateBlock(flags, bid, (blk) => { blk.items = blk.items || []; blk.items.push(item); });
    say("add-selfcheck-item", bid);
  },

  // --- table (multi-row) ---
  "add-table"(flags) {
    req(flags.topic, "--topic");
    const headers = [].concat(flags.headers || []).filter((h) => typeof h === "string");
    if (!headers.length) fail("add-table needs --headers");
    const b = { type: "table", headers, rows: [] };
    const align = [].concat(flags.align || []).filter((a) => typeof a === "string");
    if (align.length) b.align = align;
    if (flags["row-header"]) b.rowHeader = true;
    if (typeof flags.caption === "string") b.caption = flags.caption;
    // Full table validation (>=1 row) is deferred to build; insert the empty shell now.
    const p = storePath(flags); const obj = store.load(p);
    if (typeof flags.id === "string") b._id = store.uniqueBlockId(obj, flags.id);
    const id = store.insertBlock(obj, flags.topic, b, flags.pos);
    store.save(p, obj); say("add-table", id);
  },
  "add-table-row"(flags, pos) {
    const bid = rowTarget(flags, pos, "table", "add-table-row");
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
    const b = { type: "resources", items: [] };
    if (typeof flags.id === "string") b._id = store.uniqueBlockId(obj, flags.id);
    const id = store.insertBlock(obj, flags.topic, b, flags.pos);
    store.save(p, obj); say("add-resources", id);
  },
  "add-resource-item"(flags, pos) {
    const bid = rowTarget(flags, pos, "resources", "add-resource-item");
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
    const html = render.spliceTitle(render.splice(tpl, render.serialize(obj)), obj.title);
    const outPath = path.join(outDir, name + ".html");
    fs.writeFileSync(outPath, html);
    for (const w of r.warnings) console.error(w);
    console.log('OK: "' + obj.title + '" — ' + r.ids.length + " topics → " + outPath);
  },
};

// Max positional args each command accepts (excluding the command word). Extra
// positionals are a sign a multi-value flag was mis-typed as space-separated —
// fail loudly instead of silently dropping them.
const MAXPOS = {
  init: 0, "set-meta": 0, tree: 0, show: 1, validate: 0, build: 2,
  "add-topic": 0, "edit-topic": 1, "move-topic": 1, "remove-topic": 1,
  "add-text": 0, "add-attention": 0, "add-example": 0, "add-formula": 0, "add-image": 0,
  "set-prereq": 0, "add-prereq-item": 0, "add-selfcheck": 0, "add-selfcheck-item": 1,
  "add-table": 0, "add-table-row": 1, "add-resources": 0, "add-resource-item": 1,
  "add-block": 0, "edit-block": 1, "move-block": 1, "remove-block": 1,
};

function main() {
  const { _, flags } = cli.parseArgs(process.argv.slice(2));
  const cmd = _[0];
  if (!cmd || !commands[cmd]) fail("unknown command: " + (cmd || "(none)"));
  const extra = _.slice(1);
  if (cmd in MAXPOS && extra.length > MAXPOS[cmd])
    fail('unexpected argument "' + extra[MAXPOS[cmd]] + '" for ' + cmd +
         " — repeat the flag (e.g. --headers A --headers B) or quote a multi-word value");
  try { commands[cmd](flags, extra); }
  catch (e) { fail(e.message); }
}
main();
