function shouldStoreMemory(text) {

  const triggers = [
    "my favorite",
    "i love",
    "i like",
    "i am",
    "i'm",
    "remember",
    "my name is",
    "i enjoy",
    "i prefer",
  ];

  return triggers.some(trigger =>
    text.toLowerCase().includes(trigger)
  );
}

module.exports = {
  shouldStoreMemory,
};