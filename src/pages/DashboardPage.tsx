import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import RatingModal from '@/components/RatingModal';
import ChatBox from '@/components/ChatBox';
import { Swap, Message, Review } from '@/types';
import { useToast } from '@/components/Toast';

const DashboardPage: React.FC = () => {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { success } = useToast();

  const handleAcceptSwap = (swap: Swap) => {
    success(
      'Swap accepted!',
      `You've accepted the ${swap.skill} swap with ${swap.user}.`
    );
  };

  const handleRejectSwap = (swap: Swap) => {
    success(
      'Swap declined',
      `The ${swap.skill} swap request has been declined.`
    );
  };

  const handleCompleteSwap = (swap: Swap) => {
    setSelectedSwap(swap);
    setIsRatingModalOpen(true);
  };

  const handleChatSwap = (swap: Swap) => {
    setSelectedSwap(swap);
    setMessages([
      {
        id: '1',
        sender: swap.user,
        senderId: swap.userId,
        text: `Hi! Ready to start our ${swap.skill} session?`,
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        isRead: true
      }
    ]);
    setIsChatOpen(true);
  };

  const handleSubmitReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    // Simulate API call
    setTimeout(() => {
      success(
        'Review submitted!',
        'Thank you for your feedback. It helps our community grow!'
      );
      setIsRatingModalOpen(false);
      setSelectedSwap(null);
    }, 500);
  };

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderId: 'current-user',
      text: message,
      timestamp: new Date(),
      isRead: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

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