const express = require("express");
const router = express.Router();
const {
  chatWithAI,
  getAssistantStatus,
} = require("../controllers/chatController");

router.get("/status", getAssistantStatus);
router.post("/", chatWithAI);

module.exports = router;