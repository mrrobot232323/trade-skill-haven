import React from 'react';
import ProfilePage from '@/components/ProfilePage';
import { UserProfile } from '@/types';
import { useToast } from '@/components/Toast';

const Profile: React.FC = () => {
  const { success } = useToast();

  const handleUpdateProfile = (profile: UserProfile) => {
    // Simulate API call
    setTimeout(() => {
      success(
        'Profile updated!',
        'Your profile has been successfully updated.'
      );
    }, 500);
  };

  return <ProfilePage onUpdateProfile={handleUpdateProfile} />;
};

export default Profile;