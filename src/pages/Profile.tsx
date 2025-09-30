import React, { useEffect, useState } from 'react';
import ProfilePage from '@/components/ProfilePage';
import { UserProfile } from '@/types';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Loader from '@/components/Loader';

const Profile: React.FC = () => {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          bio: data.bio || '',
          profilePicture: data.profile_pic || undefined,
          skillsOffered: [],
          skillsWanted: [],
          rating: data.rating || 0,
          completedSwaps: data.completed_swaps || 0
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

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: updatedProfile.name,
          bio: updatedProfile.bio,
          profile_pic: updatedProfile.profilePicture
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      success('Profile updated!', 'Your profile has been successfully updated.');
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
      error('Error', 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <ProfilePage userProfile={profile || undefined} onUpdateProfile={handleUpdateProfile} />;
};

export default Profile;