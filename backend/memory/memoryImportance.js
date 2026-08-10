function getMemoryImportance(text) {

  const lower = text.toLowerCase();

  const highImportance = [
    "my name",
    "goal",
    "career",
    "dream",
    "favorite",
    "studying",
    "working on",
  ];

  const mediumImportance = [
    "i love",
    "i like",
    "i enjoy",
    "i prefer",
  ];

  for (const item of highImportance) {
    if (lower.includes(item)) {
      return 10;
    }
  }

  for (const item of mediumImportance) {
    if (lower.includes(item)) {
      return 6;
    }
  }

  return 3;
}

module.exports = {
  getMemoryImportance,
};