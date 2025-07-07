import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  BookOpen, 
  Zap, 
  Target, 
  Map, 
  Users, 
  BarChart3, 
  Shield, 
  Settings,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Star,
  Clock
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  popularity: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  articles: Article[];
}

const KnowledgeCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: Category[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of our unified product management platform',
      icon: BookOpen,
      color: 'bg-blue-500',
      articles: [
        {
          id: 'welcome',
          title: 'Welcome to the Unified Product Management Ecosystem',
          description: 'Overview of our comprehensive platform for managing complex products across enterprise and PLG models',
          category: 'getting-started',
          readTime: '5 min',
          popularity: 'high',
          lastUpdated: '2025-01-07'
        },
        {
          id: 'first-setup',
          title: 'Setting Up Your First Product',
          description: 'Step-by-step guide to configure your product workspace and basic settings',
          category: 'getting-started',
          readTime: '8 min',
          popularity: 'high',
          lastUpdated: '2025-01-06'
        },
        {
          id: 'navigation',
          title: 'Platform Navigation Guide',
          description: 'Understanding the main modules: Dashboard, Strategy, Roadmap, Sprints, and Customer Board',
          category: 'getting-started',
          readTime: '6 min',
          popularity: 'medium',
          lastUpdated: '2025-01-05'
        }
      ]
    },
    {
      id: 'ai-features',
      title: 'AI & Automation',
      description: 'Leverage AI-powered features for intelligent product management',
      icon: Zap,
      color: 'bg-purple-500',
      articles: [
        {
          id: 'ai-copilot',
          title: 'AI CoPilot Overview',
          description: 'How AI assists in drafting documentation, summarizing content, and providing insights',
          category: 'ai-features',
          readTime: '7 min',
          popularity: 'high',
          lastUpdated: '2025-01-07'
        },
        {
          id: 'smart-feedback',
          title: 'Smart Feedback Processing',
          description: 'Automated sentiment analysis, duplicate detection, and theme surfacing from customer feedback',
          category: 'ai-features',
          readTime: '9 min',
          popularity: 'high',
          lastUpdated: '2025-01-06'
        },
        {
          id: 'predictive-analytics',
          title: 'Predictive Analytics',
          description: 'AI-driven insights for user behavior patterns, product performance trends, and market opportunities',
          category: 'ai-features',
          readTime: '10 min',
          popularity: 'medium',
          lastUpdated: '2025-01-04'
        }
      ]
    },
    {
      id: 'strategy',
      title: 'Strategy & Planning',
      description: 'Strategic roadmapping and OKR alignment tools',
      icon: Target,
      color: 'bg-green-500',
      articles: [
        {
          id: 'okr-alignment',
          title: 'OKR Integration & Tracking',
          description: 'Link Objectives and Key Results to roadmap initiatives with AI-driven progress tracking',
          category: 'strategy',
          readTime: '12 min',
          popularity: 'high',
          lastUpdated: '2025-01-07'
        },
        {
          id: 'strategic-roadmaps',
          title: 'Strategic vs Delivery Roadmaps',
          description: 'Understanding the separation and linkage between high-level strategic and detailed execution roadmaps',
          category: 'strategy',
          readTime: '8 min',
          popularity: 'medium',
          lastUpdated: '2025-01-05'
        },
        {
          id: 'prd-generator',
          title: 'PRD Generator with AI',
          description: 'Creating living Product Requirements Documents with AI assistance and version control',
          category: 'strategy',
          readTime: '15 min',
          popularity: 'high',
          lastUpdated: '2025-01-06'
        }
      ]
    },
    {
      id: 'roadmaps',
      title: 'Roadmaps',
      description: 'Dynamic roadmapping with multiple views and stakeholder alignment',
      icon: Map,
      color: 'bg-orange-500',
      articles: [
        {
          id: 'roadmap-views',
          title: 'Multiple Roadmap Views',
          description: 'Timeline, Kanban, Now/Next/Later, and theme-based views for different audiences',
          category: 'roadmaps',
          readTime: '10 min',
          popularity: 'high',
          lastUpdated: '2025-01-07'
        },
        {
          id: 'roadmap-linking',
          title: 'Bidirectional Roadmap Linking',
          description: 'Connecting strategic initiatives to granular delivery tasks for complete alignment',
          category: 'roadmaps',
          readTime: '8 min',
          popularity: 'medium',
          lastUpdated: '2025-01-04'
        }
      ]
    },
    {
      id: 'feedback',
      title: 'Customer Feedback',
      description: 'Multi-channel feedback capture and intelligent analysis',
      icon: Users,
      color: 'bg-pink-500',
      articles: [
        {
          id: 'feedback-capture',
          title: 'Multi-Channel Feedback Collection',
          description: 'Capturing feedback from public boards, in-app widgets, support tickets, and CRM systems',
          category: 'feedback',
          readTime: '11 min',
          popularity: 'high',
          lastUpdated: '2025-01-07'
        },
        {
          id: 'feedback-prioritization',
          title: 'Data-Driven Prioritization',
          description: 'Scoring and ranking feature requests based on impact, effort, and strategic alignment',
          category: 'feedback',
          readTime: '9 min',
          popularity: 'high',
          lastUpdated: '2025-01-06'
        },
        {
          id: 'closed-loop',
          title: 'Closed-Loop Communication',
          description: 'Automated notifications and updates to users who provided feedback',
          category: 'feedback',
          readTime: '6 min',
          popularity: 'medium',
          lastUpdated: '2025-01-05'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Insights',
      description: 'Comprehensive data visualization and reporting capabilities',
      icon: BarChart3,
      color: 'bg-indigo-500',
      articles: [
        {
          id: 'dashboard-overview',
          title: 'Advanced Analytics Dashboard',
          description: 'Real-time data visualization with customizable widgets and KPI tracking',
          category: 'analytics',
          readTime: '12 min',
          popularity: 'high',
          lastUpdated: '2025-01-07'
        },
        {
          id: 'custom-reports',
          title: 'Custom Reporting',
          description: 'Generate on-demand reports spanning the entire product lifecycle',
          category: 'analytics',
          readTime: '10 min',
          popularity: 'medium',
          lastUpdated: '2025-01-05'
        },
        {
          id: 'plg-metrics',
          title: 'PLG Metrics & Experiments',
          description: 'Product-Led Growth analytics and A/B testing capabilities',
          category: 'analytics',
          readTime: '14 min',
          popularity: 'high',
          lastUpdated: '2025-01-06'
        }
      ]
    },
    {
      id: 'enterprise',
      title: 'Enterprise Features',
      description: 'Advanced security, compliance, and multi-product management',
      icon: Shield,
      color: 'bg-red-500',
      articles: [
        {
          id: 'security-compliance',
          title: 'Enterprise Security & Compliance',
          description: 'SSO, IP whitelisting, data residency, and comprehensive audit trails',
          category: 'enterprise',
          readTime: '15 min',
          popularity: 'medium',
          lastUpdated: '2025-01-07'
        },
        {
          id: 'multi-product',
          title: 'Multi-Product Portfolio Management',
          description: 'Managing complex product portfolios with strategic views and resource allocation',
          category: 'enterprise',
          readTime: '18 min',
          popularity: 'medium',
          lastUpdated: '2025-01-05'
        },
        {
          id: 'custom-workflows',
          title: 'Custom Workflow Templates',
          description: 'Creating and managing automated workflows for enterprise and PLG environments',
          category: 'enterprise',
          readTime: '12 min',
          popularity: 'low',
          lastUpdated: '2025-01-04'
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations & API',
      description: 'Connect with external tools and leverage our API',
      icon: Settings,
      color: 'bg-gray-500',
      articles: [
        {
          id: 'api-overview',
          title: 'API Documentation',
          description: 'Complete guide to our REST API endpoints and authentication',
          category: 'integrations',
          readTime: '20 min',
          popularity: 'medium',
          lastUpdated: '2025-01-06'
        },
        {
          id: 'webhooks',
          title: 'Webhooks & Notifications',
          description: 'Setting up real-time notifications and webhook integrations',
          category: 'integrations',
          readTime: '8 min',
          popularity: 'medium',
          lastUpdated: '2025-01-05'
        }
      ]
    }
  ];

  const allArticles = categories.flatMap(cat => cat.articles);
  
  const filteredArticles = allArticles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedCategories = selectedCategory 
    ? categories.filter(cat => cat.id === selectedCategory)
    : categories;

  const popularArticles = allArticles
    .filter(article => article.popularity === 'high')
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Knowledge Center
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Everything you need to know about our unified product management ecosystem
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Links */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {article.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          {article.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-2 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span className="capitalize">{article.popularity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Search Results ({filteredArticles.length})
            </h2>
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {article.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="capitalize">
                            {article.category.replace('-', ' ')}
                          </Badge>
                          <span>{article.readTime}</span>
                          <span>Updated {article.lastUpdated}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground ml-4 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {!searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Documentation Categories</h2>
              {selectedCategory && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm"
                >
                  View All Categories
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {displayedCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer group"
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${category.color} text-white`}>
                        <category.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {category.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {category.articles.length} articles
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {category.articles.map((article) => (
                        <div 
                          key={article.id} 
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer group"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {article.description}
                            </p>
                            <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                              <span>{article.readTime}</span>
                              <span>•</span>
                              <span className="capitalize">{article.popularity} popularity</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-3 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Help Footer */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-purple-600/5 border-primary/20">
            <CardContent className="p-8">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button>
                  Contact Support
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Documentation
                </Button>
                <Button variant="outline">
                  Community Forum
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCenter;