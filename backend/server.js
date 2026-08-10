require("dotenv").config();
const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat");
const uploadRoute = require("./routes/upload");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "ai-assistant-backend",
  });
});

app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});