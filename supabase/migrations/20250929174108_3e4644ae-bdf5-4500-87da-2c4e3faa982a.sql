-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT,
  profile_pic VARCHAR(500),
  location VARCHAR(255),
  rating DECIMAL(3,2) DEFAULT 0.00,
  completed_swaps INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills master table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skills mapping table
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('offer', 'want')),
  level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id, type)
);

-- Create skill swap requests table
CREATE TABLE public.skill_swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  offered_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create swaps table
CREATE TABLE public.swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.skill_swap_requests(id) ON DELETE CASCADE UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_id UUID NOT NULL REFERENCES public.swaps(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_id UUID NOT NULL REFERENCES public.swaps(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swap_id, reviewer_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX idx_user_skills_type ON public.user_skills(type);
CREATE INDEX idx_requests_requester ON public.skill_swap_requests(requester_id);
CREATE INDEX idx_requests_receiver ON public.skill_swap_requests(receiver_id);
CREATE INDEX idx_requests_status ON public.skill_swap_requests(status);
CREATE INDEX idx_messages_swap_id ON public.messages(swap_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_reviews_swap_id ON public.reviews(swap_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for skills (public read)
CREATE POLICY "Skills are viewable by everyone"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create skills"
  ON public.skills FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for user_skills
CREATE POLICY "User skills are viewable by everyone"
  ON public.user_skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own skills"
  ON public.user_skills FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for skill_swap_requests
CREATE POLICY "Users can view their own requests"
  ON public.skill_swap_requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create requests"
  ON public.skill_swap_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own requests"
  ON public.skill_swap_requests FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- RLS Policies for swaps
CREATE POLICY "Users can view swaps they're part of"
  ON public.swaps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.skill_swap_requests
      WHERE skill_swap_requests.id = swaps.request_id
      AND (skill_swap_requests.requester_id = auth.uid() OR skill_swap_requests.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can create swaps from their requests"
  ON public.swaps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.skill_swap_requests
      WHERE skill_swap_requests.id = request_id
      AND (skill_swap_requests.requester_id = auth.uid() OR skill_swap_requests.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their swaps"
  ON public.swaps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.skill_swap_requests
      WHERE skill_swap_requests.id = swaps.request_id
      AND (skill_swap_requests.requester_id = auth.uid() OR skill_swap_requests.receiver_id = auth.uid())
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their swaps"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.swaps
      JOIN public.skill_swap_requests ON swaps.request_id = skill_swap_requests.id
      WHERE swaps.id = messages.swap_id
      AND (skill_swap_requests.requester_id = auth.uid() OR skill_swap_requests.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their swaps"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.swaps
      JOIN public.skill_swap_requests ON swaps.request_id = skill_swap_requests.id
      WHERE swaps.id = swap_id
      AND (skill_swap_requests.requester_id = auth.uid() OR skill_swap_requests.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.swaps
      JOIN public.skill_swap_requests ON swaps.request_id = skill_swap_requests.id
      WHERE swaps.id = messages.swap_id
      AND (skill_swap_requests.requester_id = auth.uid() OR skill_swap_requests.receiver_id = auth.uid())
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their swaps"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.swaps
      JOIN public.skill_swap_requests ON swaps.request_id = skill_swap_requests.id
      WHERE swaps.id = swap_id
      AND swaps.status = 'completed'
      AND (skill_swap_requests.requester_id = auth.uid() OR skill_swap_requests.receiver_id = auth.uid())
    )
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.skill_swap_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_swaps_updated_at
  BEFORE UPDATE ON public.swaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update user rating after review
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.reviews
    WHERE reviewed_id = NEW.reviewed_id
  )
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating when review is added
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_rating();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;