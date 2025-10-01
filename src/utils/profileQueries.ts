import { supabase } from '@/integrations/supabase/client';

/**
 * Security Pattern: Profile Data Access
 * 
 * CRITICAL: Email addresses should only be accessible to the profile owner.
 * When querying profiles:
 * - For own profile: Include email field
 * - For other users' profiles: Exclude email field
 * 
 * This prevents email harvesting and protects user privacy.
 */

// Fields safe to display for any profile (excludes email)
const PUBLIC_PROFILE_FIELDS = 'id, name, bio, profile_pic, rating, completed_swaps, location, created_at, updated_at';

// Fields including email (only for own profile)
const OWN_PROFILE_FIELDS = 'id, name, email, bio, profile_pic, rating, completed_swaps, location, created_at, updated_at';

/**
 * Fetch the current user's own profile (includes email)
 */
export const fetchOwnProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select(OWN_PROFILE_FIELDS)
    .eq('id', userId)
    .single();
};

/**
 * Fetch another user's profile (excludes email for privacy)
 */
export const fetchPublicProfile = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_FIELDS)
    .eq('id', userId)
    .single();
};

/**
 * Fetch multiple profiles (excludes emails for privacy)
 */
export const fetchPublicProfiles = async (userIds?: string[]) => {
  let query = supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_FIELDS);
  
  if (userIds && userIds.length > 0) {
    query = query.in('id', userIds);
  }
  
  return await query;
};
