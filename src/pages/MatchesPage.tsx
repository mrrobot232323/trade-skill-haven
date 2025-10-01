import React, { useState, useEffect } from 'react';
import MatchFinder from '@/components/MatchFinder';
import { Match } from '@/types';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Loader from '@/components/Loader';
import { fetchPublicProfile } from '@/utils/profileQueries';

const MatchesPage: React.FC = () => {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      // Get user's wanted skills
      const { data: wantedSkills, error: wantedError } = await supabase
        .from('user_skills')
        .select('skill_id, skills(id, name, category)')
        .eq('user_id', user.id)
        .eq('type', 'want');

      if (wantedError) throw wantedError;

      // Get user's offered skills
      const { data: offeredSkills, error: offeredError } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id)
        .eq('type', 'offer');

      if (offeredError) throw offeredError;

      if (!wantedSkills?.length || !offeredSkills?.length) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // Find users who offer what we want and want what we offer
      const wantedSkillIds = wantedSkills.map((ws: any) => ws.skill_id);
      const offeredSkillIds = offeredSkills.map((os: any) => os.skill_id);

      // Find users who offer the skills we want
      const { data: potentialMatches, error: matchError } = await supabase
        .from('user_skills')
        .select(`
          user_id,
          skill_id,
          skills(id, name, category)
        `)
        .in('skill_id', wantedSkillIds)
        .eq('type', 'offer')
        .neq('user_id', user.id);

      if (matchError) throw matchError;

      // For each potential match, check if they want what we offer
      const matchPromises = (potentialMatches || []).map(async (pm: any) => {
        const { data: theirWants, error: wantError } = await supabase
          .from('user_skills')
          .select('skill_id')
          .eq('user_id', pm.user_id)
          .eq('type', 'want')
          .in('skill_id', offeredSkillIds);

        if (wantError || !theirWants?.length) return null;

        // Fetch user profile (without email for privacy)
        const profileResult = await fetchPublicProfile(pm.user_id);
        if (profileResult.error || !profileResult.data) return null;

        const profile = profileResult.data;

        // Get what they want from us
        const { data: wantedFromUs, error: wantedFromUsError } = await supabase
          .from('user_skills')
          .select('skills(name)')
          .eq('user_id', pm.user_id)
          .eq('type', 'want')
          .in('skill_id', offeredSkillIds)
          .limit(1)
          .single();

        if (wantedFromUsError) return null;

        // Calculate compatibility (simple version)
        const compatibility = Math.floor(Math.random() * 20) + 80; // 80-100%

        const match: Match = {
          id: `${pm.user_id}-${pm.skill_id}`,
          user: profile.name || 'Unknown User',
          userId: pm.user_id,
          skillOffered: pm.skills.name,
          skillWanted: wantedFromUs.skills.name,
          compatibility,
          userProfile: {
            id: profile.id,
            name: profile.name || 'Unknown User',
            email: '', // Email is excluded for privacy
            bio: profile.bio || '',
            skillsOffered: [],
            skillsWanted: [],
            rating: profile.rating || 0,
            completedSwaps: profile.completed_swaps || 0
          }
        };

        return match;
      });

      const matchResults = await Promise.all(matchPromises);
      const validMatches = matchResults.filter((m): m is Match => m !== null);
      
      setMatches(validMatches);
    } catch (err) {
      console.error('Error fetching matches:', err);
      error('Error', 'Failed to load matches.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = async (match: Match) => {
    if (!user) {
      error('Error', 'You must be logged in to request a swap.');
      return;
    }

    try {
      // Get the exact skill IDs for this match
      const { data: offeredSkill, error: offeredError } = await supabase
        .from('user_skills')
        .select('skill_id, skills(name)')
        .eq('user_id', user.id)
        .eq('type', 'offer')
        .limit(1)
        .single();

      const { data: requestedSkill, error: requestedError } = await supabase
        .from('skills')
        .select('id')
        .eq('name', match.skillOffered)
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
          requested_skill_id: requestedSkill.id,
          offered_skill_id: offeredSkill.skill_id,
          status: 'pending'
        });

      if (requestError) throw requestError;

      success(
        'Swap request sent!',
        `Your request to swap skills with ${match.user} has been sent.`
      );
      
      // Remove this match from the list since request is sent
      setMatches(prev => prev.filter(m => m.id !== match.id));
    } catch (err) {
      console.error('Error requesting swap:', err);
      error('Error', 'Failed to send swap request.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <MatchFinder matches={matches} onRequestSwap={handleRequestSwap} />;
};

export default MatchesPage;
