require("dotenv").config();
const OpenAI = require("openai");
const {
  assistantConfig,
} = require("../config/assistantConfig");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function chooseTool(
  userMessage
) {

  const response =
    await client.chat.completions.create({
      model:
        assistantConfig.model,

      messages: [
        {
          role: "system",
          content: `
You are a tool selection AI.

Available tools:

MEMORY
RAG
CALCULATOR
NONE

Rules:

- Questions about uploaded documents -> RAG
- Questions about past conversations -> MEMORY
- Mathematical calculations -> CALCULATOR
- Everything else -> NONE

Reply with ONLY one word:
MEMORY
RAG
CALCULATOR
NONE
`,
        },

        {
          role: "user",
          content:
            userMessage,
        },
      ],
    });

  return response
    .choices[0]
    .message.content
    .trim();
}

module.exports = {
  chooseTool,
};