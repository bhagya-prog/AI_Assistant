const fs = require("fs");
const path = require("path");

const documentsFolder = path.join(__dirname, "documents");

function getRagStats() {
  if (!fs.existsSync(documentsFolder)) {
    return {
      documentCount: 0,
      totalChunks: 0,
      documents: [],
    };
  }

  const files = fs
    .readdirSync(documentsFolder)
    .filter(file => file.endsWith(".json"));

  const documents = [];
  let totalChunks = 0;

  for (const file of files) {
    const filePath = path.join(documentsFolder, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const chunks = Array.isArray(parsed) ? parsed.length : 0;

    documents.push({
      name: file.replace(".json", ""),
      chunks,
      updatedAt: fs.statSync(filePath).mtime.toISOString(),
    });

    totalChunks += chunks;
  }

  documents.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return {
    documentCount: documents.length,
    totalChunks,
    documents,
  };
}

module.exports = {
  getRagStats,
};
