import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const QUICK_PROMPTS = [
  "Summarize today's key learning goals.",
  "pdf: Explain database recovery checkpoints.",
  "What do you remember about my preferences?",
  "Give me a focused study plan for 2 hours.",
];

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function createChatMessage(type, content, meta = null) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    content,
    meta,
    timestamp: new Date().toISOString(),
  };
}

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdf, setPdf] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [assistantStatus, setAssistantStatus] = useState(null);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  });
  const messagesEndRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const ragReady = (assistantStatus?.rag?.documentCount || 0) > 0;
  const docCount = assistantStatus?.rag?.documentCount || 0;
  const chunkCount = assistantStatus?.rag?.totalChunks || 0;
  const modelName = assistantStatus?.model || "Unknown";

  const assistantStatsLine = useMemo(() => {
    if (!assistantStatus) {
      return "Loading assistant status...";
    }
    return `Model: ${modelName} • Docs: ${docCount} • Chunks: ${chunkCount}`;
  }, [assistantStatus, chunkCount, docCount, modelName]);

  const showToast = (type, text) => {
    setToast({ type, text });
    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchAssistantStatus = useCallback(async (withLoading = true) => {
    try {
      if (withLoading) {
        setStatusLoading(true);
      }
      const res = await axios.get(`${API_BASE_URL}/api/chat/status`);
      setAssistantStatus(res.data);
    } catch (error) {
      console.error(error);
      showToast("error", "Could not fetch assistant status.");
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssistantStatus(false);
  }, [fetchAssistantStatus]);

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chats, loading]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const clearChat = () => {
    setChats([]);
    showToast("success", "Chat cleared.");
  };

  const uploadPDF = async () => {
    if (!pdf) {
      showToast("error", "Please select a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdf);

    try {
      setUploading(true);
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setChats(prev => [
        ...prev,
        createChatMessage(
          "bot",
          `📄 Indexed "${pdf.name}" with ${response.data.chunksStored} chunks.`,
          { tool: "upload" }
        ),
      ]);
      setPdf(null);
      await fetchAssistantStatus(true);
      showToast("success", "PDF uploaded and indexed.");
    } catch (error) {
      console.error(error);
      const errorText = getErrorMessage(error, "PDF upload failed.");
      setChats(prev => [...prev, createChatMessage("bot", `❌ ${errorText}`)]);
      showToast("error", errorText);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }

    const userMessage = message.trim();
    setMessage("");

    const updatedChats = [...chats, createChatMessage("user", userMessage)];
    setChats(updatedChats);
    setLoading(true);

    try {
      const formattedMessages = updatedChats.map(chat => ({
        role: chat.type === "user" ? "user" : "assistant",
        content: chat.content,
      }));

      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        messages: formattedMessages,
      });

      setChats(prev => [
        ...prev,
        createChatMessage("bot", res.data.reply, res.data.meta || null),
      ]);
    } catch (error) {
      console.error(error);
      const errorText = getErrorMessage(error, "Failed to get response.");
      setChats(prev => [...prev, createChatMessage("bot", `❌ ${errorText}`)]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const applyQuickPrompt = prompt => {
    setMessage(prompt);
  };

  return (
    <div className="chatbot-container">
      <header className="chatbot-header">
        <div className="header-content">
          <div className="header-left">
            <h1>✨ AI Assistant Pro</h1>
            <p className="header-subtitle">
              Memory + Tools + Production-Ready RAG
            </p>
          </div>
          <div className="header-actions">
            <button className="outline-button" onClick={clearChat} type="button">
              Clear Chat
            </button>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" type="button">
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      <section className="status-panel">
        <div className="status-chip">
          <span>🧠 Memory</span>
        </div>
        <div className="status-chip">
          <span>📚 RAG {ragReady ? "Ready" : "Waiting for docs"}</span>
        </div>
        <div className="status-chip">
          <span>⚙️ {statusLoading ? "Refreshing..." : "Online"}</span>
        </div>
        <p className="status-line">{assistantStatsLine}</p>
      </section>

      <section className="pdf-upload-section">
        <div className="pdf-upload-content">
          <label htmlFor="pdf-input" className="pdf-label">
            <span className="pdf-icon">📄</span>
            <span className="pdf-text">{pdf ? `Selected: ${pdf.name}` : "Select a PDF to index for RAG"}</span>
          </label>
          <input
            id="pdf-input"
            type="file"
            accept=".pdf,application/pdf"
            onChange={event => setPdf(event.target.files?.[0] || null)}
            className="pdf-input-hidden"
          />

          <button
            className={`pdf-upload-button ${uploading ? "uploading" : ""}`}
            onClick={uploadPDF}
            disabled={!pdf || uploading}
            type="button"
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Indexing...
              </>
            ) : (
              <>
                <span className="upload-icon">⬆️</span>
                Upload + Index
              </>
            )}
          </button>
        </div>
      </section>

      <section className="quick-prompts">
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt}
            type="button"
            className="prompt-chip"
            onClick={() => applyQuickPrompt(prompt)}
          >
            {prompt}
          </button>
        ))}
      </section>

      <main className="messages-container">
        {chats.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation.</p>
            <p>Tip: upload a PDF and ask using <code>pdf:</code>.</p>
          </div>
        ) : (
          chats.map(chat => (
            <div key={chat.id} className={`message ${chat.type}`}>
              <div className="message-content">
                <p>{chat.content}</p>
                {chat.meta?.tool && chat.type === "bot" ? (
                  <p className="message-meta">Tool: {chat.meta.tool}</p>
                ) : null}
                {chat.meta?.sources?.length ? (
                  <div className="sources-row">
                    {chat.meta.sources.slice(0, 3).map((source, index) => (
                      <span key={`${source.source}-${index}`} className="source-tag">
                        {source.source}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="message-time">
                  {new Date(chat.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {loading ? (
          <div className="message bot">
            <div className="message-content loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef}></div>
      </main>

      <footer className="input-container">
        <input
          type="text"
          className="message-input"
          value={message}
          onChange={event => setMessage(event.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask anything... use 'pdf:' for document Q&A"
          disabled={loading}
        />

        <button className="send-button" onClick={sendMessage} disabled={loading || !message.trim()} type="button">
          Send
        </button>
      </footer>

      {toast ? <div className={`toast ${toast.type}`}>{toast.text}</div> : null}
    </div>
  );
}

export default App;