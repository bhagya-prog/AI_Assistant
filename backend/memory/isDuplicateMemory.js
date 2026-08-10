const {
  getEmbedding,
} = require("./embeddings");

const {
  loadMemories,
} = require("./memoryStore");

const {
  cosineSimilarity,
} = require("./similarity");

async function isDuplicateMemory(text) {

  const newEmbedding =
    await getEmbedding(text);

  const memories =
    loadMemories();

  for (const memory of memories) {

    const similarity =
      cosineSimilarity(
        newEmbedding,
        memory.embedding
      );

    if (similarity > 0.92) {
      return true;
    }
  }

  return false;
}

module.exports = {
  isDuplicateMemory,
};