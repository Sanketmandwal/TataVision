// src/components/MessageInput.jsx
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Camera, ImagePlus } from "lucide-react";

export default function MessageInput({ onSend, userData, roomId }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const message = {
          senderId: userData.id,
          receiverId: "broadcast",
          senderRole: userData.role,
          region: userData.region,
          imageUrl: e.target.result,
          roomId,
          createdAt: new Date(),
        };
        onSend(message);
        setFile(null);
      };
      reader.readAsDataURL(file);
    } else if (text.trim() !== "") {
      const message = {
        senderId: userData.id,
        receiverId: "broadcast",
        senderRole: userData.role,
        region: userData.region,
        message: text,
        roomId,
        createdAt: new Date(),
      };
      onSend(message);
      setText("");
    }
  };

  return (
    <div className="p-6 bg-slate-900/90 border-t border-slate-800">
      {/* File Preview */}
      {file && (
        <div className="mb-3 flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <ImagePlus size={18} className="text-blue-400" />
          <span className="text-sm text-slate-300 flex-1 truncate">{file.name}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setFile(null)}
            className="text-slate-400 hover:text-white h-6"
          >
            ✕
          </Button>
        </div>
      )}
      
      {/* Input Controls */}
      <div className="flex gap-3 items-end">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          ref={fileInputRef}
        />
        
        {/* Camera Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-xl border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-blue-500 transition-all"
        >
          <Camera size={20} className="text-slate-300" />
        </Button>
        
        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full rounded-xl p-4 pr-12 bg-slate-800/50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
        </div>
        
        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!text.trim() && !file}
          className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all"
        >
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}