function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseScore(value, fallback) {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
}

const assistantConfig = {
  model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
  summaryIntervalMessages: parsePositiveInt(
    process.env.SUMMARY_INTERVAL_MESSAGES,
    20
  ),
  ragTopK: parsePositiveInt(process.env.RAG_TOP_K, 5),
  ragMinScore: parseScore(process.env.RAG_MIN_SCORE, 0.2),
  maxUploadSizeMb: parsePositiveInt(process.env.MAX_UPLOAD_SIZE_MB, 20),
};

module.exports = {
  assistantConfig,
};
