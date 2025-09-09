import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  BookOpen, 
  Plus,
  Eye,
  Clock,
  Star,
  ArrowLeft,
  ExternalLink,
  Filter,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  isBoard: boolean;
  boardId?: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  articleCount: number;
  boardArticleCount?: number;
  articles: Article[];
}

interface BoardKnowledgeCenterProps {
  boardId?: string;
  boardName?: string;
  showBoardSpecific?: boolean;
  className?: string;
}

export const BoardKnowledgeCenter: React.FC<BoardKnowledgeCenterProps> = ({
  boardId,
  boardName,
  showBoardSpecific = false,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [view, setView] = useState<'browse' | 'article'>('browse');
  const [contentFilter, setContentFilter] = useState<'all' | 'board' | 'general'>('all');
  const [loading, setLoading] = useState(true);

  // Mock data with board-specific articles
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadKnowledgeContent();
  }, [boardId]);

  const loadKnowledgeContent = async () => {
    setLoading(true);
    
    // Mock data - in real app, fetch from Supabase
    const mockCategories: Category[] = [
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Essential guides for new users',
        icon: BookOpen,
        color: 'text-blue-600',
        articleCount: 4,
        boardArticleCount: boardId ? 2 : 0,
        articles: [
          {
            id: 'welcome-general',
            title: 'Platform Overview',
            description: 'General platform introduction and navigation',
            content: '# Platform Overview\n\nWelcome to our unified product management platform...',
            category: 'getting-started',
            readTime: '5 min',
            popularity: 'high' as 'high' | 'medium' | 'low',
            lastUpdated: '2025-01-07',
            author: 'Platform Team',
            isBoard: false
          },
          ...(boardId ? [{
            id: `board-welcome-${boardId}`,
            title: `Getting Started with ${boardName || 'Your Board'}`,
            description: 'Board-specific setup and features guide',
            content: `# Getting Started with ${boardName}\n\nThis guide covers the specific features and setup for your board...`,
            category: 'getting-started',
            readTime: '7 min',
            popularity: 'high' as 'high' | 'medium' | 'low',
            lastUpdated: '2025-01-07',
            author: 'Board Admin',
            isBoard: true,
            boardId
          }, {
            id: `board-features-${boardId}`,
            title: `${boardName || 'Board'} Feature Guide`,
            description: 'Learn about the unique features available in this board',
            content: `# ${boardName} Features\n\nYour board has been configured with these specific capabilities...`,
            category: 'getting-started',
            readTime: '10 min',
            popularity: 'medium' as 'high' | 'medium' | 'low',
            lastUpdated: '2025-01-06',
            author: 'Board Admin',
            isBoard: true,
            boardId
          }] : [])
        ]
      },
      {
        id: 'feedback-management',
        title: 'Feedback & Requests',
        description: 'How to submit and manage feedback',
        icon: Users,
        color: 'text-purple-600',
        articleCount: 3,
        boardArticleCount: boardId ? 1 : 0,
        articles: [
          {
            id: 'feedback-general',
            title: 'How to Submit Effective Feedback',
            description: 'Best practices for submitting actionable feedback',
            content: '# Submitting Effective Feedback\n\nLearn how to write feedback that gets results...',
            category: 'feedback-management',
            readTime: '6 min',
            popularity: 'high',
            lastUpdated: '2025-01-07',
            author: 'Community Team',
            isBoard: false
          },
          ...(boardId ? [{
            id: `board-feedback-${boardId}`,
            title: `${boardName || 'Board'} Feedback Guidelines`,
            description: 'Specific guidelines and processes for this board',
            content: `# ${boardName} Feedback Guidelines\n\nThis board has specific processes for handling feedback...`,
            category: 'feedback-management',
            readTime: '8 min',
            popularity: 'medium' as const,
            lastUpdated: '2025-01-06',
            author: 'Board Moderator',
            isBoard: true,
            boardId
          }] : [])
        ]
      },
      {
        id: 'roadmap-planning',
        title: 'Roadmap & Planning',
        description: 'Understanding roadmaps and feature planning',
        icon: Star,
        color: 'text-orange-600',
        articleCount: 2,
        boardArticleCount: 0,
        articles: [
          {
            id: 'roadmap-general',
            title: 'Understanding Product Roadmaps',
            description: 'How to read and interpret roadmap information',
            content: '# Understanding Product Roadmaps\n\nRoadmaps show the planned direction...',
            category: 'roadmap-planning',
            readTime: '9 min',
            popularity: 'medium',
            lastUpdated: '2025-01-05',
            author: 'Product Team',
            isBoard: false
          }
        ]
      }
    ];

    setCategories(mockCategories);
    setLoading(false);
  };

  const allArticles = categories.flatMap(cat => cat.articles);
  
  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContent = contentFilter === 'all' || 
                          (contentFilter === 'board' && article.isBoard) ||
                          (contentFilter === 'general' && !article.isBoard);
    return matchesSearch && matchesContent;
  });

  const displayedCategories = selectedCategory 
    ? categories.filter(cat => cat.id === selectedCategory)
    : categories.filter(cat => 
        contentFilter === 'all' || 
        (contentFilter === 'board' && cat.boardArticleCount && cat.boardArticleCount > 0) ||
        (contentFilter === 'general' && cat.articles.some(a => !a.isBoard))
      );

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
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={backToBrowse}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Center
          </Button>
          
          {selectedArticle.isBoard && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Board Specific
            </Badge>
          )}
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge variant="outline" className="mb-3 capitalize">
                  {selectedArticle.category.replace('-', ' ')}
                </Badge>
                <CardTitle className="text-2xl font-bold mb-3">
                  {selectedArticle.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {selectedArticle.description}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedArticle.readTime}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Updated {selectedArticle.lastUpdated}
              </div>
              <div>
                By {selectedArticle.author}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose prose-lg max-w-none">
              {selectedArticle.content.split('\n').map((line, index) => (
                <div key={index}>
                  {line.startsWith('# ') ? (
                    <h1 className="text-2xl font-bold mb-4 mt-6">{line.slice(2)}</h1>
                  ) : line.startsWith('## ') ? (
                    <h2 className="text-xl font-semibold mb-3 mt-5">{line.slice(3)}</h2>
                  ) : line.startsWith('### ') ? (
                    <h3 className="text-lg font-medium mb-2 mt-4">{line.slice(4)}</h3>
                  ) : line.startsWith('- ') ? (
                    <li className="ml-4 mb-1">{line.slice(2)}</li>
                  ) : line.trim() ? (
                    <p className="mb-4 leading-relaxed">{line}</p>
                  ) : (
                    <br />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {showBoardSpecific && boardName 
                ? `${boardName} Knowledge Center` 
                : 'Knowledge Center'
              }
            </h1>
            <p className="text-muted-foreground">
              {showBoardSpecific 
                ? 'Board-specific guides and general help articles'
                : 'Find answers to your questions and learn how to use the platform'
              }
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {boardId && (
            <div className="flex gap-2">
              <Button
                variant={contentFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentFilter('all')}
              >
                All Content
              </Button>
              <Button
                variant={contentFilter === 'board' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentFilter('board')}
                className="flex items-center gap-1"
              >
                <Users className="h-3 w-3" />
                Board Specific
              </Button>
              <Button
                variant={contentFilter === 'general' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentFilter('general')}
              >
                General
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Search Results ({filteredArticles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredArticles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No articles found matching your search.
                </p>
              ) : (
                filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => openArticle(article)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{article.title}</h3>
                        {article.isBoard && (
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          Board
                        </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="capitalize">
                          {article.category.replace('-', ' ')}
                        </span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCategories.map((category) => {
            const Icon = category.icon;
            const relevantArticles = category.articles.filter(article => 
              contentFilter === 'all' || 
              (contentFilter === 'board' && article.isBoard) ||
              (contentFilter === 'general' && !article.isBoard)
            );

            if (relevantArticles.length === 0 && contentFilter !== 'all') {
              return null;
            }

            return (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-accent", category.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.title}</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        {category.description}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {relevantArticles.length} article{relevantArticles.length !== 1 ? 's' : ''}
                      </span>
                      {boardId && category.boardArticleCount && category.boardArticleCount > 0 && (
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {category.boardArticleCount} board-specific
                      </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {relevantArticles.slice(0, 3).map((article) => (
                        <div
                          key={article.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => openArticle(article)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium truncate">
                                {article.title}
                              </h4>
                              {article.isBoard && (
                              <Badge variant="secondary" className="flex-shrink-0">
                                <Users className="h-2 w-2 mr-1" />
                                Board
                              </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {article.readTime}
                            </p>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        </div>
                      ))}
                      
                      {relevantArticles.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          View all {relevantArticles.length} articles
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};