import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Search, 
  Tag, 
  Heart, 
  MessageCircle, 
  ExternalLink,
  TrendingUp,
  Clock,
  User,
  ArrowRight,
  Star,
  BookOpen,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface KnowledgeArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: number;
  views: number;
  helpful: number;
  comments: number;
  rating: number;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  articleCount: number;
}

interface EnhancedKnowledgeBaseProps {
  boardId: string;
  className?: string;
}

export const EnhancedKnowledgeBase: React.FC<EnhancedKnowledgeBaseProps> = ({
  boardId,
  className
}) => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'Getting Started',
        description: 'Basic setup and onboarding guides',
        icon: '🚀',
        color: 'bg-blue-100 text-blue-900',
        articleCount: 12
      },
      {
        id: '2',
        name: 'Features',
        description: 'Detailed feature documentation',
        icon: '⚡',
        color: 'bg-purple-100 text-purple-900',
        articleCount: 18
      },
      {
        id: '3',
        name: 'Troubleshooting',
        description: 'Common issues and solutions',
        icon: '🔧',
        color: 'bg-orange-100 text-orange-900',
        articleCount: 24
      },
      {
        id: '4',
        name: 'API & Integrations',
        description: 'Technical documentation',
        icon: '🔌',
        color: 'bg-green-100 text-green-900',
        articleCount: 15
      },
      {
        id: '5',
        name: 'Best Practices',
        description: 'Tips and recommendations',
        icon: '💡',
        color: 'bg-yellow-100 text-yellow-900',
        articleCount: 9
      }
    ];

    const mockArticles: KnowledgeArticle[] = [
      {
        id: '1',
        title: 'Getting Started with Customer Feedback Management',
        excerpt: 'Learn how to set up your feedback board and start collecting valuable customer insights.',
        content: 'Full article content here...',
        category: 'Getting Started',
        tags: ['setup', 'feedback', 'onboarding'],
        author: { name: 'Sarah Johnson', avatar: undefined },
        publishedAt: '2024-01-15',
        readTime: 5,
        views: 1247,
        helpful: 89,
        comments: 12,
        rating: 4.8,
        featured: true
      },
      {
        id: '2',
        title: 'Advanced Filtering and Search Techniques',
        excerpt: 'Master the art of finding exactly what you need with powerful search and filtering options.',
        content: 'Full article content here...',
        category: 'Features',
        tags: ['search', 'filters', 'advanced'],
        author: { name: 'Mike Chen', avatar: undefined },
        publishedAt: '2024-01-12',
        readTime: 8,
        views: 892,
        helpful: 67,
        comments: 8,
        rating: 4.6,
        featured: true
      },
      {
        id: '3',
        title: 'Troubleshooting Common Login Issues',
        excerpt: 'Step-by-step solutions for the most common authentication and login problems.',
        content: 'Full article content here...',
        category: 'Troubleshooting',
        tags: ['login', 'authentication', 'troubleshooting'],
        author: { name: 'Alex Rivera', avatar: undefined },
        publishedAt: '2024-01-10',
        readTime: 6,
        views: 1543,
        helpful: 134,
        comments: 23,
        rating: 4.9,
        featured: false
      },
      {
        id: '4',
        title: 'API Integration Best Practices',
        excerpt: 'Learn how to integrate our API into your workflow with proven best practices and examples.',
        content: 'Full article content here...',
        category: 'API & Integrations',
        tags: ['api', 'integration', 'webhooks'],
        author: { name: 'Emma Thompson', avatar: undefined },
        publishedAt: '2024-01-08',
        readTime: 12,
        views: 756,
        helpful: 45,
        comments: 15,
        rating: 4.7,
        featured: false
      },
      {
        id: '5',
        title: 'Maximizing User Engagement Through Feedback',
        excerpt: 'Proven strategies to increase user participation and get more valuable feedback.',
        content: 'Full article content here...',
        category: 'Best Practices',
        tags: ['engagement', 'strategy', 'users'],
        author: { name: 'David Park', avatar: undefined },
        publishedAt: '2024-01-05',
        readTime: 10,
        views: 2156,
        helpful: 178,
        comments: 31,
        rating: 4.8,
        featured: true
      }
    ];

    setCategories(mockCategories);
    setArticles(mockArticles);
    setIsLoading(false);
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = articles.filter(article => article.featured);
  const popularArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 animate-pulse" />
            <CardTitle>Knowledge Base</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              <CardTitle>Knowledge Base</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <CardDescription>
            Find answers, guides, and documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles, guides, and FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map(category => (
                  <Card 
                    key={category.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedCategory === category.name ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.name ? null : category.name
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <span className="text-lg">{category.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {category.articleCount}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Articles */}
              {selectedCategory && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {selectedCategory} Articles ({filteredArticles.length})
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Clear filter
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {filteredArticles.map(article => (
                      <Card key={article.id} className="hover:bg-muted/50 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium hover:text-primary">
                                  {article.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {article.excerpt}
                                </p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  {article.readTime} min read
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3 text-muted-foreground" />
                                  {article.helpful}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3 text-muted-foreground" />
                                  {article.comments}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <span>{article.rating}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={article.author.avatar} />
                                  <AvatarFallback>
                                    {article.author.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {article.author.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {article.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured" className="space-y-4">
              <div className="space-y-3">
                {featuredArticles.map(article => (
                  <Card key={article.id} className="hover:bg-muted/50 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Star className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{article.readTime} min read</span>
                            <span>{article.views} views</span>
                            <span>{article.helpful} helpful</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="space-y-4">
              <div className="space-y-3">
                {popularArticles.map((article, index) => (
                  <Card key={article.id} className="hover:bg-muted/50 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {article.views} views
                            </div>
                            <span>{article.readTime} min read</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};