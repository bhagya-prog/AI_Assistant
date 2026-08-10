const {
  getEmbedding,
} = require("./embeddings");

const {
  loadMemories,
  saveMemories,
} = require("./memoryStore");

const {
  isDuplicateMemory,
} = require("./isDuplicateMemory");

const {
  getMemoryImportance,
} = require("./memoryImportance");

const {
  getMemoryCategory,
} = require("./memoryCategory");

async function storeMemory(text) {

  const duplicate =
    await isDuplicateMemory(text);

  if (duplicate) {

    console.log(
      "Duplicate memory ignored"
    );

    return;
  }

  const embedding =
    await getEmbedding(text);

  const importance =
    getMemoryImportance(text);

  const category =
    getMemoryCategory(text);

  const memories =
    loadMemories();

  memories.push({
    text,
    embedding,
    importance,
    category,
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  });

  saveMemories(memories);

  console.log(
    `Memory Stored [${category}] (Importance: ${importance})`
  );

  console.log(text);
}

module.exports = {
  storeMemory,
};