const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { storeDocument } = require("../rag/storeDocument");
const { assistantConfig } = require("../config/assistantConfig");

const router = express.Router();
const uploadsFolder = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadsFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^\w.\-() ]+/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: assistantConfig.maxUploadSizeMb * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf";
    if (!isPdf) {
      cb(new Error("Only PDF files are allowed."));
      return;
    }
    cb(null, true);
  },
});

router.post("/", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      error: "No PDF file was uploaded.",
    });
    return;
  }

  try {
    const result = await storeDocument(req.file.path);
    res.json({
      success: true,
      file: req.file.originalname,
      chunksStored: result.chunkCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Upload failed",
    });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({
      error: `PDF is too large. Max size is ${assistantConfig.maxUploadSizeMb}MB.`,
    });
    return;
  }

  if (error) {
    res.status(400).json({
      error: error.message || "Invalid upload request.",
    });
    return;
  }

  next();
});

module.exports = router;