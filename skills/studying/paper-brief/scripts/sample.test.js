"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BUILD = path.join(__dirname, "build.js");
const TEMPLATE = path.join(__dirname, "..", "templates", "template.html");
const START = "/*__CONSPECT_DATA_START__*/";
const END = "/*__CONSPECT_DATA_END__*/";

test("template's built-in sample is a valid paper-brief and uses no removed blocks", () => {
  const tpl = fs.readFileSync(TEMPLATE, "utf8");
  const sample = tpl.split(START)[1].split(END)[0].trim();

  for (const removed of ['type: "prereq"', 'type: "example"', 'type: "selfcheck"']) {
    assert.ok(!sample.includes(removed), `sample must not contain ${removed}`);
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "paper-brief-sample-"));
  const dataPath = path.join(dir, "data.js");
  fs.writeFileSync(dataPath, sample);
  const r = spawnSync("node", [BUILD, dataPath, "sample", dir], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, "sample should build cleanly: " + r.stderr);
  assert.ok(fs.existsSync(path.join(dir, "sample.html")));
});
