import React from 'react';
import { ArrowRight, Star, MessageCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Match } from '@/types';
import Navbar from './Navbar';

interface MatchFinderProps {
  matches?: Match[];
  onRequestSwap?: (match: Match) => void;
}

// Mock data for demo
const mockMatches: Match[] = [
  {
    id: '1',
    user: 'Emily Carter',
    userId: 'user1',
    skillOffered: 'Spanish Language',
    skillWanted: 'Web Development',
    compatibility: 95,
    userProfile: {
      id: 'user1',
      name: 'Emily Carter',
      email: 'emily@example.com',
      bio: 'Native Spanish speaker from Barcelona, passionate about learning tech skills.',
      skillsOffered: ['Spanish Language', 'Graphic Design', 'Photography'],
      skillsWanted: ['Web Development', 'React', 'JavaScript'],
      rating: 4.9,
      completedSwaps: 18
    }
  },
  {
    id: '2',
    user: 'Alex Rodriguez',
    userId: 'user2',
    skillOffered: 'Guitar Playing',
    skillWanted: 'Python Programming',
    compatibility: 88,
    userProfile: {
      id: 'user2',
      name: 'Alex Rodriguez',
      email: 'alex@example.com',
      bio: 'Professional guitarist with 15 years of experience. Looking to transition into tech.',
      skillsOffered: ['Guitar Playing', 'Music Theory', 'Audio Production'],
      skillsWanted: ['Python Programming', 'Data Science', 'Machine Learning'],
      rating: 4.7,
      completedSwaps: 12
    }
  },
  {
    id: '3',
    user: 'Sophie Chen',
    userId: 'user3',
    skillOffered: 'Digital Marketing',
    skillWanted: 'French Language',
    compatibility: 92,
    userProfile: {
      id: 'user3',
      name: 'Sophie Chen',
      email: 'sophie@example.com',
      bio: 'Marketing strategist with expertise in social media and content creation.',
      skillsOffered: ['Digital Marketing', 'Content Writing', 'SEO'],
      skillsWanted: ['French Language', 'Photography', 'Cooking'],
      rating: 4.8,
      completedSwaps: 25
    }
  },
  {
    id: '4',
    user: 'Michael Thompson',
    userId: 'user4',
    skillOffered: 'Photography',
    skillWanted: 'Italian Language',
    compatibility: 85,
    userProfile: {
      id: 'user4',
      name: 'Michael Thompson',
      email: 'michael@example.com',
      bio: 'Professional photographer specializing in portraits and events.',
      skillsOffered: ['Photography', 'Photo Editing', 'Lightroom'],
      skillsWanted: ['Italian Language', 'Cooking', 'Wine Tasting'],
      rating: 4.6,
      completedSwaps: 8
    }
  }
];

const MatchCard: React.FC<{ match: Match; onRequestSwap: (match: Match) => void }> = ({ 
  match, 
  onRequestSwap 
}) => {
  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getCompatibilityBadge = (score: number) => {
    if (score >= 90) return 'Perfect Match';
    if (score >= 80) return 'Great Match';
    return 'Good Match';
  };

  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 border-0 bg-card/80 backdrop-blur animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
              {match.user.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{match.user}</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span className="text-sm text-muted-foreground">{match.userProfile.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {match.userProfile.completedSwaps} swaps
                </span>
              </div>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`${getCompatibilityColor(match.compatibility)} font-medium`}
          >
            {match.compatibility}% {getCompatibilityBadge(match.compatibility)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skill Exchange */}
        <div className="bg-gradient-secondary/30 rounded-lg p-4 space-y-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Perfect skill exchange opportunity</p>
          </div>
          
          <div className="grid grid-cols-3 items-center gap-3">
            <div className="text-center">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 px-3 py-1">
                They offer
              </Badge>
              <p className="font-medium text-foreground text-sm">{match.skillOffered}</p>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="text-center">
              <Badge className="bg-accent/10 text-accent border-accent/20 mb-2 px-3 py-1">
                They want
              </Badge>
              <p className="font-medium text-foreground text-sm">{match.skillWanted}</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {match.userProfile.bio}
        </p>

        {/* All Skills */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Skills they offer:</p>
            <div className="flex flex-wrap gap-1">
              {match.userProfile.skillsOffered.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs border-primary/20 text-primary/80">
                  {skill}
                </Badge>
              ))}
              {match.userProfile.skillsOffered.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{match.userProfile.skillsOffered.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Skills they want:</p>
            <div className="flex flex-wrap gap-1">
              {match.userProfile.skillsWanted.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs border-accent/20 text-accent/80">
                  {skill}
                </Badge>
              ))}
              {match.userProfile.skillsWanted.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{match.userProfile.skillsWanted.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={() => onRequestSwap(match)}
            className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Request Swap
          </Button>
          <Button variant="outline" size="icon">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const MatchFinder: React.FC<MatchFinderProps> = ({ matches: propMatches, onRequestSwap }) => {
  const matches = propMatches || mockMatches;

  const handleRequestSwap = (match: Match) => {
    if (onRequestSwap) {
      onRequestSwap(match);
    } else {
      console.log('Requesting swap with:', match.user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Perfect Matches Found
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We've found people who have skills you want and need skills you can offer. 
            These are your best opportunities for skill swapping!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center shadow-soft border-0 bg-card/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{matches.length}</div>
              <div className="text-sm text-muted-foreground">Perfect Matches</div>
            </CardContent>
          </Card>
          <Card className="text-center shadow-soft border-0 bg-card/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">
                {matches.length > 0 
                  ? Math.round(matches.reduce((acc, match) => acc + match.compatibility, 0) / matches.length)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Compatibility</div>
            </CardContent>
          </Card>
          <Card className="text-center shadow-soft border-0 bg-card/60">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {matches.filter(m => m.compatibility >= 90).length}
              </div>
              <div className="text-sm text-muted-foreground">Perfect Matches</div>
            </CardContent>
          </Card>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((match, index) => (
            <div
              key={match.id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <MatchCard match={match} onRequestSwap={handleRequestSwap} />
            </div>
          ))}
        </div>

        {/* No matches state */}
        {matches.length === 0 && (
          <Card className="text-center p-12 shadow-soft border-0 bg-card/80 backdrop-blur">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No matches found yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Add more skills to your profile to increase your chances of finding perfect matches.
              </p>
              <Button variant="outline">Update Your Profile</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MatchFinder;