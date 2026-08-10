const fs = require("fs");
const path = require("path");

const { parsePDF } = require("./pdfParser");
const { chunkText } = require("./chunkText");
const { getEmbedding } = require("../memory/embeddings");

function sanitizeFileName(fileName) {
  return fileName.replace(/[^\w.-]+/g, "_");
}

async function storeDocument(pdfPath) {
  const text = await parsePDF(pdfPath);
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    throw new Error("The PDF did not contain enough readable text to index.");
  }

  const originalFileName = path.basename(pdfPath, path.extname(pdfPath));
  const fileName = sanitizeFileName(originalFileName);
  const uploadedAt = new Date().toISOString();

  const storedChunks = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    const embedding = await getEmbedding(chunk.text);
    storedChunks.push({
      id: `${fileName}-${index}`,
      source: fileName,
      chunkIndex: index,
      text: chunk.text,
      charStart: chunk.start,
      charEnd: chunk.end,
      uploadedAt,
      embedding,
    });
  }

  const documentsFolder = path.join(__dirname, "documents");
  fs.mkdirSync(documentsFolder, { recursive: true });

  const savePath = path.join(documentsFolder, `${fileName}.json`);
  fs.writeFileSync(savePath, JSON.stringify(storedChunks, null, 2));

  console.log(`Stored ${chunks.length} chunks in ${fileName}.json`);

  return {
    fileName,
    chunkCount: chunks.length,
  };
}

module.exports = {
  storeDocument,
};