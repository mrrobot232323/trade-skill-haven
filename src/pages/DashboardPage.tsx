import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import RatingModal from '@/components/RatingModal';
import ChatBox from '@/components/ChatBox';
import { Swap, Message, Review } from '@/types';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Loader from '@/components/Loader';

const DashboardPage: React.FC = () => {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!selectedSwap) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('swap_id', selectedSwap.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        sender: msg.sender_id === user?.id ? 'You' : 'User',
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: new Date(msg.created_at),
        isRead: msg.is_read
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSwap = async (swap: Swap) => {
    try {
      const { error: updateError } = await supabase
        .from('skill_swap_requests')
        .update({ status: 'accepted' })
        .eq('id', swap.id);

      if (updateError) throw updateError;

      // Create a swap entry
      const { error: swapError } = await supabase
        .from('swaps')
        .insert({ request_id: swap.id, status: 'active' });

      if (swapError) throw swapError;

      success(
        'Swap accepted!',
        `You've accepted the ${swap.skill} swap with ${swap.user}.`
      );
    } catch (err) {
      console.error('Error accepting swap:', err);
      error('Error', 'Failed to accept swap.');
    }
  };

  const handleRejectSwap = async (swap: Swap) => {
    try {
      const { error: updateError } = await supabase
        .from('skill_swap_requests')
        .update({ status: 'rejected' })
        .eq('id', swap.id);

      if (updateError) throw updateError;

      success(
        'Swap declined',
        `The ${swap.skill} swap request has been declined.`
      );
    } catch (err) {
      console.error('Error rejecting swap:', err);
      error('Error', 'Failed to decline swap.');
    }
  };

  const handleCompleteSwap = async (swap: Swap) => {
    setSelectedSwap(swap);
    setIsRatingModalOpen(true);
  };

  const handleChatSwap = async (swap: Swap) => {
    setSelectedSwap(swap);
    await fetchMessages();
    setIsChatOpen(true);
  };

  const handleSubmitReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      if (!selectedSwap) return;

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          swap_id: selectedSwap.id,
          reviewer_id: user?.id,
          reviewed_id: review.userId,
          rating: review.rating,
          comment: review.comment
        });

      if (reviewError) throw reviewError;

      // Update swap status to completed
      const { error: swapError } = await supabase
        .from('swaps')
        .update({ status: 'completed' })
        .eq('id', selectedSwap.id);

      if (swapError) throw swapError;

      success(
        'Review submitted!',
        'Thank you for your feedback. It helps our community grow!'
      );
      setIsRatingModalOpen(false);
      setSelectedSwap(null);
    } catch (err) {
      console.error('Error submitting review:', err);
      error('Error', 'Failed to submit review.');
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedSwap || !user) return;

    try {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          swap_id: selectedSwap.id,
          sender_id: user.id,
          text: message,
          is_read: false
        });

      if (msgError) throw msgError;

      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'You',
        senderId: user.id,
        text: message,
        timestamp: new Date(),
        isRead: false
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      error('Error', 'Failed to send message.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Dashboard
        onAcceptSwap={handleAcceptSwap}
        onRejectSwap={handleRejectSwap}
        onCompleteSwap={handleCompleteSwap}
        onChatSwap={handleChatSwap}
      />
      
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        userName={selectedSwap?.user || ''}
        skillName={selectedSwap?.skill || ''}
        onSubmit={handleSubmitReview}
      />

      <ChatBox
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientName={selectedSwap?.user || 'User'}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default DashboardPage;