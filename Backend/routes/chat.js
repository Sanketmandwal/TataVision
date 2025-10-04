import express from "express";
import chat from "../models/chat.js";

const chatrouter = express.Router();

// Fetch messages by room
chatrouter.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await chat.find({ roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save message
chatrouter.post("/send", async (req, res) => {
  try {
    const { roomId, senderId, receiverId, message } = req.body;
    const chat = new chat({ roomId, senderId, receiverId, message });
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default chatrouter;
