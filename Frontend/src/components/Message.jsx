// src/components/Message.jsx
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCheck } from "lucide-react";

export default function Message({ message, isCurrentUser, currentUserName }) {
  const initials = isCurrentUser 
    ? currentUserName[0] 
    : message.senderRole[0].toUpperCase();
  
  return (
    <div
      className={`flex items-end gap-3 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      } animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      {/* Avatar */}
      {!isCurrentUser && (
        <Avatar className="w-10 h-10 border-2 border-slate-700">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Message Content */}
      <div className={`flex flex-col max-w-md ${isCurrentUser ? "items-end" : "items-start"}`}>
        {!isCurrentUser && (
          <span className="text-xs text-slate-400 mb-1 px-1 font-medium">
            {message.senderRole === "dealer" ? "Dealer" : "Sales Executive"}
          </span>
        )}
        
        <div
          className={`rounded-2xl p-4 shadow-lg ${
            isCurrentUser
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
              : "bg-slate-800/90 text-slate-100 rounded-bl-sm border border-slate-700"
          }`}
        >
          {message.message && (
            <p className="break-words leading-relaxed">{message.message}</p>
          )}
          {message.imageUrl && (
            <div className="mt-2">
              <img 
                src={message.imageUrl} 
                alt="sent" 
                className="rounded-lg max-w-full max-h-64 object-cover shadow-md" 
              />
            </div>
          )}
        </div>
        
        {/* Timestamp and Status */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs text-slate-500">
            {new Date(message.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {isCurrentUser && (
            <CheckCheck size={14} className="text-blue-400" />
          )}
        </div>
      </div>
      
      {/* Current User Avatar */}
      {isCurrentUser && (
        <Avatar className="w-10 h-10 border-2 border-blue-600">
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}