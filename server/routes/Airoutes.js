import express from "express";
import { protect } from "../middleware/auth.js";
import {
  startInterview,
  submitAnswer,
  getHistory,
  getSession,
} from "../controllers/mockInterviewController.js";

const router = express.Router();

// POST /api/ai/chat  – proxy to Groq (free tier, no credit card needed)
router.post("/chat", protect, async (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 300,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: data.error?.message || "Groq API error" });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";
    res.json({ reply });
  } catch (err) {
    console.error("AI proxy error:", err);
    res.status(500).json({ error: "Failed to reach AI service" });
  }
});

// Mock Interview routes
router.post("/interview/start", protect, startInterview);
router.post("/interview/answer", protect, submitAnswer);
router.get("/interview/history", protect, getHistory);
router.get("/interview/session/:id", protect, getSession);

export default router;
