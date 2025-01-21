"use client";
import React, { useState, useRef, useEffect } from 'react';
import { employees } from '@/data/employee';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search } from 'lucide-react';

interface Message {
  id: string;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
}

interface MentionUser {
  id: number;
  name: string;
  role: string;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<MentionUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId] = useState(1); // In a real app, this would come from authentication
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = employees.find(emp => emp.id === currentUserId);

  // Get unique users involved in conversations
  const chatUsers = Array.from(new Set([
    ...messages.map(m => m.senderId),
    ...messages.map(m => m.receiverId)
  ]))
  .filter(id => id !== currentUserId)
  .map(id => employees.find(emp => emp.id === id))
  .filter((user): user is MentionUser => user !== undefined);

  // Add other employees who haven't chatted yet
  const allChatUsers = [
    ...chatUsers,
    ...employees.filter(emp => 
      emp.id !== currentUserId && 
      !chatUsers.some(user => user.id === emp.id)
    )
  ];

  // Filter users based on search
  const filteredUsers = allChatUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get messages for selected conversation
  const conversationMessages = messages.filter(message =>
    (message.senderId === currentUserId && message.receiverId === selectedUser?.id) ||
    (message.receiverId === currentUserId && message.senderId === selectedUser?.id)
  );

  const handleSendMessage = () => {
    if (!selectedUser || !currentMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: selectedUser.id,
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  return (
    <div className="container mx-auto p-4 max-w-6xl h-[calc(100vh-100px)]">
      <div className="bg-white h-full flex">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col dark:bg-neutral-950">
          <div className="p-4 border-b">
            <div className="text-sm text-gray-600 mb-4">
              (You) : {currentUser?.name} ({currentUser?.role})
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map(user => {
              const lastMessage = messages.find(m => 
                (m.senderId === user.id && m.receiverId === currentUserId) ||
                (m.receiverId === user.id && m.senderId === currentUserId)
              );

              return (
                <div
                  key={user.id}
                  className={`p-4 border-b cursor-pointer hover:bg-blue-300 bg-blue- ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.role}</div>
                  {lastMessage && (
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                      {lastMessage.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col dark:bg-neutral-900 rounded-2xl shadow-2xl">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-sm text-gray-600">{selectedUser.role}</div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {conversationMessages.map(message => {
                  const isSentByMe = message.senderId === currentUserId;

                  return (
                    <div
                      key={message.id}
                      className={`mb-4 ${isSentByMe ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`inline-block rounded-lg px-4 py-2 max-w-[70%] ${
                          isSentByMe ? ' bg-gray-300 text-black dark:bg-indigo-400 dark:text-white' : 'bg-gray-100'
                        }`}
                      >
                        <div>{message.content}</div>
                        <div className="text-xs mt-1 opacity-75">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder={`Message ${selectedUser.name}...`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    className= 'bg-blue-500 text-white'
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}