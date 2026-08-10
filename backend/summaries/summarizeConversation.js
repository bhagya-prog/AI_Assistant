require("dotenv").config();

const OpenAI =
  require("openai");
const {
  assistantConfig,
} = require("../config/assistantConfig");

const {
  saveSummary,
} = require(
  "./summaryManager"
);

const client =
  new OpenAI({
    apiKey:
      process.env.GROQ_API_KEY,

    baseURL:
      "https://api.groq.com/openai/v1",
  });

async function summarizeConversation(
  messages
) {

  const conversation =
    messages
      .map(
        msg =>
          `${msg.role}: ${msg.content}`
      )
      .join("\n");

  const response =
    await client.chat.completions.create({
      model:
        assistantConfig.model,

      messages: [
        {
          role: "system",
          content:
            "Create a concise summary of this conversation. Keep important facts, preferences, goals and ongoing topics.",
        },

        {
          role: "user",
          content:
            conversation,
        },
      ],
    });

  const summary =
    response.choices[0]
      .message.content;

  saveSummary(summary);

  return summary;
}

module.exports = {
  summarizeConversation,
};