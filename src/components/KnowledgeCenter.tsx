import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  Search, 
  BookOpen, 
  Map, 
  Users, 
  BarChart3, 
  Shield, 
  Settings,
  ExternalLink,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Home,
  Send,
  Plus,
  Edit,
  Eye,
  Clock,
  Star,
  Target,
  ArrowLeft,
  Save
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  readTime: string;
  popularity: 'high' | 'medium' | 'low';
  lastUpdated: string;
  author: string;
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
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [view, setView] = useState<'browse' | 'article' | 'edit'>('browse');
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    description: '',
    content: '',
    category: 'getting-started'
  });

  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Best steps on getting started with our unified product management platform.',
      icon: Home,
      color: 'text-blue-500',
      articleCount: 3,
      articles: [
        {
          id: 'welcome',
          title: 'Welcome to the Unified Product Management Ecosystem',
          description: 'Overview of our comprehensive platform for managing complex products across enterprise and PLG models',
          content: `# Welcome to the Unified Product Management Ecosystem

## Overview
Our platform provides a comprehensive solution for managing complex products across both enterprise and Product-Led Growth (PLG) models.

## Key Features
- **Unified Data Management**: Centralized repository for all product-related data
- **AI-Powered Insights**: Intelligent analysis and automation
- **Strategic Alignment**: Link OKRs to roadmap initiatives
- **Multi-Channel Feedback**: Capture feedback from various sources

## Getting Started
1. Set up your first product workspace
2. Configure your feedback channels
3. Create your initial roadmap
4. Invite your team members

## Next Steps
- Read the "Setting Up Your First Product" guide
- Explore the AI features documentation
- Check out the feedback management tutorials`,
          category: 'getting-started',
          readTime: '5 min',
          popularity: 'high',
          lastUpdated: '2025-01-07',
          author: 'Product Team'
        },
        {
          id: 'first-setup',
          title: 'Setting Up Your First Product',
          description: 'Step-by-step guide to configure your product workspace and basic settings',
          content: `# Setting Up Your First Product

## Prerequisites
Before you begin, make sure you have:
- Admin access to the platform
- Your product requirements defined
- Team member email addresses ready

## Step 1: Create Product Workspace
1. Navigate to the Products section
2. Click "Create New Product"
3. Enter your product name and description
4. Select your deployment model (Enterprise/PLG)

## Step 2: Configure Basic Settings
- Set your product vision and goals
- Define key metrics to track
- Configure notification preferences

## Step 3: Set Up Team Access
- Invite team members
- Assign roles and permissions
- Configure approval workflows

## Step 4: Initial Configuration
- Create your first roadmap milestone
- Set up feedback collection
- Configure integrations

## Troubleshooting
If you encounter issues during setup, check our troubleshooting guide or contact support.`,
          category: 'getting-started',
          readTime: '8 min',
          popularity: 'high',
          lastUpdated: '2025-01-06',
          author: 'Setup Team'
        },
        {
          id: 'navigation',
          title: 'Platform Navigation Guide',
          description: 'Learn how to navigate through different sections of the platform effectively',
          content: `# Platform Navigation Guide

## Main Navigation
The platform is organized into several key sections:

### Dashboard
Your central hub showing:
- Key metrics overview
- Recent activity
- Quick actions
- Team updates

### Strategy
Strategic planning tools:
- OKR management
- Strategic initiatives
- Portfolio oversight
- Executive reporting

### Roadmap
Product roadmap management:
- Timeline views
- Feature planning
- Release management
- Stakeholder communication

### Sprint Board
Agile development tools:
- Sprint planning
- Task management
- Team collaboration
- Progress tracking

### Customer Board
Customer feedback management:
- Feedback collection
- Feature requests
- Customer insights
- Communication tools

## Tips for Efficient Navigation
- Use the global search to quickly find content
- Bookmark frequently used pages
- Customize your dashboard widgets
- Use keyboard shortcuts for common actions`,
          category: 'getting-started',
          readTime: '6 min',
          popularity: 'medium',
          lastUpdated: '2025-01-05',
          author: 'UX Team'
        }
      ]
    },
    {
      id: 'feedback-roadmaps',
      title: 'Feedback & Roadmaps',
      description: 'Set up your Feedback Portal & Roadmaps to collect feedback and show users what you\'re working on.',
      icon: Map,
      color: 'text-purple-500',
      articleCount: 2,
      articles: [
        {
          id: 'feedback-capture',
          title: 'Multi-Channel Feedback Collection',
          description: 'Capturing feedback from public boards, in-app widgets, support tickets, and CRM systems',
          content: `# Multi-Channel Feedback Collection

## Overview
Our platform supports collecting feedback from multiple channels to ensure you capture all customer input.

## Supported Channels

### 1. Public Feedback Boards
- Customer-facing portal
- Voting and commenting
- Public roadmap visibility
- Community engagement

### 2. In-App Widgets
- Contextual feedback collection
- Feature-specific feedback
- Real-time user sentiment
- Minimal disruption to UX

### 3. Support Tickets
- Automatic classification
- Priority scoring
- Integration with support tools
- Feedback loop closure

### 4. CRM Integration
- Customer success feedback
- Account-based insights
- Revenue impact analysis
- Strategic customer input

## Setting Up Collection Channels
1. Configure each channel in Settings
2. Set up automated rules
3. Define feedback categories
4. Test the collection flow

## Best Practices
- Use consistent categorization
- Respond to feedback promptly
- Close the feedback loop
- Analyze trends regularly`,
          category: 'feedback-roadmaps',
          readTime: '11 min',
          popularity: 'high',
          lastUpdated: '2025-01-07',
          author: 'Feedback Team'
        },
        {
          id: 'roadmap-planning',
          title: 'Strategic Roadmap Planning',
          description: 'Learn how to create and maintain strategic roadmaps that align with business objectives',
          content: `# Strategic Roadmap Planning

## Roadmap Types
We support different roadmap views:

### Strategic Roadmap (R&D)
- High-level initiatives
- Outcome-focused
- Long-term vision
- Stakeholder communication

### Delivery Roadmap
- Feature-specific
- Timeline-focused
- Development-oriented
- Detailed planning

## Creating Your Roadmap
1. Define strategic themes
2. Set timeline horizons
3. Add initiatives and features
4. Link to OKRs and metrics

## Best Practices
- Keep strategic roadmaps outcome-focused
- Update regularly based on feedback
- Maintain clear communication
- Balance detail with clarity

## Roadmap Governance
- Regular review cycles
- Stakeholder input sessions
- Impact assessment
- Pivot decision criteria`,
          category: 'feedback-roadmaps',
          readTime: '9 min',
          popularity: 'high',
          lastUpdated: '2025-01-06',
          author: 'Strategy Team'
        }
      ]
    },
    {
      id: 'ai-platform',
      title: 'AI & Automation',
      description: 'Leverage AI-powered features for intelligent product management and automation.',
      icon: Sparkles,
      color: 'text-emerald-500',
      articleCount: 1,
      articles: [
        {
          id: 'ai-copilot',
          title: 'AI CoPilot Overview',
          description: 'How AI assists in drafting documentation, summarizing content, and providing insights',
          content: `# AI CoPilot Overview

## What is AI CoPilot?
AI CoPilot is your intelligent assistant for product management tasks, helping you work more efficiently and make better decisions.

## Key Capabilities

### Content Generation
- Draft PRDs and documentation
- Generate feature descriptions
- Create user stories
- Write release notes

### Analysis & Insights
- Sentiment analysis of feedback
- Pattern detection in user behavior
- Trend identification
- Impact prediction

### Automation
- Feedback categorization
- Priority scoring
- Content summarization
- Report generation

## How to Use AI CoPilot
1. Access through the AI assistant panel
2. Type your request in natural language
3. Review and refine suggestions
4. Apply to your work

## Best Practices
- Be specific in your requests
- Review AI suggestions carefully
- Provide context for better results
- Use AI as a starting point, not final answer

## Privacy & Security
- All data is processed securely
- No sensitive information is stored
- Compliant with data protection regulations
- User control over AI features`,
          category: 'ai-platform',
          readTime: '7 min',
          popularity: 'high',
          lastUpdated: '2025-01-07',
          author: 'AI Team'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Insights',
      description: 'Learn how to customize your analytics dashboard, create reports, and analyze user behavior.',
      icon: BarChart3,
      color: 'text-indigo-500',
      articleCount: 0,
      articles: []
    },
    {
      id: 'strategy',
      title: 'Strategy & Planning',
      description: 'Learn to manage your strategy, OKRs and different ways of planning product development.',
      icon: Target,
      color: 'text-orange-500',
      articleCount: 0,
      articles: []
    },
    {
      id: 'enterprise',
      title: 'Enterprise Features',
      description: 'Learn how to set up, customize, and manage enterprise security and multi-product features.',
      icon: Shield,
      color: 'text-red-500',
      articleCount: 0,
      articles: []
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Learn how to manage your users, create segments, and define user roles.',
      icon: Users,
      color: 'text-pink-500',
      articleCount: 0,
      articles: []
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Learn to integrate with your favorite tools to help you get the most out of your product data.',
      icon: Settings,
      color: 'text-teal-500',
      articleCount: 0,
      articles: []
    }
  ]);

  const allArticles = categories.flatMap(cat => cat.articles);
  
  const filteredArticles = allArticles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedCategories = selectedCategory 
    ? categories.filter(cat => cat.id === selectedCategory)
    : categories;

  const popularArticles = allArticles
    .filter(article => article.popularity === 'high')
    .slice(0, 5);

  const handleAddArticle = () => {
    if (!newArticle.title || !newArticle.description || !newArticle.content) return;

    const article: Article = {
      id: `article-${Date.now()}`,
      title: newArticle.title,
      description: newArticle.description,
      content: newArticle.content,
      category: newArticle.category,
      readTime: `${Math.ceil(newArticle.content.length / 1000)} min`,
      popularity: 'medium',
      lastUpdated: new Date().toISOString().split('T')[0],
      author: 'User'
    };

    setCategories(prev => prev.map(cat => 
      cat.id === newArticle.category 
        ? { ...cat, articles: [...cat.articles, article], articleCount: cat.articleCount + 1 }
        : cat
    ));

    setNewArticle({ title: '', description: '', content: '', category: 'getting-started' });
    setIsAddingArticle(false);
  };

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setView('article');
  };

  const backToBrowse = () => {
    setView('browse');
    setSelectedArticle(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  if (view === 'article' && selectedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-4xl mx-auto p-6">
          {/* Article Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={backToBrowse}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Center
            </Button>
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2 capitalize">
                  {selectedArticle.category.replace('-', ' ')}
                </Badge>
                <h1 className="text-3xl font-bold mb-2">{selectedArticle.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">{selectedArticle.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedArticle.readTime}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {selectedArticle.popularity}
                  </div>
                  <span>By {selectedArticle.author}</span>
                  <span>Updated {selectedArticle.lastUpdated}</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Article Content */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none">
                {selectedArticle.content.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-8 mb-4 first:mt-0">{line.slice(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{line.slice(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-medium mt-4 mb-2">{line.slice(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4">{line.slice(2)}</li>;
                  } else if (line.match(/^\d+\. /)) {
                    return <li key={index} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                  } else if (line.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="mb-3">{line}</p>;
                  }
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-foreground">
              How can we help you?
            </h1>
            
            <Dialog open={isAddingArticle} onOpenChange={setIsAddingArticle}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Article</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={newArticle.title}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter article title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={newArticle.description}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the article"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={newArticle.category}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content (Markdown supported)</label>
                    <Textarea
                      value={newArticle.content}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your article content here. Use # for headers, - for lists..."
                      rows={8}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddingArticle(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddArticle}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Article
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get answers in seconds with our AI search or find them in our detailed articles.
          </p>
          
          {/* Search */}
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
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openArticle(article)}>
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
                          <span>By {article.author}</span>
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

        {/* Categories Grid */}
        {!searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Browse by Category</h2>
              {selectedCategory && (
                <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                  Show All Categories
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedCategories.map((category) => (
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
                      
                      {/* Articles */}
                      {category.articles.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {category.articles.slice(0, 3).map((article) => (
                            <div 
                              key={article.id} 
                              className="text-sm text-primary hover:underline cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                openArticle(article);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">{article.title}</span>
                                <span className="text-xs text-muted-foreground ml-2">{article.readTime}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Article count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {category.articleCount} articles
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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