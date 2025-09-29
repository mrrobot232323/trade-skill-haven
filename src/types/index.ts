export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  profilePicture?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  rating: number;
  completedSwaps: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  user: string;
  userId: string;
  location?: string;
  tags: string[];
  createdAt: Date;
}

export interface AuthData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface Match {
  id: string;
  user: string;
  userId: string;
  skillOffered: string;
  skillWanted: string;
  compatibility: number;
  userProfile: UserProfile;
}

export interface Message {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Swap {
  id: string;
  user: string;
  userId: string;
  skill: string;
  skillId: string;
  status: "pending" | "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  userProfile: UserProfile;
}

export interface Review {
  id: string;
  user: string;
  userId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  swapId: string;
  createdAt: Date;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  isActive: boolean;
}