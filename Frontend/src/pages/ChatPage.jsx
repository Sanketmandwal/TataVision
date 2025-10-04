import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { format } from "date-fns";
import { useLocation } from "react-router-dom"; // ADD THIS

// Context and UI Components
import usercontext from "../context/usercontext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageSquare, ArrowLeft } from "lucide-react"; // ADD ArrowLeft

// Helper to get initials
const getInitials = (name = "") => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
};

const ChatPage = () => {
  const { userData, backendUrl } = useContext(usercontext);
  const location = useLocation(); // ADD THIS
  const prefilledMessage = location.state?.prefilledMessage; // ADD THIS

  const [salesExecs, setSalesExecs] = useState([]);
  const [selectedExec, setSelectedExec] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingExecs, setIsLoadingExecs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ADD THIS: Set prefilled message when component mounts
  useEffect(() => {
    if (prefilledMessage) {
      setInputMessage(prefilledMessage);
    }
  }, [prefilledMessage]);

  // Initialize Socket Connection
  useEffect(() => {
    if (!backendUrl) return;

    socketRef.current = io(backendUrl);

    socketRef.current.on("connect", () =>
      console.log("✅ Socket connected:", socketRef.current.id)
    );

    // Listener for incoming messages
    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.off("receiveMessage");
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [backendUrl]);

  // Fetch Sales Executives
  useEffect(() => {
    if (!userData?.location) {
      setIsLoadingExecs(false);
      return;
    }

    const fetchSalesExecs = async () => {
      setIsLoadingExecs(true);
      try {
        const { data } = await axios.post(`${backendUrl}/api/users/sales_exec`, {
          location: userData.location,
        });
        setSalesExecs(data);
        
        // ADD THIS: Auto-select first exec if coming from dealer dashboard
        if (prefilledMessage && data.length > 0) {
          setSelectedExec(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch sales executives:", err);
      } finally {
        setIsLoadingExecs(false);
      }
    };

    fetchSalesExecs();
  }, [userData, backendUrl, prefilledMessage]);

  // Join room and fetch chat history
  useEffect(() => {
    if (!selectedExec || !userData || !socketRef.current) {
      setMessages([]);
      return;
    }

    const roomId = generateRoomId(userData._id, selectedExec._id);
    socketRef.current.emit("joinRoom", { roomId });

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const { data } = await axios.get(`${backendUrl}/api/chat/${roomId}`);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedExec, userData, backendUrl]);

  // Auto-scroll to latest message


  // Helpers
  const generateRoomId = (userId1, userId2) => {
    if (!userId1 || !userId2) return null;
    return [userId1, userId2].sort().join("-");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedExec || !socketRef.current) return;

    const roomId = generateRoomId(userData._id, selectedExec._id);

    const messageData = {
      roomId,
      senderId: userData._id,
      receiverId: selectedExec._id,
      message: inputMessage,
      timestamp: new Date().toISOString(),
    };

    // Send message via socket
    socketRef.current.emit("sendMessage", messageData);
    setInputMessage(""); // Clear input
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-20 flex h-screen">
      {/* Left Panel: Contacts */}
      <aside className="w-1/3 border-r border-slate-800/50 flex flex-col bg-slate-900/30 backdrop-blur-sm">
        <div className="p-6 border-b border-slate-800/50 bg-slate-900/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-400" />
            Sales Executives
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Contacts in{" "}
            <span className="font-semibold text-blue-400">{userData?.location}</span>
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingExecs ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : salesExecs.length ? (
            salesExecs.map((exec) => (
              <div
                key={exec._id}
                onClick={() => setSelectedExec(exec)}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                  selectedExec?._id === exec._id
                    ? "bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-500/10"
                    : "border-transparent hover:bg-slate-800/30"
                }`}
              >
                <Avatar className="border-2 border-slate-700">
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 font-bold">
                    {getInitials(exec.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">{exec.name}</p>
                  <p className="text-sm text-slate-400">{exec.role}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-slate-500 mt-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No sales executives found for your location.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel: Chat Window */}
      <main className="w-2/3 flex flex-col bg-slate-950/50">
        {!selectedExec ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="p-6 bg-blue-600/10 rounded-full mb-4 border-2 border-blue-500/30">
              <MessageSquare className="w-16 h-16 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Welcome, {userData?.name}</h3>
            <p className="text-slate-400 max-w-md">
              Select a sales executive from the left panel to start a conversation.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
              <Avatar className="border-2 border-blue-500/50">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 font-bold">
                  {getInitials(selectedExec.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-bold text-white">{selectedExec.name}</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-slate-400">Online</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id || msg.timestamp}
                    className={`flex items-end gap-3 animate-fade-in ${
                      msg.senderId === userData._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.senderId !== userData._id && (
                      <Avatar className="w-9 h-9 border-2 border-slate-700">
                        <AvatarFallback className="bg-slate-700 text-xs font-semibold">
                          {getInitials(selectedExec.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-md rounded-2xl px-4 py-3 break-words shadow-lg ${
                        msg.senderId === userData._id
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                          : "bg-slate-900/80 backdrop-blur-sm text-slate-300 rounded-bl-none border border-slate-800"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className="text-xs opacity-60 mt-1 text-right">
                        {format(new Date(msg.timestamp), "p")}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-slate-900/80 border-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white placeholder:text-slate-500"
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/30 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatPage;