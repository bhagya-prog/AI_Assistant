function getMemoryCategory(text) {

  const lower =
    text.toLowerCase();

  if (
    lower.includes("my name") ||
    lower.includes("i am") ||
    lower.includes("i'm")
  ) {
    return "identity";
  }

  if (
    lower.includes("favorite") ||
    lower.includes("i like") ||
    lower.includes("i love") ||
    lower.includes("i prefer") ||
    lower.includes("i enjoy")
  ) {
    return "preference";
  }

  if (
    lower.includes("goal") ||
    lower.includes("dream") ||
    lower.includes("aspire") ||
    lower.includes("want to become")
  ) {
    return "goal";
  }

  if (
    lower.includes("studying") ||
    lower.includes("working") ||
    lower.includes("career")
  ) {
    return "career";
  }

  return "other";
}

module.exports = {
  getMemoryCategory,
};