const fs = require("fs");
const path = require("path");

const { getEmbedding } = require("../memory/embeddings");
const { cosineSimilarity } = require("../memory/similarity");
const { assistantConfig } = require("../config/assistantConfig");

const documentsFolder = path.join(__dirname, "documents");

function tokenize(text) {
  return (text.toLowerCase().match(/\b[a-z0-9]{2,}\b/g) || []).filter(Boolean);
}

function lexicalSimilarity(query, text) {
  const queryTokens = tokenize(query);
  const textTokens = tokenize(text);

  if (queryTokens.length === 0 || textTokens.length === 0) {
    return 0;
  }

  const tokenSet = new Set(textTokens);
  const overlapCount = queryTokens.filter(token => tokenSet.has(token)).length;
  return overlapCount / queryTokens.length;
}

async function retrieveDocument(query) {
  if (!fs.existsSync(documentsFolder)) {
    return [];
  }

  const files = fs
    .readdirSync(documentsFolder)
    .filter(file => file.endsWith(".json"));

  if (files.length === 0) {
    return [];
  }

  const allChunks = [];
  for (const file of files) {
    const filePath = path.join(documentsFolder, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      continue;
    }

    const source = file.replace(".json", "");
    for (const chunk of parsed) {
      if (!chunk || typeof chunk.text !== "string" || !Array.isArray(chunk.embedding)) {
        continue;
      }
      allChunks.push({
        source: chunk.source || source,
        text: chunk.text,
        embedding: chunk.embedding,
        chunkIndex: chunk.chunkIndex ?? null,
      });
    }
  }

  if (allChunks.length === 0) {
    return [];
  }

  const queryEmbedding = await getEmbedding(query);

  const scoredChunks = allChunks.map(chunk => {
    const semanticScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    const lexicalScore = lexicalSimilarity(query, chunk.text);
    const score = semanticScore * 0.75 + lexicalScore * 0.25;

    return {
      source: chunk.source,
      text: chunk.text,
      chunkIndex: chunk.chunkIndex,
      semanticScore,
      lexicalScore,
      score,
    };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  return scoredChunks
    .filter(chunk => chunk.score >= assistantConfig.ragMinScore)
    .slice(0, assistantConfig.ragTopK);
}

module.exports = {
  retrieveDocument,
};