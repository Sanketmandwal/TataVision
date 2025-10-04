import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { format } from 'date-fns';

// Import Context and UI Components
import usercontext from '@/context/usercontext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageSquare, Store } from 'lucide-react';

// Helper function to get user initials
const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return '?';
  const names = name.trim().split(' ');
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : `${names[0][0]}`.toUpperCase();
};

const Saleschatpage = () => {
  const { userData, backendUrl } = useContext(usercontext);
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isLoadingDealers, setIsLoadingDealers] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Effect for initializing and managing the socket connection
  useEffect(() => {
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));

    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    newSocket.on('receiveMessage', handleReceiveMessage);

    return () => {
      newSocket.off('receiveMessage', handleReceiveMessage);
      newSocket.disconnect();
    };
  }, [backendUrl]);

  // Effect for fetching dealers in the sales executive's location
  useEffect(() => {
    if (userData?.location) {
      const fetchDealers = async () => {
        setIsLoadingDealers(true);
        try {
          // Call the new '/api/users/dealers' endpoint
          const { data } = await axios.post(`${backendUrl}/api/users/dealers`, {
            location: userData.location,
          });
          setDealers(data);
        } catch (error) {
          console.error("Failed to fetch dealers:", error);
        } finally {
          setIsLoadingDealers(false);
        }
      };
      fetchDealers();
    } else {
      setIsLoadingDealers(false);
    }
  }, [userData, backendUrl]);

  // Effect for joining a room and fetching chat history
  useEffect(() => {
    if (!selectedDealer) {
      setMessages([]);
      return;
    }

    if (selectedDealer && userData && socket) {
      const roomId = generateRoomId(userData._id, selectedDealer._id);
      socket.emit('joinRoom', { roomId });

      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
          const { data } = await axios.get(`${backendUrl}/api/chat/${roomId}`);
          setMessages(data);
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      fetchMessages();
    }
  }, [selectedDealer, userData, socket, backendUrl]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateRoomId = (userId1, userId2) => {
    if (!userId1 || !userId2) return null;
    return [userId1, userId2].sort().join('-');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedDealer || !socket) return;

    const roomId = generateRoomId(userData._id, selectedDealer._id);
    const messageData = {
      roomId,
      senderId: userData._id,
      receiverId: selectedDealer._id,
      message: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    socket.emit('sendMessage', messageData);
    setInputMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 flex h-screen">
      {/* Left Panel: Contacts (Dealers) */}
      <aside className="w-1/3 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold">Local Dealers</h2>
          <p className="text-sm text-slate-400">Contacts in your location: <span className="font-semibold text-blue-400">{userData?.location}</span></p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingDealers ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full bg-slate-800" />)}
            </div>
          ) : dealers.length > 0 ? (
            dealers.map(dealer => (
              <div
                key={dealer._id}
                onClick={() => setSelectedDealer(dealer)}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-l-4 ${selectedDealer?._id === dealer._id ? 'bg-blue-900/50 border-blue-500' : 'border-transparent hover:bg-slate-800/50'}`}
              >
                <Avatar><AvatarFallback className="bg-slate-700"><Store className="h-4 w-4"/></AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold text-white">{dealer.name}</p>
                  <p className="text-sm text-slate-400">{dealer.location} Dealer</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-slate-500 mt-4">
                <p>No dealers found for your location.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel: Chat Window */}
      <main className="w-2/3 flex flex-col">
        {!selectedDealer ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-2xl font-bold">Welcome, {userData?.name}</h3>
            <p className="text-slate-400">Select a dealer to start a conversation.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 p-4 border-b border-slate-800">
              <Avatar><AvatarFallback className="bg-blue-600"><Store className="h-4 w-4"/></AvatarFallback></Avatar>
              <div>
                <p className="font-bold text-white">{selectedDealer.name}</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-slate-400">Online</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
              ) : (
                messages.map(msg => (
                  <div key={msg._id || msg.timestamp} className={`flex items-end gap-3 ${msg.senderId === userData._id ? 'justify-end' : 'justify-start'}`}>
                    {msg.senderId !== userData._id && <Avatar className="w-8 h-8"><AvatarFallback className="bg-slate-700 text-xs"><Store className="h-3 w-3"/></AvatarFallback></Avatar>}
                    <div className={`max-w-md rounded-2xl px-4 py-2 break-words ${msg.senderId === userData._id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-300 rounded-bl-none'}`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-60 mt-1 text-right">{format(new Date(msg.timestamp), 'p')}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${selectedDealer.name}...`}
                  className="bg-slate-800 border-slate-700 focus-visible:ring-blue-500"
                  autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={!inputMessage.trim()}><Send className="w-4 h-4" /></Button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Saleschatpage;
