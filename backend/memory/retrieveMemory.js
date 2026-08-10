const { getEmbedding } =
  require("./embeddings");

const {
  loadMemories,
} = require("./memoryStore");

const {
  cosineSimilarity,
} = require("./similarity");

async function retrieveMemory(query) {

  const queryEmbedding =
    await getEmbedding(query);

  const memories =
    loadMemories();

  const now =
    new Date().getTime();

  const scoredMemories =
    memories.map(memory => {

      const similarity =
        cosineSimilarity(
          queryEmbedding,
          memory.embedding
        );

      // Importance Bonus
      const importanceBonus =
        (memory.importance || 1) * 0.02;

      // Recency Bonus
      let recencyBonus = 0;

      if (memory.updatedAt) {

        const daysOld =
          (now -
            new Date(
              memory.updatedAt
            ).getTime()) /
          (1000 * 60 * 60 * 24);

        recencyBonus =
          Math.max(
            0,
            0.1 - daysOld * 0.002
          );
      }

      const finalScore =
        similarity +
        importanceBonus +
        recencyBonus;

      return {
        text: memory.text,
        category:
          memory.category ||
          "other",
        importance:
          memory.importance ||
          1,
        similarity,
        score: finalScore,
      };
    });

  scoredMemories.sort(
    (a, b) => b.score - a.score
  );

  console.log(
    "\nTop Retrieved Memories:"
  );

  scoredMemories
    .slice(0, 3)
    .forEach(memory => {

      console.log(
        `[${memory.category}] ` +
        `${memory.text} ` +
        `(Score: ${memory.score.toFixed(3)})`
      );

    });

  return scoredMemories.slice(0, 3);
}

module.exports = {
  retrieveMemory,
};