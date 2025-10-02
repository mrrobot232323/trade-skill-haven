import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfilePage from '@/components/ProfilePage';
import { UserProfile } from '@/types';
import { useToast } from '@/components/Toast';
import { supabase } from '@/integrations/supabase/client';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const UserProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { error } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      // Fetch public profile data (no email for other users)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, bio, profile_pic, rating, completed_swaps')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch user skills with skill names
      const { data: userSkills, error: skillsError } = await supabase
        .from('user_skills')
        .select(`
          id,
          type,
          skills (
            id,
            name
          )
        `)
        .eq('user_id', userId);

      if (skillsError) throw skillsError;

      const skillsOffered = userSkills
        ?.filter((us: any) => us.type === 'offer')
        .map((us: any) => us.skills.name) || [];
      
      const skillsWanted = userSkills
        ?.filter((us: any) => us.type === 'want')
        .map((us: any) => us.skills.name) || [];

      if (profileData) {
        const userProfile: UserProfile = {
          id: profileData.id,
          name: profileData.name,
          email: '', // Don't show email for other users
          bio: profileData.bio || '',
          profilePicture: profileData.profile_pic || undefined,
          skillsOffered,
          skillsWanted,
          rating: profileData.rating || 0,
          completedSwaps: profileData.completed_swaps || 0
        };
        setProfile(userProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      error('Error', 'Failed to load profile.');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-secondary">
      <div className="max-w-7xl mx-auto p-6">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4 hover:scale-105 transition-transform"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <ProfilePage 
          userProfile={profile || undefined}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default UserProfileView;
