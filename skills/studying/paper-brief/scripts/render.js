"use strict";
const START = "/*__CONSPECT_DATA_START__*/";
const END = "/*__CONSPECT_DATA_END__*/";

function splice(template, dataText) {
  const beforeStart = template.split(START);
  if (beforeStart.length !== 2) throw new Error("template must contain exactly one " + START);
  const afterEnd = beforeStart[1].split(END);
  if (afterEnd.length !== 2) throw new Error("template must contain exactly one " + END);
  return beforeStart[0] + START + "\n" + dataText + "\n" + END + afterEnd[1];
}

function serialize(obj) {
  const clean = JSON.parse(JSON.stringify(obj));
  (function strip(topics) {
    for (const t of topics || []) {
      for (const b of t.blocks || []) delete b._id;
      if (t.children) strip(t.children);
    }
  })(clean.topics);
  return JSON.stringify(clean, null, 2);
}

module.exports = { START, END, splice, serialize };
