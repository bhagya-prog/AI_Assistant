const OpenAI = require("openai");

const { retrieveMemory } = require("../memory/retrieveMemory");
const { storeMemory } = require("../memory/storeMemory");
const { shouldStoreMemory } = require("../memory/memoryDetector");
const { updateProfile } = require("../profile/updateProfile");
const { detectTool } = require("../tools/toolRouter");
const { getProfile } = require("../profile/profileManager");
const { answerFromDocument } = require("../rag/answerFromDocument");
const { chooseTool } = require("../agent/choseTool");
const { getSummary } = require("../summaries/summaryManager");
const { getMeta, saveMeta } = require("../summaries/summaryMetaManager");
const { summarizeConversation } = require("../summaries/summarizeConversation");
const { assistantConfig } = require("../config/assistantConfig");
const { getRagStats } = require("../rag/ragStats");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const ALLOWED_TOOLS = new Set(["MEMORY", "RAG", "CALCULATOR", "NONE"]);

function normalizeSelectedTool(toolName) {
  const normalized = String(toolName || "").trim().toUpperCase();
  if (!ALLOWED_TOOLS.has(normalized)) {
    return "NONE";
  }
  return normalized;
}

const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        error: "messages must be a non-empty array.",
      });
      return;
    }

    const latestMessage = messages[messages.length - 1]?.content;
    if (typeof latestMessage !== "string" || latestMessage.trim().length === 0) {
      res.status(400).json({
        error: "Latest message content is required.",
      });
      return;
    }

    const selectedTool = normalizeSelectedTool(await chooseTool(latestMessage));
    console.log("Agent Decision:", selectedTool);

    if (selectedTool === "RAG") {
      const ragResult = await answerFromDocument(latestMessage);
      res.json({
        reply: ragResult.answer,
        meta: {
          tool: "rag",
          sources: ragResult.sources,
          retrievedCount: ragResult.retrievedCount,
        },
      });
      return;
    }

    const toolResponse = detectTool(latestMessage);
    if (toolResponse?.tool === "pdf" && typeof toolResponse.query === "string") {
      const ragResult = await answerFromDocument(toolResponse.query.trim());
      res.json({
        reply: ragResult.answer,
        meta: {
          tool: "rag",
          sources: ragResult.sources,
          retrievedCount: ragResult.retrievedCount,
        },
      });
      return;
    }

    if (toolResponse && toolResponse.result !== undefined) {
      res.json({
        reply: `Tool Used: ${toolResponse.tool}\n\nResult:\n\n${JSON.stringify(
          toolResponse.result,
          null,
          2
        )}`,
        meta: {
          tool: toolResponse.tool,
        },
      });
      return;
    }

    if (shouldStoreMemory(latestMessage)) {
      await storeMemory(latestMessage);
      updateProfile(latestMessage);
    }

    const memories = await retrieveMemory(latestMessage);
    const memoryContext =
      memories.length > 0
        ? memories.map(memory => `- ${memory.text}`).join("\n")
        : "- No relevant memories found.";

    const conversationSummary = getSummary();
    const summaryContext = conversationSummary
      ? `Conversation Summary:\n${conversationSummary}`
      : "No conversation summary available.";

    const profile = getProfile();
    const profileContext = `User Profile
Name: ${profile.name || "Unknown"}
Favorite Language: ${profile.favorite_language || "Unknown"}
Goal: ${profile.goal || "Unknown"}
Likes: ${profile.likes?.length ? profile.likes.join(", ") : "None"}`;

    const enhancedMessages = [
      {
        role: "system",
        content: `You are an advanced AI assistant.
${summaryContext}

${profileContext}

Relevant Memories:
${memoryContext}

Instructions:
- Use profile and memory context when directly useful.
- Be concise, accurate and helpful.
- Never invent facts.
- If information is uncertain, clearly say so.`,
      },
      ...messages,
    ];

    const response = await client.chat.completions.create({
      model: assistantConfig.model,
      messages: enhancedMessages,
    });

    const meta = getMeta();
    if (messages.length - meta.lastSummarizedAt >= assistantConfig.summaryIntervalMessages) {
      await summarizeConversation(messages);
      meta.lastSummarizedAt = messages.length;
      saveMeta(meta);
    }

    res.json({
      reply: response.choices[0].message.content,
      meta: {
        tool: "chat",
      },
    });
  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

const getAssistantStatus = (req, res) => {
  const ragStats = getRagStats();
  res.json({
    ok: true,
    model: assistantConfig.model,
    features: {
      chat: true,
      memory: true,
      profile: true,
      rag: true,
      tools: ["calculator", "time", "goals"],
    },
    rag: ragStats,
  });
};

module.exports = {
  chatWithAI,
  getAssistantStatus,
};