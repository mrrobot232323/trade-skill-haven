import React, { useState, useRef } from 'react';
import { Edit, Camera, Plus, X, Star, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/types';
import Navbar from './Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/Toast';

interface ProfilePageProps {
  userProfile?: UserProfile;
  userId?: string;
  onUpdateProfile?: (profile: UserProfile) => void;
  onAddSkill?: (skillName: string, type: 'offer' | 'want') => Promise<void>;
  onRemoveSkill?: (skillName: string, type: 'offer' | 'want') => Promise<void>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  userProfile,
  userId,
  onUpdateProfile,
  onAddSkill,
  onRemoveSkill
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: showError } = useToast();
  
  const [profile, setProfile] = useState<UserProfile>(userProfile || {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    bio: 'Passionate web developer and guitar enthusiast. Love teaching coding and learning new languages!',
    profilePicture: '',
    skillsOffered: [],
    skillsWanted: [],
    rating: 0,
    completedSwaps: 0
  });

  // Update profile state when userProfile prop changes
  React.useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile(profile);
    }
    setIsEditing(false);
  };

  const addSkill = async (type: 'offered' | 'wanted') => {
    const newSkill = type === 'offered' ? newSkillOffered : newSkillWanted;
    if (!newSkill.trim() || isAdding) return;

    setIsAdding(true);
    
    if (onAddSkill) {
      await onAddSkill(newSkill.trim(), type === 'offered' ? 'offer' : 'want');
    }

    if (type === 'offered') {
      setNewSkillOffered('');
    } else {
      setNewSkillWanted('');
    }
    
    setIsAdding(false);
  };

  const removeSkill = async (type: 'offered' | 'wanted', skillName: string) => {
    if (onRemoveSkill) {
      await onRemoveSkill(skillName, type === 'offered' ? 'offer' : 'want');
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    try {
      setUploading(true);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile with new picture URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_pic: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => ({ ...prev, profilePicture: publicUrl }));
      success('Profile picture updated!', 'Your profile picture has been updated successfully.');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      showError('Upload failed', 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <Navbar />
      
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Profile Header */}
        <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Picture */}
              <div className="relative group">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover shadow-elegant"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-elegant">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    <Button
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 rounded-full bg-accent hover:bg-accent/90"
                    >
                      {uploading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{profile.name}</h1>
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <span className="font-medium">{profile.rating}</span>
                        <span>rating</span>
                      </div>
                      <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full"></div>
                      <span>{profile.completedSwaps} swaps completed</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-gradient-primary">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Skills I Offer */}
          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-primary">Skills I Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.skillsOffered.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-sm py-1 px-3 bg-primary/10 text-primary border-primary/20 group"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill('offered', skill)}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a skill you can offer"
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isAdding && addSkill('offered')}
                    disabled={isAdding}
                  />
                  <Button 
                    onClick={() => addSkill('offered')} 
                    size="icon"
                    variant="outline"
                    disabled={isAdding}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills I Want */}
          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-accent">Skills I Want</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.skillsWanted.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-sm py-1 px-3 bg-accent/10 text-accent border-accent/20 group"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill('wanted', skill)}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a skill you want to learn"
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isAdding && addSkill('wanted')}
                    disabled={isAdding}
                  />
                  <Button 
                    onClick={() => addSkill('wanted')} 
                    size="icon"
                    variant="outline"
                    disabled={isAdding}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center shadow-soft border-0 bg-card/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{profile.completedSwaps}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card className="text-center shadow-soft border-0 bg-card/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">{profile.skillsOffered.length}</div>
              <div className="text-sm text-muted-foreground">Skills Offered</div>
            </CardContent>
          </Card>
          <Card className="text-center shadow-soft border-0 bg-card/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{profile.skillsWanted.length}</div>
              <div className="text-sm text-muted-foreground">Skills Wanted</div>
            </CardContent>
          </Card>
          <Card className="text-center shadow-soft border-0 bg-card/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">{profile.rating}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;