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
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { success, error } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      // Fetch all skills with user information
      const { data, error: skillsError } = await supabase
        .from('user_skills')
        .select(`
          id,
          type,
          user_id,
          skills (
            id,
            name,
            description,
            category
          ),
          profiles (
            id,
            name,
            location,
            rating
          )
        `)
        .eq('type', 'offer');

      if (skillsError) throw skillsError;

      // Transform to Skill format
      const transformedSkills: Skill[] = (data || []).map((item: any) => ({
        id: item.skills.id,
        name: item.skills.name,
        description: item.skills.description || `Learn ${item.skills.name}`,
        category: item.skills.category,
        user: item.profiles?.name || 'Unknown User',
        userId: item.user_id,
        location: item.profiles?.location,
        tags: [item.skills.category, item.skills.name],
        createdAt: new Date()
      }));

      setSkills(transformedSkills);
      setFilteredSkills(transformedSkills);
    } catch (err) {
      console.error('Error fetching skills:', err);
      error('Error', 'Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  // Filter skills when search or category changes
  useEffect(() => {
    let filtered = skills;

    if (searchQuery) {
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    setFilteredSkills(filtered);
  }, [searchQuery, selectedCategory, skills]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const categories = Array.from(new Set(skills.map(skill => skill.category)));

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
        .maybeSingle();

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
      <SkillList 
        skills={filteredSkills} 
        loading={loading} 
        onRequestSwap={handleRequestSwap}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryClick={handleCategoryClick}
        onClearFilters={handleClearFilters}
      />
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