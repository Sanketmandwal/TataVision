import React, { useState, useContext, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import usercontext from "@/context/usercontext";

// Shadcn UI and Lucide React Icons
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, BotMessageSquare, TrendingUp, Shield, Copy, Mic, ThumbsUp, ThumbsDown, MapPin, Sparkles, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper function to get initials for user avatar
const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return '?';
  const names = name.trim().split(' ');
  return names.length > 1 
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() 
    : `${names[0][0]}`.toUpperCase();
};

// Enhanced feedback card component to show brand
const FeedbackCard = ({ item, index }) => (
    <div 
        className="p-4 bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl border-2 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group animate-fade-in-up"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="flex justify-between items-start mb-3 gap-2">
            <div className="flex-1">
                <Badge variant="secondary" className="mb-2 text-xs font-bold bg-slate-700/80 text-blue-300 border-slate-600">
                    {item.brand || 'Unknown Brand'}
                </Badge>
                <div className="flex items-center gap-2">
                    {item.sentiment === 'positive' && (
                        <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                            <ThumbsUp className="h-4 w-4 text-emerald-400"/>
                        </div>
                    )}
                    {item.sentiment === 'negative' && (
                        <div className="p-1.5 bg-red-500/20 rounded-lg">
                            <ThumbsDown className="h-4 w-4 text-red-400"/>
                        </div>
                    )}
                    <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold ${
                            item.sentiment === 'positive' 
                            ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
                            : item.sentiment === 'negative' 
                            ? 'border-red-500/50 text-red-400 bg-red-500/10' 
                            : 'border-slate-500 text-slate-400 bg-slate-500/10'
                        }`}
                    >
                        {item.sentiment}
                    </Badge>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-lg flex-shrink-0">
                <MapPin className="h-3 w-3 text-blue-400"/>
                <span className="font-medium">{item.location}</span>
            </div>
        </div>
        <div className="relative pl-3 border-l-2 border-blue-500/30">
            <p className="text-sm text-slate-300 leading-relaxed">"{item.content}"</p>
        </div>
    </div>
);


const Chatbot = () => {
  const chatbotBackendUrl = "http://127.0.0.1:8000"; // Your FastAPI backend URL
  const { userData } = useContext(usercontext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => { setInput(transcript); }, [transcript]);

  const sendMessage = async (messageText = input) => {
    const trimmedQuery = messageText.trim();
    if (!trimmedQuery) return;

    setIsLoading(true);
    const userMessage = { sender: "user", text: messageText, id: `user-${Date.now()}` };
    const aiMessageId = `ai-${Date.now()}`;
    // Placeholder now has the same structure as a final message
    const aiMessagePlaceholder = {
      sender: "ai",
      text: "",
      id: aiMessageId,
      feedback: null // Will hold the combined feedback cards
    };
    
    setMessages((prev) => [...prev, userMessage, aiMessagePlaceholder]);
    setInput("");
    resetTranscript();

    try {
      // API call to the FastAPI backend
      const response = await fetch(`${chatbotBackendUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the query and a reasonable top_k for UI display
        body: JSON.stringify({ query: trimmedQuery, top_k: 5 })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "An unknown server error occurred." }));
        throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Combine all sample feedback into a single array for rendering
        const allFeedback = [
          ...(result.tata_sample_feedback || []),
          ...(result.competitor_analysis || []).flatMap(comp => comp.sample_feedback)
        ];

        // Update the AI message placeholder with the processed data from the backend
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId ? {
            ...msg,
            text: result.comprehensive_analysis,
            feedback: allFeedback
          } : msg
        ));
      } else {
        throw new Error(result.error || "The analysis failed to generate a valid response.");
      }

    } catch (err) {
      console.error("API call failed:", err);
      // Update the AI message with a user-friendly error
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, text: `❌ **Error:**\n\n${err.message}\n\nPlease check if the backend server is running and accessible.` }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const handleMicClick = () => { listening ? SpeechRecognition.stopListening() : (resetTranscript(), SpeechRecognition.startListening({ continuous: true })); };
  
  if (!browserSupportsSpeechRecognition) {
      // You can render a message indicating that the browser doesn't support speech recognition
  }

  const suggestedPrompts = [
    { icon: TrendingUp, text: "How is Safari performing compared to XUV700?", gradient: "from-emerald-600 to-teal-600" },
    { icon: Shield, text: "Find negative feedback about Harrier in Pune", gradient: "from-orange-600 to-red-600" },
    { icon: Zap, text: "Summarize complaints about infotainment for Harrier and its competitors", gradient: "from-purple-600 to-pink-600" },
  ];

  return (
      <TooltipProvider>
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-20">
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                  <div className="relative p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl border-2 border-blue-500/30 backdrop-blur-sm">
                      <BotMessageSquare className="w-20 h-20 text-blue-400" />
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2"><Sparkles className="w-4 h-4 text-white" /></div>
                  </div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">TataVision AI Analyst</h1>
                <p className="text-slate-400 text-lg mb-12 max-w-md">Ask me anything about your customer feedback data and get instant insights.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
                  {suggestedPrompts.map((prompt, i) => (
                    <Card key={i} onClick={() => sendMessage(prompt.text)} className="group bg-slate-900/50 border-slate-800 p-5 text-left hover:bg-slate-900 hover:border-blue-500/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1">
                      <div className={`inline-flex p-3 bg-gradient-to-br ${prompt.gradient} rounded-xl mb-3 group-hover:scale-110 transition-transform`}><prompt.icon className="w-6 h-6 text-white" /></div>
                      <p className="text-sm font-medium text-slate-300 leading-relaxed group-hover:text-white transition-colors">{prompt.text}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex items-start gap-4 animate-fade-in-up ${ m.sender === "user" ? "justify-end" : "justify-start" }`}>
                  {m.sender === "ai" && ( <Avatar className="w-10 h-10 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"><AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600"><BotMessageSquare className="w-5 h-5 text-white" /></AvatarFallback></Avatar> )}
                  <div className={`group relative max-w-2xl w-full rounded-2xl px-5 py-4 shadow-lg ${ m.sender === "user" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none shadow-blue-500/20" : "bg-slate-900/80 backdrop-blur-sm text-slate-300 rounded-bl-none border border-slate-800 shadow-slate-900/50" }`}>
                    {m.sender === 'ai' && m.feedback && m.feedback.length > 0 && (
                      <div className="mb-5 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-1 w-1 bg-blue-400 rounded-full animate-pulse"></div>
                          <h4 className="font-semibold text-sm text-blue-400 uppercase tracking-wide">Retrieved Feedback</h4>
                          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                        </div>
                        {m.feedback.map((item, index) => (<FeedbackCard key={index} item={item} index={index} />))}
                      </div>
                    )}
                    <div className="prose prose-invert prose-p:my-0 prose-p:text-slate-300 prose-strong:text-white prose-ul:text-slate-300 prose-li:text-slate-300">
                      <ReactMarkdown>{m.text || (m.sender === 'ai' && '...')}</ReactMarkdown>
                    </div>
                    {m.sender === 'ai' && !isLoading && m.text && ( <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="absolute top-2 -right-12 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-800 hover:text-blue-400" onClick={() => { navigator.clipboard.writeText(m.text); }}><Copy className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Copy response</TooltipContent></Tooltip> )}
                  </div>
                  {m.sender === "user" && ( <Avatar className="w-10 h-10 border-2 border-slate-700 shadow-lg"><AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 font-bold">{getInitials(userData?.name)}</AvatarFallback></Avatar> )}
                </div>
              ))
            )}
            {isLoading && (<div className="flex items-start gap-4 justify-start animate-fade-in"><Avatar className="w-10 h-10 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"><AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600"><BotMessageSquare className="w-5 h-5 text-white" /></AvatarFallback></Avatar><div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl rounded-bl-none px-6 py-4 border border-slate-800"><div className="flex items-center justify-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-bounce"></span><span className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span><span className="h-2.5 w-2.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span></div></div></div>)}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/50">
            <div className="relative max-w-4xl mx-auto">
              <div className="relative">
                <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask about sentiment, competitors, or regions..." className="w-full pl-6 pr-32 py-7 text-base bg-slate-900/80 backdrop-blur-sm border-2 border-slate-800 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-500" disabled={isLoading} />
                <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2">
                  <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" onClick={handleMicClick} className={`w-11 h-11 rounded-xl transition-all shadow-lg ${ listening ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-500/30 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-900/50 border border-slate-700' }`}><Mic className="w-5 h-5 text-slate-300" /></Button></TooltipTrigger><TooltipContent><p>{listening ? "Stop listening" : "Start voice input"}</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button type="submit" size="icon" onClick={() => sendMessage()} disabled={!input.trim() || isLoading} className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"><Send className="w-5 h-5" /></Button></TooltipTrigger><TooltipContent><p>Send message</p></TooltipContent></Tooltip>
                </div>
              </div>
              {listening && ( <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 animate-fade-in shadow-lg"><div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>Listening...</div> )}
            </div>
          </div>
        </div>
      </TooltipProvider>
  );
};

export default Chatbot;