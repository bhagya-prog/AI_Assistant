const OpenAI = require("openai");

const { retrieveDocument } = require("./retrieveDocument");
const { assistantConfig } = require("../config/assistantConfig");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function answerFromDocument(question) {
  const chunks = await retrieveDocument(question);

  if (chunks.length === 0) {
    return {
      answer:
        "I could not find relevant information in the uploaded documents yet. Please upload a PDF or ask a more specific question.",
      sources: [],
      retrievedCount: 0,
    };
  }

  const context = chunks
    .map((chunk, index) => {
      const chunkRef =
        chunk.chunkIndex === null ? `chunk-${index + 1}` : `chunk-${chunk.chunkIndex}`;
      return `[${chunk.source}#${chunkRef} | score ${chunk.score.toFixed(3)}]\n${chunk.text}`;
    })
    .join("\n\n");

  const response = await client.chat.completions.create({
    model: assistantConfig.model,
    messages: [
      {
        role: "system",
        content: `You are a strict RAG assistant.
Use ONLY the provided context.
If the answer is not in context, say "I could not find that information in the uploaded documents."
Cite sources inline using [source#chunk-x].`,
      },
      {
        role: "user",
        content: `Question: ${question}

Context:
${context}`,
      },
    ],
  });

  const sources = chunks.map(chunk => ({
    source: chunk.source,
    chunkIndex: chunk.chunkIndex,
    score: Number(chunk.score.toFixed(3)),
  }));

  return {
    answer: response.choices[0].message.content,
    sources,
    retrievedCount: chunks.length,
  };
}

module.exports = {
  answerFromDocument,
};