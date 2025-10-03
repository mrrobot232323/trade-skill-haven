import React, { useState } from 'react';
import { ArrowRight, Star, MapPin, Search, X, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skill } from '@/types';
import Navbar from './Navbar';

interface SkillListProps {
  skills: Skill[];
  loading?: boolean;
  onRequestSwap: (skill: Skill) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories?: string[];
  selectedCategory?: string | null;
  onCategoryClick?: (category: string) => void;
  onClearFilters?: () => void;
}

const SkillCard: React.FC<{ skill: Skill; onRequestSwap: (skill: Skill) => void }> = ({ 
  skill, 
  onRequestSwap 
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const navigate = useNavigate();

  return (
    <Card className="group hover-lift glass-card overflow-hidden h-full flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
      
      <CardHeader className="pb-3 relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className="bg-gradient-primary text-primary-foreground shadow-soft font-medium"
          >
            {skill.category}
          </Badge>
          {skill.location && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              <span>{skill.location}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <CardTitle className="text-2xl text-foreground group-hover:gradient-text transition-all">
            {skill.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {skill.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10 flex-1 flex flex-col">
        <div 
          onClick={() => navigate(`/profile/${skill.userId}`)}
          className="flex items-center space-x-3 cursor-pointer transition-all p-3 -mx-3 rounded-xl hover:bg-gradient-hero group/user"
        >
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold shadow-elegant text-lg transition-transform group-hover/user:scale-110">
            {skill.user.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-base group-hover/user:gradient-text transition-all">
              {skill.user}
            </p>
            <div className="flex items-center space-x-1">
              <Star className="h-3.5 w-3.5 text-warning fill-warning" />
              <span className="text-sm text-muted-foreground font-medium">4.8 rating</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover/user:opacity-100 group-hover/user:translate-x-1 transition-all" />
        </div>

        <div className="mt-auto">
          <Button 
            onClick={async () => {
              setIsRequesting(true);
              await onRequestSwap(skill);
              setTimeout(() => setIsRequesting(false), 2000);
            }}
            disabled={isRequesting}
            className="w-full btn-gradient h-11 text-base font-semibold hover:scale-105 active:scale-95 disabled:opacity-50 shadow-elegant"
          >
            {isRequesting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Sending Request...
              </span>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Request Skill Swap
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SkillList: React.FC<SkillListProps> = ({ 
  skills, 
  loading = false, 
  onRequestSwap,
  searchQuery = '',
  onSearchChange,
  categories = [],
  selectedCategory = null,
  onCategoryClick,
  onClearFilters
}) => {
  return (
    <div className="min-h-screen bg-gradient-secondary">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 text-center space-y-3">
          <h1 className="gradient-text">
            Discover Skills
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Find talented people offering skills you want to learn and connect for skill swaps
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by skill name, description, or user..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-12 pr-12 h-14 text-base glass-card border-border/50 focus:border-primary transition-all"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => onSearchChange?.('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filter by:</span>
              </div>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedCategory === category 
                      ? 'bg-gradient-primary shadow-glow' 
                      : 'hover:border-primary'
                  }`}
                  onClick={() => onCategoryClick?.(category)}
                >
                  {category}
                </Badge>
              ))}
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          )}

          {/* Active Filter Display */}
          {(searchQuery || selectedCategory) && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Showing {skills.length} result{skills.length !== 1 ? 's' : ''}
                {selectedCategory && ` in ${selectedCategory}`}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent shadow-glow"></div>
            <p className="mt-6 text-lg text-muted-foreground font-medium">Loading amazing skills...</p>
          </div>
        ) : skills.length === 0 ? (
          <Card className="text-center p-12 sm:p-16 glass-card hover-lift max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-elegant">
                <Star className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-foreground">
                  {searchQuery || selectedCategory ? 'No matches found' : 'No skills available yet'}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto text-base">
                  {searchQuery || selectedCategory 
                    ? 'Try adjusting your filters or search terms'
                    : 'Be the first to offer your skills and start connecting with others!'}
                </p>
              </div>
              {(searchQuery || selectedCategory) && (
                <Button onClick={onClearFilters} className="btn-gradient">
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <div
                key={skill.id}
                style={{ animationDelay: `${index * 0.05}s` }}
                className="animate-fade-in"
              >
                <SkillCard skill={skill} onRequestSwap={onRequestSwap} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillList;
