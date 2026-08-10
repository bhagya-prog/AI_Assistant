const fs = require("fs");
const pdf = require("pdf-parse");

async function parsePDF(path) {

  const buffer =
    fs.readFileSync(path);

  const data =
    await pdf(buffer);

  return data.text;
}

module.exports = {
  parsePDF,
};