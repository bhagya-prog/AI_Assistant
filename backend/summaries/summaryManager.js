const fs = require("fs");
const path = require("path");

const summaryPath =
  path.join(
    __dirname,
    "conversationSummary.json"
  );

function getSummary() {
  if (!fs.existsSync(summaryPath)) {
    saveSummary("");
    return "";
  }

  const data =
    JSON.parse(
      fs.readFileSync(
        summaryPath,
        "utf8"
      )
    );

  return data.summary;
}

function saveSummary(
  summary
) {

  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      { summary },
      null,
      2
    )
  );

}

module.exports = {
  getSummary,
  saveSummary,
};