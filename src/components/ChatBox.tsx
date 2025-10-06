import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/types';

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isNewConnection?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  isOpen,
  onClose,
  recipientName,
  messages,
  onSendMessage,
  isNewConnection = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage.trim());
    setNewMessage('');
    
    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const dateKey = formatDate(message.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[600px] shadow-elegant border-0 bg-card/95 backdrop-blur animate-scale-in">
        {/* Header */}
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {recipientName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <CardTitle className="text-lg">{recipientName}</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* System message for new connections */}
            {isNewConnection && messages.length === 0 && (
              <div className="flex justify-center my-6">
                <div className="max-w-[85%] bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur border border-primary/20 rounded-2xl px-5 py-4 text-center shadow-sm">
                  <p className="text-sm text-foreground font-medium">
                    💬 You and <span className="font-semibold text-primary">{recipientName}</span> are now connected!
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Start your skill swap conversation here.
                  </p>
                </div>
              </div>
            )}

            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground">
                    {date}
                  </Badge>
                </div>
                
                {/* Messages for this date */}
                {dateMessages.map((message) => {
                  const isOwn = message.sender === 'You'; // This would be based on current user
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-gradient-primary text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-white/70' : 'text-muted-foreground'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="pr-10"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full text-muted-foreground"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                size="icon"
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatBox;