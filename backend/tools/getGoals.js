const {
  loadMemories,
} = require("../memory/memoryStore");

function getGoals() {

  const memories =
    loadMemories();

  return memories.filter(
    memory =>
      memory.category === "goal"
  );
}

module.exports = {
  getGoals,
};