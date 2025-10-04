// src/components/UserList.jsx
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Users, Circle } from "lucide-react";

export default function UserList({ users = [], currentUser }) {
  return (
    <Card className="w-64 bg-slate-900/80 border-slate-800 backdrop-blur-xl p-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <Users size={20} className="text-blue-400" />
        <h2 className="text-lg font-semibold text-white">
          Active Users ({users.length})
        </h2>
      </div>
      
      <div className="space-y-3">
        {users.map((user, idx) => {
          const isCurrentUser = user.id === currentUser?.id;
          return (
            <div 
              key={idx} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isCurrentUser 
                  ? "bg-blue-600/20 border border-blue-500/30" 
                  : "bg-slate-800/50 hover:bg-slate-800"
              }`}
            >
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-slate-700">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <Circle 
                  size={10} 
                  className="absolute -bottom-0.5 -right-0.5 fill-green-400 text-green-400" 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-blue-400">(You)</span>
                  )}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {user.role === "dealer" ? "Dealer" : "Sales Executive"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-slate-500">
          <Users size={32} className="mb-2 opacity-50" />
          <p className="text-sm">No users online</p>
        </div>
      )}
    </Card>
  );
}