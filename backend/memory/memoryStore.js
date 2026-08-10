const fs = require("fs");
const path = require("path");

const memoryFile = path.join(
  __dirname,
  "memories.json"
);

function loadMemories() {
  if (!fs.existsSync(memoryFile)) {
    saveMemories([]);
    return [];
  }

  const data = fs.readFileSync(memoryFile, "utf-8");

  return JSON.parse(data);
}

function saveMemories(memories) {
  fs.writeFileSync(
    memoryFile,
    JSON.stringify(memories, null, 2)
  );
}

module.exports = {
  loadMemories,
  saveMemories,
};