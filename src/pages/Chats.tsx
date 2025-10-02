import React, { useState, useEffect } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ChatBox from '@/components/ChatBox';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types';

interface Conversation {
  id: string;
  swapId: string;
  otherUser: {
    id: string;
    name: string;
  };
  skill: string;
  lastMessage?: Message;
  unreadCount: number;
}

const Chats: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Real-time message updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('all-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
          if (selectedConversation) {
            fetchMessages(selectedConversation.swapId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch all swaps where user is involved
      const { data: swapsData, error: swapsError } = await supabase
        .from('swaps')
        .select(`
          id,
          request_id,
          skill_swap_requests!inner(
            requester_id,
            receiver_id,
            requester:profiles!skill_swap_requests_requester_id_fkey(id, name),
            receiver:profiles!skill_swap_requests_receiver_id_fkey(id, name),
            requested_skill:skills!skill_swap_requests_requested_skill_id_fkey(name)
          )
        `)
        .eq('status', 'active');

      if (swapsError) throw swapsError;

      // Filter to only swaps where user is involved
      const userSwaps = (swapsData || []).filter((swap: any) => {
        const req = swap.skill_swap_requests;
        return req.requester_id === user.id || req.receiver_id === user.id;
      });

      // Get last message for each swap
      const conversationsWithMessages = await Promise.all(
        userSwaps.map(async (swap: any) => {
          const req = swap.skill_swap_requests;
          const otherUser = req.requester_id === user.id ? req.receiver : req.requester;

          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .eq('swap_id', swap.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMsg = messagesData?.[0];
          const lastMessage = lastMsg ? {
            id: lastMsg.id,
            sender: lastMsg.sender_id === user.id ? 'You' : otherUser.name,
            senderId: lastMsg.sender_id,
            text: lastMsg.text,
            timestamp: new Date(lastMsg.created_at),
            isRead: lastMsg.is_read
          } : undefined;

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('swap_id', swap.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            id: swap.id,
            swapId: swap.id,
            otherUser: {
              id: otherUser.id,
              name: otherUser.name
            },
            skill: req.requested_skill.name,
            lastMessage,
            unreadCount: count || 0
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (swapId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('swap_id', swapId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        sender: msg.sender_id === user.id ? 'You' : selectedConversation?.otherUser.name || 'User',
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: new Date(msg.created_at),
        isRead: msg.is_read
      }));

      setMessages(formattedMessages);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('swap_id', swapId)
        .neq('sender_id', user.id);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleConversationClick = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.swapId);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedConversation || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          swap_id: selectedConversation.swapId,
          sender_id: user.id,
          text: message,
          is_read: false
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Messages
          </h1>
          <p className="text-xl text-muted-foreground">
            Chat with your skill swap partners
          </p>
        </div>

        {conversations.length === 0 ? (
          <Card className="text-center p-12 shadow-soft border-0 bg-card/80 backdrop-blur">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No conversations yet</h3>
            <p className="text-muted-foreground">
              Accept swap requests to start chatting with other users
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>

              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-elegant hover:scale-[1.02] border-0 overflow-hidden ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-l-4 border-l-primary shadow-md'
                        : 'bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl'
                    }`}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className={`absolute inset-0 bg-gradient-primary opacity-0 transition-opacity duration-300 ${selectedConversation?.id === conversation.id ? 'opacity-5' : 'hover:opacity-5'}`}></div>
                    <CardContent className="p-4 relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {conversation.otherUser.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {conversation.otherUser.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">{conversation.skill}</p>
                          </div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-accent text-white">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      {conversation.lastMessage && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-muted-foreground truncate flex-1">
                            {conversation.lastMessage.text}
                          </p>
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <Card className="shadow-elegant border-0 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl h-[600px] flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {selectedConversation.otherUser.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {selectedConversation.otherUser.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.skill}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender === 'You';
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
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
                              {message.timestamp.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 border-t border-border/50">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Type a message..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            handleSendMessage(e.currentTarget.value.trim());
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="shadow-elegant border-0 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to start chatting
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedConversation && (
        <ChatBox
          isOpen={false}
          onClose={() => {}}
          recipientName={selectedConversation.otherUser.name}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default Chats;
