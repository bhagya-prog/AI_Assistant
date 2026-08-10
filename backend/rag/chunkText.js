function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function chunkText(
  text,
  {
    chunkSize = 700,
    overlap = 120,
    minChunkLength = 80,
  } = {}
) {
  const normalized = normalizeText(text || "");
  if (!normalized) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);

    if (end < normalized.length) {
      const nearestPunctuation = normalized.lastIndexOf(".", end);
      if (nearestPunctuation > start + minChunkLength) {
        end = nearestPunctuation + 1;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk.length >= minChunkLength) {
      chunks.push({
        text: chunk,
        start,
        end,
      });
    }

    if (end >= normalized.length) {
      break;
    }

    const nextStart = Math.max(end - overlap, start + 1);
    start = nextStart;
  }

  return chunks;
}

module.exports = {
  chunkText,
};