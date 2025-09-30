import React from 'react';
import MatchFinder from '@/components/MatchFinder';
import { Match } from '@/types';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Matches: React.FC = () => {
  const { success, error } = useToast();
  const { user } = useAuth();

  const handleRequestSwap = async (match: Match) => {
    if (!user) {
      error('Error', 'You must be logged in to request a swap.');
      return;
    }

    try {
      // Get the skill IDs for the request
      const { data: offeredSkill, error: offeredError } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id)
        .eq('type', 'offer')
        .limit(1)
        .single();

      const { data: requestedSkill, error: requestedError } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', match.userId)
        .eq('type', 'offer')
        .limit(1)
        .single();

      if (offeredError || requestedError || !offeredSkill || !requestedSkill) {
        error('Error', 'Could not find matching skills.');
        return;
      }

      const { error: requestError } = await supabase
        .from('skill_swap_requests')
        .insert({
          requester_id: user.id,
          receiver_id: match.userId,
          requested_skill_id: requestedSkill.skill_id,
          offered_skill_id: offeredSkill.skill_id,
          status: 'pending'
        });

      if (requestError) throw requestError;

      success(
        'Swap request sent!',
        `Your request to swap skills with ${match.user} has been sent.`
      );
    } catch (err) {
      console.error('Error requesting swap:', err);
      error('Error', 'Failed to send swap request.');
    }
  };

  return <MatchFinder onRequestSwap={handleRequestSwap} />;
};

export default Matches;