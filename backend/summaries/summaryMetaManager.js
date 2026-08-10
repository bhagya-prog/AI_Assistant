const fs = require("fs");
const path = require("path");

const metaPath =
  path.join(
    __dirname,
    "summaryMeta.json"
  );

function getMeta() {
  if (!fs.existsSync(metaPath)) {
    const defaultMeta = {
      lastSummarizedAt: 0,
    };
    saveMeta(defaultMeta);
    return defaultMeta;
  }

  return JSON.parse(
    fs.readFileSync(
      metaPath,
      "utf8"
    )
  );

}

function saveMeta(meta) {

  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      meta,
      null,
      2
    )
  );

}

module.exports = {
  getMeta,
  saveMeta,
};