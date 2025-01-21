"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from 'lucide-react';
import { employees } from '@/data/employee';

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

export function ChatBox() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MentionUser | null>(null);
  const [currentUserId] = useState(1); // In real app, this would come from auth
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredEmployees = employees.filter(emp => 
    emp.id !== currentUserId &&
    (emp.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(mentionQuery.toLowerCase()))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Check for @ mentions
    const mentionMatch = value.match(/@([^@\s]*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectUser = (user: MentionUser) => {
    setSelectedUser(user);
    // Replace the @mention query with the selected user's name
    const newMessage = message.replace(/@[^@\s]*$/, `@${user.name} `);
    setMessage(newMessage);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSendMessage = () => {
    if (!selectedUser || !message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: selectedUser.id,
      content: message,
      timestamp: new Date(),
    };

    // In a real app, you would send this message to your backend
    console.log('Sending message:', newMessage);

    // Reset the form
    setMessage('');
    setSelectedUser(null);
    setOpen(false);
  };

  // Close mentions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMentions && !event.target?.toString().includes('mention-list')) {
        setShowMentions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMentions]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Quick Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Quick Message</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            placeholder="Type @ to mention someone..."
            className="w-full"
          />
          
          {/* Mentions dropdown */}
          {showMentions && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border max-h-48 overflow-y-auto">
              {filteredEmployees.map(emp => (
                <div
                  key={emp.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectUser(emp)}
                >
                  <div className="font-medium">{emp.name}</div>
                  <div className="text-sm text-gray-600">{emp.role}</div>
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="px-4 py-2 text-gray-500">
                  No matching employees found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          {selectedUser && (
            <div className="text-sm text-gray-600">
              To: {selectedUser.name} ({selectedUser.role})
            </div>
          )}
          <Button
            onClick={handleSendMessage}
            disabled={!selectedUser || !message.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}