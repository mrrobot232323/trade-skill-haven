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
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSwaps();
    }
  }, [user]);

  const fetchSwaps = async () => {
    try {
      // Fetch swap requests where user is requester or receiver
      const { data: requests, error: requestsError } = await supabase
        .from('skill_swap_requests')
        .select(`
          *,
          requester:profiles!skill_swap_requests_requester_id_fkey(*),
          receiver:profiles!skill_swap_requests_receiver_id_fkey(*),
          requested_skill:skills!skill_swap_requests_requested_skill_id_fkey(*),
          offered_skill:skills!skill_swap_requests_offered_skill_id_fkey(*),
          swaps(*)
        `)
        .or(`requester_id.eq.${user?.id},receiver_id.eq.${user?.id}`);

      if (requestsError) throw requestsError;

      // Transform to Swap format
      const transformedSwaps: Swap[] = (requests || []).map((req: any) => {
        const otherUser = req.requester_id === user?.id ? req.receiver : req.requester;
        const swapData = req.swaps?.[0];
        
        return {
          id: req.id,
          user: otherUser?.name || 'Unknown User',
          userId: otherUser?.id || '',
          skill: req.requested_skill?.name || 'Unknown Skill',
          skillId: req.requested_skill?.id || '',
          status: swapData?.status || req.status,
          createdAt: new Date(req.created_at),
          updatedAt: new Date(req.updated_at),
          userProfile: {
            id: otherUser?.id || '',
            name: otherUser?.name || 'Unknown User',
            email: otherUser?.email || '',
            bio: otherUser?.bio || '',
            skillsOffered: [],
            skillsWanted: [],
            rating: otherUser?.rating || 0,
            completedSwaps: otherUser?.completed_swaps || 0
          }
        };
      });

      setSwaps(transformedSwaps);
    } catch (err) {
      console.error('Error fetching swaps:', err);
      error('Error', 'Failed to load swaps.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedSwap) return;
    
    try {
      // Find the swap entry for this request
      const { data: swapData, error: swapError } = await supabase
        .from('swaps')
        .select('id')
        .eq('request_id', selectedSwap.id)
        .maybeSingle();

      if (swapError) throw swapError;
      if (!swapData) return;

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('swap_id', swapData.id)
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
      await fetchSwaps(); // Refresh swaps
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
      await fetchSwaps(); // Refresh swaps
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

      // Find the swap entry
      const { data: swapData, error: swapError } = await supabase
        .from('swaps')
        .select('id')
        .eq('request_id', selectedSwap.id)
        .single();

      if (swapError) throw swapError;

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          swap_id: swapData.id,
          reviewer_id: user?.id,
          reviewed_id: review.userId,
          rating: review.rating,
          comment: review.comment
        });

      if (reviewError) throw reviewError;

      // Update swap status to completed
      const { error: updateError } = await supabase
        .from('swaps')
        .update({ status: 'completed' })
        .eq('id', swapData.id);

      if (updateError) throw updateError;

      success(
        'Review submitted!',
        'Thank you for your feedback. It helps our community grow!'
      );
      setIsRatingModalOpen(false);
      setSelectedSwap(null);
      await fetchSwaps(); // Refresh swaps
    } catch (err) {
      console.error('Error submitting review:', err);
      error('Error', 'Failed to submit review.');
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedSwap || !user) return;

    try {
      // Find the swap entry
      const { data: swapData, error: swapError } = await supabase
        .from('swaps')
        .select('id')
        .eq('request_id', selectedSwap.id)
        .maybeSingle();

      if (swapError) throw swapError;
      if (!swapData) {
        error('Error', 'Swap not found.');
        return;
      }

      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          swap_id: swapData.id,
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
        swaps={swaps}
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