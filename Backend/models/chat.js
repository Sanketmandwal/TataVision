import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const chat = mongoose.model("chat", chatSchema);

export default chat;
