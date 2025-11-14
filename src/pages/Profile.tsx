import React, { useEffect, useState } from 'react';
import ProfilePage from '@/components/ProfilePage';
import { UserProfile } from '@/types';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Loader from '@/components/Loader';
import { profileSchema } from '@/utils/validation';

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
      // Validate profile data with zod schema
      const validatedData = profileSchema.parse({
        name: updatedProfile.name,
        bio: updatedProfile.bio || '',
        location: (updatedProfile as any).location || '',
        profilePicture: updatedProfile.profilePicture || ''
      });

      // Only update allowed fields, never update email through profile updates
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: validatedData.name,
          bio: validatedData.bio || null,
          location: validatedData.location || null,
          profile_pic: validatedData.profilePicture || null
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      success('Profile Updated!', 'Your profile has been successfully updated.');
      await fetchProfile(); // Refresh profile data
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.errors && err.errors.length > 0) {
        error('Validation Error', err.errors[0].message);
      } else {
        error('Error', 'Failed to update profile. Please try again.');
      }
    }
  };

  const handleAddSkill = async (skillName: string, type: 'offer' | 'want') => {
    try {
      // Validate skill name
      const trimmedSkillName = skillName.trim();
      if (trimmedSkillName.length < 2 || trimmedSkillName.length > 100) {
        error('Validation Error', 'Skill name must be between 2 and 100 characters');
        return;
      }

      // Check if user already has this skill
      const { data: existingSkill, error: skillError } = await supabase
        .from('skills')
        .select('id')
        .ilike('name', trimmedSkillName)
        .maybeSingle();

      if (skillError) throw skillError;

      let skillId: string;

      // If skill doesn't exist, create it
      if (!existingSkill) {
        const { data: newSkill, error: createError } = await supabase
          .from('skills')
          .insert({
            name: trimmedSkillName,
            category: 'General',
            description: `Learn ${trimmedSkillName}`
          })
          .select()
          .single();

        if (createError) throw createError;
        skillId = newSkill.id;
      } else {
        skillId = existingSkill.id;

        // Check if user already has this skill with the same type
        const { data: userHasSkill, error: checkError } = await supabase
          .from('user_skills')
          .select('id')
          .eq('user_id', user?.id)
          .eq('skill_id', skillId)
          .eq('type', type)
          .maybeSingle();

        if (checkError) throw checkError;

        if (userHasSkill) {
          error('Skill Already Added', `You already have "${trimmedSkillName}" in your ${type === 'offer' ? 'offered' : 'wanted'} skills.`);
          return;
        }
      }

      // Add skill to user_skills
      const { error: insertError } = await supabase
        .from('user_skills')
        .insert({
          user_id: user?.id,
          skill_id: skillId,
          type: type
        });

      if (insertError) {
        if (insertError.code === '23505') {
          error('Skill Already Added', `You already have "${trimmedSkillName}" in your profile.`);
          return;
        }
        throw insertError;
      }

      success('Skill Added!', `${trimmedSkillName} has been added to your ${type === 'offer' ? 'offered' : 'wanted'} skills.`);
      await fetchProfile(); // Refresh profile data
    } catch (err: any) {
      console.error('Error adding skill:', err);
      error('Error', 'Failed to add skill. Please try again.');
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