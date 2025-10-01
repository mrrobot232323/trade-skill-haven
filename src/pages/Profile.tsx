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
      // Fetch profile data - explicitly select fields including email only for own profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, bio, profile_pic, rating, completed_swaps')
        .eq('id', user?.id)
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
        .eq('user_id', user?.id);

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
          email: profileData.email,
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

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    try {
      // Only update allowed fields, never update email through profile updates
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
      await fetchProfile(); // Refresh profile data
    } catch (err) {
      console.error('Error updating profile:', err);
      error('Error', 'Failed to update profile.');
    }
  };

  const handleAddSkill = async (skillName: string, type: 'offer' | 'want') => {
    try {
      // First, check if skill exists
      let { data: existingSkill, error: skillError } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skillName)
        .maybeSingle();

      if (skillError) throw skillError;

      let skillId: string;

      // If skill doesn't exist, create it
      if (!existingSkill) {
        const { data: newSkill, error: createError } = await supabase
          .from('skills')
          .insert({
            name: skillName,
            category: 'Other',
            description: `Learn ${skillName}`
          })
          .select()
          .single();

        if (createError) throw createError;
        skillId = newSkill.id;
      } else {
        skillId = existingSkill.id;
      }

      // Add skill to user_skills
      const { error: insertError } = await supabase
        .from('user_skills')
        .insert({
          user_id: user?.id,
          skill_id: skillId,
          type: type
        });

      if (insertError) throw insertError;

      success('Skill added!', `${skillName} has been added to your profile.`);
      await fetchProfile(); // Refresh profile data
    } catch (err) {
      console.error('Error adding skill:', err);
      error('Error', 'Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (skillName: string, type: 'offer' | 'want') => {
    try {
      // Get skill id
      const { data: skill, error: skillError } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skillName)
        .single();

      if (skillError) throw skillError;

      // Remove from user_skills
      const { error: deleteError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user?.id)
        .eq('skill_id', skill.id)
        .eq('type', type);

      if (deleteError) throw deleteError;

      success('Skill removed!', `${skillName} has been removed from your profile.`);
      await fetchProfile(); // Refresh profile data
    } catch (err) {
      console.error('Error removing skill:', err);
      error('Error', 'Failed to remove skill.');
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
    <ProfilePage 
      userProfile={profile || undefined}
      userId={user?.id}
      onUpdateProfile={handleUpdateProfile}
      onAddSkill={handleAddSkill}
      onRemoveSkill={handleRemoveSkill}
    />
  );
};

export default Profile;