import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skill } from '@/types';
import Navbar from './Navbar';

interface SkillListProps {
  skills?: Skill[];
  loading?: boolean;
  onRequestSwap?: (skill: Skill) => void;
}

// Mock data for demo
const mockSkills: Skill[] = [
  {
    id: '1',
    name: 'React Development',
    description: 'Learn modern React with hooks, context, and state management. Perfect for beginners to intermediate developers.',
    category: 'Programming',
    user: 'Sarah Chen',
    userId: 'user1',
    location: 'San Francisco, CA',
    tags: ['React', 'JavaScript', 'Frontend'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Spanish Conversation',
    description: 'Native Spanish speaker offering conversational practice and cultural insights for all levels.',
    category: 'Languages',
    user: 'Carlos Rodriguez',
    userId: 'user2',
    location: 'Madrid, Spain',
    tags: ['Spanish', 'Conversation', 'Culture'],
    createdAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Guitar Lessons',
    description: 'Acoustic and electric guitar lessons from beginner to advanced. 10+ years of teaching experience.',
    category: 'Music',
    user: 'Mike Johnson',
    userId: 'user3',
    location: 'Austin, TX',
    tags: ['Guitar', 'Music', 'Acoustic'],
    createdAt: new Date('2024-01-18')
  },
  {
    id: '4',
    name: 'Digital Photography',
    description: 'Professional photographer teaching composition, lighting, and post-processing techniques.',
    category: 'Art & Design',
    user: 'Emma Wilson',
    userId: 'user4',
    location: 'New York, NY',
    tags: ['Photography', 'Lightroom', 'Composition'],
    createdAt: new Date('2024-01-22')
  },
  {
    id: '5',
    name: 'Python Programming',
    description: 'Learn Python from scratch or advance your skills with data science and automation projects.',
    category: 'Programming',
    user: 'David Kim',
    userId: 'user5',
    location: 'Seattle, WA',
    tags: ['Python', 'Data Science', 'Automation'],
    createdAt: new Date('2024-01-25')
  },
  {
    id: '6',
    name: 'Italian Cooking',
    description: 'Authentic Italian recipes and cooking techniques passed down through generations.',
    category: 'Cooking',
    user: 'Giuseppe Rossi',
    userId: 'user6',
    location: 'Rome, Italy',
    tags: ['Cooking', 'Italian', 'Recipes'],
    createdAt: new Date('2024-01-28')
  }
];

const categories = ['All Categories', 'Programming', 'Languages', 'Music', 'Art & Design', 'Cooking', 'Sports'];

const SkillCard: React.FC<{ skill: Skill; onRequestSwap: (skill: Skill) => void }> = ({ 
  skill, 
  onRequestSwap 
}) => {
  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 cursor-pointer border-0 bg-card/80 backdrop-blur animate-fade-in">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {skill.name}
              </h3>
              <p className="text-sm text-muted-foreground">{skill.category}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {skill.category}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {skill.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {skill.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-1 border-primary/20 text-primary/80"
              >
                {tag}
              </Badge>
            ))}
            {skill.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{skill.tags.length - 3} more
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center text-xs text-white font-medium">
                  {skill.user.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-medium text-foreground">{skill.user}</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span className="text-xs text-muted-foreground">4.8</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                {skill.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{skill.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo(skill.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => onRequestSwap(skill)}
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-sm px-4 py-2"
            >
              Request Swap
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SkillList: React.FC<SkillListProps> = ({ skills: propSkills, loading: propLoading, onRequestSwap }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('recent');

  const skills = propSkills || mockSkills;
  const loading = propLoading ?? false;

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || skill.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleRequestSwap = (skill: Skill) => {
    if (onRequestSwap) {
      onRequestSwap(skill);
    } else {
      // Default behavior - could show a modal or redirect
      console.log('Requesting swap for:', skill.name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Discover Skills
          </h1>
          <p className="text-xl text-muted-foreground">
            Find the perfect skill match from our community of learners and teachers
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-soft border-0 bg-card/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills, tags, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-muted-foreground">Loading skills...</p>
            </div>
          </div>
        ) : filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill, index) => (
              <div
                key={skill.id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <SkillCard skill={skill} onRequestSwap={handleRequestSwap} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 shadow-soft border-0 bg-card/80 backdrop-blur">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No skills found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find more skills.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Categories');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SkillList;