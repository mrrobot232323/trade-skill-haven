import React, { useState, useEffect } from 'react';
import SkillList from '@/components/SkillList';
import ChatBox from '@/components/ChatBox';
import { Skill, Message } from '@/types';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Skills: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { success, error } = useToast();
  const { user } = useAuth();

  const handleRequestSwap = async (skill: Skill) => {
    if (!user) {
      error('Error', 'You must be logged in to request a swap.');
      return;
    }

    try {
      // Get user's skills to offer
      const { data: userSkills, error: skillsError } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id)
        .eq('type', 'offer')
        .limit(1)
        .single();

      if (skillsError || !userSkills) {
        error('Error', 'Please add skills you can offer in your profile first.');
        return;
      }

      // Create a swap request
      const { error: requestError } = await supabase
        .from('skill_swap_requests')
        .insert({
          requester_id: user.id,
          receiver_id: skill.userId,
          requested_skill_id: skill.id,
          offered_skill_id: userSkills.skill_id,
          status: 'pending'
        });

      if (requestError) throw requestError;

      setSelectedSkill(skill);
      success(
        'Swap request sent!',
        `Your request to learn ${skill.name} has been sent to ${skill.user}.`
      );
    } catch (err) {
      console.error('Error requesting swap:', err);
      error('Error', 'Failed to send swap request.');
    }
  };

  const handleSendMessage = async (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderId: user?.id || 'current-user',
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