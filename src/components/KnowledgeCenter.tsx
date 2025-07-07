import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
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
  Clock,
  MessageSquare,
  Sparkles,
  Home,
  Send
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  popularity: 'high' | 'medium' | 'low';
  lastUpdated: string;
  author?: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  articleCount: number;
  articles: Article[];
}

const KnowledgeCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: Category[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Best steps on getting started with our unified product management platform.',
      icon: Home,
      color: 'text-blue-500',
      articleCount: 11,
      articles: [
        {
          id: 'welcome',
          title: 'Welcome to the Unified Product Management Ecosystem',
          description: 'Overview of our comprehensive platform for managing complex products across enterprise and PLG models',
          category: 'getting-started',
          readTime: '5 min',
          popularity: 'high',
          lastUpdated: '2025-01-07',
          author: 'PM'
        },
        {
          id: 'first-setup',
          title: 'Setting Up Your First Product',
          description: 'Step-by-step guide to configure your product workspace and basic settings',
          category: 'getting-started',
          readTime: '8 min',
          popularity: 'high',
          lastUpdated: '2025-01-06',
          author: 'JS'
        }
      ]
    },
    {
      id: 'feedback-roadmaps',
      title: 'Feedback & Roadmaps',
      description: 'Set up your Feedback Portal & Roadmaps to collect feedback and show users what you\'re working on.',
      icon: Map,
      color: 'text-purple-500',
      articleCount: 72,
      articles: [
        {
          id: 'feedback-capture',
          title: 'Multi-Channel Feedback Collection',
          description: 'Capturing feedback from public boards, in-app widgets, support tickets, and CRM systems',
          category: 'feedback-roadmaps',
          readTime: '11 min',
          popularity: 'high',
          lastUpdated: '2025-01-07',
          author: 'SB'
        }
      ]
    },
    {
      id: 'ai-platform',
      title: 'AI & Automation',
      description: 'Leverage AI-powered features for intelligent product management and automation.',
      icon: Sparkles,
      color: 'text-emerald-500',
      articleCount: 25,
      articles: [
        {
          id: 'ai-copilot',
          title: 'AI CoPilot Overview',
          description: 'How AI assists in drafting documentation, summarizing content, and providing insights',
          category: 'ai-platform',
          readTime: '7 min',
          popularity: 'high',
          lastUpdated: '2025-01-07',
          author: 'AI'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Insights',
      description: 'Learn how to customize your analytics dashboard, create reports, and analyze user behavior.',
      icon: BarChart3,
      color: 'text-indigo-500',
      articleCount: 18,
      articles: []
    },
    {
      id: 'strategy',
      title: 'Strategy & Planning',
      description: 'Learn to manage your strategy, OKRs and different ways of planning product development.',
      icon: Target,
      color: 'text-orange-500',
      articleCount: 12,
      articles: []
    },
    {
      id: 'enterprise',
      title: 'Enterprise Features',
      description: 'Learn how to set up, customize, and manage enterprise security and multi-product features.',
      icon: Shield,
      color: 'text-red-500',
      articleCount: 9,
      articles: []
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Learn how to manage your users, create segments, and define user roles.',
      icon: Users,
      color: 'text-pink-500',
      articleCount: 12,
      articles: []
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Learn to integrate with your favorite tools to help you get the most out of your product data.',
      icon: Settings,
      color: 'text-teal-500',
      articleCount: 15,
      articles: []
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
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-6xl mx-auto p-6">
        {/* Header matching FeatureBase style */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            How can we help you?
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get answers in seconds with our AI search or find them in our detailed articles.
          </p>
          
          {/* Search matching FeatureBase */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Ask AI or search for articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-base bg-card border-border rounded-xl"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
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

        {/* Categories Grid - FeatureBase Style */}
        {!searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="p-6 hover:shadow-lg transition-all cursor-pointer group border-border"
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={cn("p-3 rounded-lg bg-gradient-to-br", 
                    category.color === 'text-blue-500' ? 'from-blue-500 to-blue-600' :
                    category.color === 'text-purple-500' ? 'from-purple-500 to-purple-600' :
                    category.color === 'text-emerald-500' ? 'from-emerald-500 to-emerald-600' :
                    category.color === 'text-indigo-500' ? 'from-indigo-500 to-indigo-600' :
                    category.color === 'text-orange-500' ? 'from-orange-500 to-orange-600' :
                    category.color === 'text-red-500' ? 'from-red-500 to-red-600' :
                    category.color === 'text-pink-500' ? 'from-pink-500 to-pink-600' :
                    'from-teal-500 to-teal-600'
                  )}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    
                    {/* Article count and authors */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {/* Author avatars */}
                        <div className="flex -space-x-2">
                          {category.articles.slice(0, 3).map((article, index) => (
                            <Avatar key={index} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {article.author || 'PM'}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {category.articleCount} articles
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Footer with support links */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-medium">Send us a message</h4>
              <p className="text-sm text-muted-foreground">Get direct help from our team</p>
            </div>
            <div className="space-y-2">
              <Send className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-medium">Leave us feedback</h4>
              <p className="text-sm text-muted-foreground">Help us improve our platform</p>
            </div>
            <div className="space-y-2">
              <ExternalLink className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-medium">API Documentation</h4>
              <p className="text-sm text-muted-foreground">Technical reference guides</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCenter;