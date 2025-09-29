import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Search, Handshake, Star, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from './Navbar';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "1. Find Skills",
      description: "Browse through thousands of skills offered by community members and find exactly what you need."
    },
    {
      icon: <Handshake className="h-8 w-8 text-accent" />,
      title: "2. Make a Match",
      description: "Connect with others who have skills you want and need skills you can offer. Perfect skill swapping!"
    },
    {
      icon: <Star className="h-8 w-8 text-success" />,
      title: "3. Swap & Rate",
      description: "Complete your skill exchange and rate your experience to build trust in our community."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "25,000+", label: "Skills Swapped" },
    { number: "50+", label: "Categories" },
    { number: "4.9/5", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Swap Skills,{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Not Money
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Join the world's largest skill-sharing community. Trade your expertise for new knowledge and build meaningful connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/skills">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 transition-all duration-300 text-lg px-8 py-6 shadow-elegant group"
                >
                  Find Skills
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/profile">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 border-2 hover:bg-muted/50 transition-all duration-300"
                >
                  Offer Skills
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Getting started with skill swapping is simple and rewarding
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-elegant transition-all duration-500 border-0 bg-card/80 backdrop-blur animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-gradient-secondary rounded-full group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why Choose SkillSwap?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Verified Community</h3>
                    <p className="text-muted-foreground">All members are verified and rated by the community for your safety and trust.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Globe className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Global Network</h3>
                    <p className="text-muted-foreground">Connect with skill-sharers from around the world or find local experts nearby.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Users className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Community Driven</h3>
                    <p className="text-muted-foreground">Built by the community, for the community. No hidden fees, just pure skill sharing.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-primary rounded-3xl opacity-20"></div>
              <div className="absolute inset-8 bg-card rounded-2xl shadow-elegant flex items-center justify-center">
                <Users className="h-24 w-24 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Start Swapping?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of learners and teachers sharing skills every day
          </p>
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 text-lg px-12 py-6 shadow-elegant"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;