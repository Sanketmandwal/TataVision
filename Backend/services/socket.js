import chat from "../models/chat.js";
const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // --- FIX APPLIED HERE ---
    socket.on("sendMessage", async (msgData) => {
      try {
        // 2. Create a new chat instance with the message data
        const newChatMessage = new chat({
          roomId: msgData.roomId,
          senderId: msgData.senderId,
          receiverId: msgData.receiverId,
          message: msgData.message,
        });

        // 3. Save the message directly to the MongoDB 'chatapp' database
        const savedMessage = await newChatMessage.save();
        
        // 4. Broadcast the SAVED message (which now has an _id and timestamp) to the room
        io.to(msgData.roomId).emit("receiveMessage", savedMessage);
        
      } catch (error) {
        console.error("Error saving or broadcasting message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export default initSocket;
