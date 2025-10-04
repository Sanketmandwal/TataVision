// src/components/ChatWindow.jsx
import React, { useEffect, useRef } from "react";
import Message from "./Message";
import { Send } from "lucide-react";

export default function ChatWindow({ messages, currentUser }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/50">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <Send size={32} className="text-slate-600" />
          </div>
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <Message 
            key={idx} 
            message={msg} 
            isCurrentUser={msg.senderId === currentUser.id}
            currentUserName={currentUser.name}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}