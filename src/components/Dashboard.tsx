import React, { useState } from 'react';
import { Check, X, Clock, Star, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Swap } from '@/types';
import Navbar from './Navbar';

interface DashboardProps {
  swaps?: Swap[];
  onAcceptSwap?: (swap: Swap) => void;
  onRejectSwap?: (swap: Swap) => void;
  onCompleteSwap?: (swap: Swap) => void;
  onChatSwap?: (swap: Swap) => void;
}

// Mock data for demo
const mockSwaps: Swap[] = [
  {
    id: '1',
    user: 'Emily Carter',
    userId: 'user1',
    skill: 'Spanish Language',
    skillId: 'skill1',
    status: 'pending',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    userProfile: {
      id: 'user1',
      name: 'Emily Carter',
      email: 'emily@example.com',
      bio: 'Native Spanish speaker from Barcelona',
      skillsOffered: ['Spanish Language', 'Graphic Design'],
      skillsWanted: ['Web Development', 'React'],
      rating: 4.9,
      completedSwaps: 18
    }
  },
  {
    id: '2',
    user: 'Alex Rodriguez',
    userId: 'user2',
    skill: 'Guitar Playing',
    skillId: 'skill2',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    userProfile: {
      id: 'user2',
      name: 'Alex Rodriguez',
      email: 'alex@example.com',
      bio: 'Professional guitarist with 15 years of experience',
      skillsOffered: ['Guitar Playing', 'Music Theory'],
      skillsWanted: ['Python Programming', 'Data Science'],
      rating: 4.7,
      completedSwaps: 12
    }
  },
  {
    id: '3',
    user: 'Sophie Chen',
    userId: 'user3',
    skill: 'Digital Marketing',
    skillId: 'skill3',
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-23'),
    userProfile: {
      id: 'user3',
      name: 'Sophie Chen',
      email: 'sophie@example.com',
      bio: 'Marketing strategist with expertise in social media',
      skillsOffered: ['Digital Marketing', 'Content Writing'],
      skillsWanted: ['French Language', 'Photography'],
      rating: 4.8,
      completedSwaps: 25
    }
  },
  {
    id: '4',
    user: 'Michael Thompson',
    userId: 'user4',
    skill: 'Photography',
    skillId: 'skill4',
    status: 'pending',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
    userProfile: {
      id: 'user4',
      name: 'Michael Thompson',
      email: 'michael@example.com',
      bio: 'Professional photographer specializing in portraits',
      skillsOffered: ['Photography', 'Photo Editing'],
      skillsWanted: ['Italian Language', 'Cooking'],
      rating: 4.6,
      completedSwaps: 8
    }
  }
];

const SwapCard: React.FC<{
  swap: Swap;
  onAccept?: (swap: Swap) => void;
  onReject?: (swap: Swap) => void;
  onComplete?: (swap: Swap) => void;
  onChat?: (swap: Swap) => void;
}> = ({ swap, onAccept, onReject, onComplete, onChat }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'active':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-elegant transition-all duration-300 border-0 bg-card/80 backdrop-blur">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                {swap.user.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{swap.user}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span>{swap.userProfile.rating}</span>
                  <span>•</span>
                  <span>{swap.userProfile.completedSwaps} swaps</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className={getStatusColor(swap.status)}>
              {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
            </Badge>
          </div>

          {/* Skill */}
          <div className="bg-gradient-secondary/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground mb-1">Skill to learn</p>
            <p className="font-medium text-foreground">{swap.skill}</p>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {swap.userProfile.bio}
          </p>

          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Requested: {formatDate(swap.createdAt)}</span>
            <span>Updated: {formatDate(swap.updatedAt)}</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            {swap.status === 'pending' && (
              <>
                <Button 
                  onClick={() => onAccept?.(swap)}
                  size="sm"
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button 
                  onClick={() => onReject?.(swap)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </>
            )}
            
            {swap.status === 'active' && (
              <>
                <Button 
                  onClick={() => onComplete?.(swap)}
                  size="sm"
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
                <Button 
                  onClick={() => onChat?.(swap)}
                  variant="outline"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {swap.status === 'completed' && (
              <Button 
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Star className="h-4 w-4 mr-2" />
                Leave Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC<DashboardProps> = ({
  swaps: propSwaps,
  onAcceptSwap,
  onRejectSwap,
  onCompleteSwap,
  onChatSwap
}) => {
  const [activeTab, setActiveTab] = useState('pending');

  const swaps = propSwaps || mockSwaps;

  const pendingSwaps = swaps.filter(swap => swap.status === 'pending');
  const activeSwaps = swaps.filter(swap => swap.status === 'active');
  const completedSwaps = swaps.filter(swap => swap.status === 'completed');

  const stats = [
    { label: 'Pending Requests', value: pendingSwaps.length, color: 'text-warning' },
    { label: 'Active Swaps', value: activeSwaps.length, color: 'text-primary' },
    { label: 'Completed', value: completedSwaps.length, color: 'text-success' },
    { label: 'Success Rate', value: '94%', color: 'text-accent' }
  ];

  const handleAccept = (swap: Swap) => {
    if (onAcceptSwap) {
      onAcceptSwap(swap);
    } else {
      console.log('Accepting swap:', swap.id);
    }
  };

  const handleReject = (swap: Swap) => {
    if (onRejectSwap) {
      onRejectSwap(swap);
    } else {
      console.log('Rejecting swap:', swap.id);
    }
  };

  const handleComplete = (swap: Swap) => {
    if (onCompleteSwap) {
      onCompleteSwap(swap);
    } else {
      console.log('Completing swap:', swap.id);
    }
  };

  const handleChat = (swap: Swap) => {
    if (onChatSwap) {
      onChatSwap(swap);
    } else {
      console.log('Opening chat for swap:', swap.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your skill swaps and track your progress
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center shadow-soft border-0 bg-card/60">
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border">
            <TabsTrigger value="pending" className="relative">
              Pending Requests
              {pendingSwaps.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs bg-warning/20 text-warning">
                  {pendingSwaps.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="relative">
              Active Swaps
              {activeSwaps.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs bg-primary/20 text-primary">
                  {activeSwaps.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Completed
              {completedSwaps.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs bg-success/20 text-success">
                  {completedSwaps.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingSwaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSwaps.map((swap, index) => (
                  <div
                    key={swap.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <SwapCard 
                      swap={swap} 
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center p-12 shadow-soft border-0 bg-card/80 backdrop-blur">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No pending requests</h3>
                <p className="text-muted-foreground">You're all caught up! New requests will appear here.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeSwaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSwaps.map((swap, index) => (
                  <div
                    key={swap.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <SwapCard 
                      swap={swap} 
                      onComplete={handleComplete}
                      onChat={handleChat}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center p-12 shadow-soft border-0 bg-card/80 backdrop-blur">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No active swaps</h3>
                <p className="text-muted-foreground">Start learning! Accept pending requests or find new skills.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedSwaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedSwaps.map((swap, index) => (
                  <div
                    key={swap.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <SwapCard swap={swap} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center p-12 shadow-soft border-0 bg-card/80 backdrop-blur">
                <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No completed swaps yet</h3>
                <p className="text-muted-foreground">Your completed skill exchanges will appear here.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;