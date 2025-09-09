import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Zap, 
  Brain, 
  Rocket,
  Users,
  Target,
  BarChart3,
  Shield,
  Globe,
  Lightbulb,
  CheckCircle,
  Star,
  ArrowRight,
  TrendingUp,
  Workflow,
  MessageSquare,
  PieChart
} from 'lucide-react';
import EnterpriseHub from './EnterpriseHub';

interface Phase5DemoProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

interface Phase5Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'in-progress' | 'planned';
  impact: 'high' | 'medium' | 'low';
  category: 'intelligence' | 'automation' | 'experience' | 'scale';
  metrics?: {
    improvement: string;
    timesSaved: string;
    accuracy: string;
  };
}

const Phase5Demo: React.FC<Phase5DemoProps> = ({ selectedProductId, onNavigate }) => {
  const [activeView, setActiveView] = useState<string>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const phase5Features: Phase5Feature[] = [
    {
      id: 'ai-copilot',
      title: 'AI Product Copilot',
      description: 'Intelligent assistant for product decisions, requirement generation, and strategic insights',
      icon: <Brain className="w-5 h-5" />,
      status: 'completed',
      impact: 'high',
      category: 'intelligence',
      metrics: {
        improvement: '60%',
        timesSaved: '12hrs/week',
        accuracy: '94%'
      }
    },
    {
      id: 'workflow-automation',
      title: 'Workflow Automation Engine',
      description: 'Automated task routing, approval workflows, and intelligent process optimization',
      icon: <Workflow className="w-5 h-5" />,
      status: 'completed',
      impact: 'high',
      category: 'automation',
      metrics: {
        improvement: '75%',
        timesSaved: '8hrs/week',
        accuracy: '98%'
      }
    },
    {
      id: 'predictive-insights',
      title: 'Predictive Market Intelligence',
      description: 'AI-powered market trend analysis, competitive intelligence, and opportunity prediction',
      icon: <PieChart className="w-5 h-5" />,
      status: 'completed',
      impact: 'high',
      category: 'intelligence',
      metrics: {
        improvement: '45%',
        timesSaved: '6hrs/week',
        accuracy: '87%'
      }
    },
    {
      id: 'adaptive-ui',
      title: 'Adaptive User Experience',
      description: 'Personalized interfaces that adapt to user behavior and preferences',
      icon: <Sparkles className="w-5 h-5" />,
      status: 'in-progress',
      impact: 'medium',
      category: 'experience',
      metrics: {
        improvement: '35%',
        timesSaved: '4hrs/week',
        accuracy: '91%'
      }
    },
    {
      id: 'autonomous-scaling',
      title: 'Autonomous Scaling',
      description: 'Self-optimizing infrastructure that scales based on predicted demand and usage patterns',
      icon: <Zap className="w-5 h-5" />,
      status: 'in-progress',
      impact: 'high',
      category: 'scale',
      metrics: {
        improvement: '85%',
        timesSaved: '15hrs/week',
        accuracy: '96%'
      }
    },
    {
      id: 'voice-interface',
      title: 'Natural Voice Interface',
      description: 'Voice-powered product management for hands-free operation and accessibility',
      icon: <MessageSquare className="w-5 h-5" />,
      status: 'planned',
      impact: 'medium',
      category: 'experience'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Features', icon: Star },
    { id: 'intelligence', name: 'AI Intelligence', icon: Brain },
    { id: 'automation', name: 'Automation', icon: Workflow },
    { id: 'experience', name: 'Experience', icon: Sparkles },
    { id: 'scale', name: 'Scale', icon: Zap }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'in-progress': return 'bg-amber text-amber-foreground';
      case 'planned': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-primary';
      case 'medium': return 'text-amber';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const filteredFeatures = selectedCategory === 'all' 
    ? phase5Features 
    : phase5Features.filter(f => f.category === selectedCategory);

  if (activeView === 'enterprise-hub') {
    return <EnterpriseHub onNavigateBack={() => setActiveView('overview')} />;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="relative z-10 p-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Phase 5: Intelligent Evolution</span>
          </div>
          <h1 className="text-4xl font-bold font-headline bg-gradient-intelligence bg-clip-text text-transparent mb-4">
            AI-Powered Product Intelligence
          </h1>
          <p className="text-xl text-muted-foreground font-body max-w-2xl mx-auto">
            Advanced AI capabilities, autonomous workflows, and predictive intelligence 
            that transform how product teams operate and deliver value.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <Card className="loom-shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Productivity Gain', value: '+68%', icon: TrendingUp, color: 'text-primary' },
          { label: 'Time Saved', value: '45hrs/week', icon: Zap, color: 'text-amber' },
          { label: 'Decision Accuracy', value: '94%', icon: Target, color: 'text-primary' },
          { label: 'User Satisfaction', value: '9.2/10', icon: Star, color: 'text-amber' }
        ].map((stat, index) => (
          <Card key={index} className="loom-shadow-sm">
            <CardContent className="p-6 text-center">
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-bold font-headline mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFeatures.map((feature) => (
          <Card 
            key={feature.id} 
            className="loom-shadow-md loom-hover-lift transition-all duration-300 border-l-4 border-l-primary"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-accent text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-headline text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{feature.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status.replace('-', ' ')}
                  </Badge>
                  <div className={`flex items-center text-xs ${getImpactColor(feature.impact)}`}>
                    <Star className="w-3 h-3 mr-1" />
                    {feature.impact} impact
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feature.metrics && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold font-headline text-primary">
                      {feature.metrics.improvement}
                    </div>
                    <div className="text-xs text-muted-foreground">Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold font-headline text-amber">
                      {feature.metrics.timesSaved}
                    </div>
                    <div className="text-xs text-muted-foreground">Time Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold font-headline text-primary">
                      {feature.metrics.accuracy}
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center space-x-2"
                disabled={feature.status === 'planned'}
              >
                <span>{feature.status === 'planned' ? 'Coming Soon' : 'Explore Feature'}</span>
                {feature.status !== 'planned' && <ArrowRight className="w-4 h-4" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enterprise Hub Access */}
      <Card className="loom-shadow-lg gradient-clarity border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-primary text-primary-foreground">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-headline">Enterprise Hub</h3>
                <p className="text-muted-foreground font-body">
                  Access advanced monitoring, testing, and predictive analytics
                </p>
              </div>
            </div>
            <Badge variant="secondary">Phase 4 Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Production Ready', value: '94%', icon: CheckCircle },
              { label: 'Test Coverage', value: '87.5%', icon: Shield },
              { label: 'Monitoring', value: 'Active', icon: BarChart3 },
              { label: 'AI Analytics', value: '89%', icon: Brain }
            ].map((stat, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-background/50">
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="font-bold font-headline">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            onClick={() => setActiveView('enterprise-hub')}
          >
            <Globe className="w-4 h-4 mr-2" />
            Access Enterprise Hub
          </Button>
        </CardContent>
      </Card>

      {/* Implementation Roadmap */}
      <Card className="loom-shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-3 text-amber" />
            Phase 5 Implementation Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { phase: 'Q1 2025', title: 'AI Copilot & Workflow Automation', status: 'completed' },
              { phase: 'Q2 2025', title: 'Predictive Intelligence & Market Analysis', status: 'completed' },
              { phase: 'Q3 2025', title: 'Adaptive UX & Voice Interface', status: 'in-progress' },
              { phase: 'Q4 2025', title: 'Autonomous Scaling & Advanced AI', status: 'planned' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-accent/10">
                <Badge className={getStatusColor(item.status)}>
                  {item.phase}
                </Badge>
                <div className="flex-1">
                  <div className="font-medium font-headline">{item.title}</div>
                </div>
                <CheckCircle className={`w-4 h-4 ${item.status === 'completed' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase5Demo;