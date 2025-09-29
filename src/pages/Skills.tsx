import React, { useState } from 'react';
import SkillList from '@/components/SkillList';
import ChatBox from '@/components/ChatBox';
import { Skill, Message } from '@/types';
import { useToast } from '@/components/Toast';

const Skills: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Sarah Chen',
      senderId: 'user1',
      text: 'Hi! I saw you\'re interested in learning React. I\'d love to help!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true
    },
    {
      id: '2',
      sender: 'You',
      senderId: 'current-user',
      text: 'That sounds great! When would be a good time to start?',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      isRead: true
    }
  ]);
  const { success } = useToast();

  const handleRequestSwap = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsChatOpen(true);
    success(
      'Swap request sent!',
      `Your request to learn ${skill.name} has been sent to ${skill.user}.`
    );
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
      <SkillList onRequestSwap={handleRequestSwap} />
      <ChatBox
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipientName={selectedSkill?.user || 'User'}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default Skills;