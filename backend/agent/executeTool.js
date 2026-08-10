const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function chooseTool(message) {

  const response =
    await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are a tool selector.

Available tools:

calculator
time
goals

Respond ONLY with:

calculator
time
goals
none
`,
        },

        {
          role: "user",
          content: message,
        },
      ],
    });

  return response
    .choices[0]
    .message.content
    .trim()
    .toLowerCase();
}

module.exports = {
  chooseTool,
};