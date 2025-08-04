import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  BookOpen, 
  Plus,
  Star,
  Eye,
  Clock,
  User,
  Filter,
  SortAsc,
  Bookmark,
  Share,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { ArticleViewer } from './ArticleViewer';
import { ArticleEditor } from './ArticleEditor';
import { SmartSearch } from './SmartSearch';
import { ContentSuggestions } from './ContentSuggestions';
import { CommunityFeatures } from './CommunityFeatures';

interface KBCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  article_count?: number;
  created_at: string;
  updated_at: string;
}

interface KBArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category_id: string;
  author_id: string;
  read_time: number;
  is_featured: boolean;
  is_published: boolean;
  tags: string[];
  views_count: number;
  rating_average: number;
  rating_count: number;
  last_updated: string;
  created_at: string;
  category?: KBCategory;
  author?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const EnhancedKnowledgeCenter = () => {
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [view, setView] = useState<'browse' | 'article' | 'edit' | 'create'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'recent' | 'rating'>('relevance');
  const [filterBy, setFilterBy] = useState<'all' | 'featured' | 'popular'>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadCategories(), loadArticles()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge center data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Use fallback data since KB tables don't exist yet
      throw new Error('Using fallback data');
    } catch (error) {
      // Fallback to static data if KB tables don't exist yet
      console.log('Using fallback categories');
      setCategories([
        {
          id: 'getting-started',
          name: 'Getting Started',
          description: 'Essential guides to get you up and running',
          icon: 'BookOpen',
          color: 'blue',
          sort_order: 1,
          article_count: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'features',
          name: 'Features',
          description: 'Detailed feature documentation and tutorials',
          icon: 'Star',
          color: 'purple',
          sort_order: 2,
          article_count: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'integrations',
          name: 'Integrations',
          description: 'Connect with your favorite tools',
          icon: 'Lightbulb',
          color: 'green',
          sort_order: 3,
          article_count: 8,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    }
  };

  const loadArticles = async () => {
    try {
      // Use fallback data since KB tables don't exist yet
      throw new Error('Using fallback data');
    } catch (error) {
      // Fallback to static data
      console.log('Using fallback articles');
      setArticles([]);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadArticles();
      return;
    }

    try {
      // Fallback search implementation
      const filtered = articles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description?.toLowerCase().includes(query.toLowerCase())
      );
      setArticles(filtered);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleViewArticle = async (article: KBArticle) => {
    setSelectedArticle(article);
    setView('article');
    
    // Track article view locally for now
    setArticles(prev => prev.map(a => 
      a.id === article.id 
        ? { ...a, views_count: a.views_count + 1 }
        : a
    ));
  };

  const handleCreateArticle = () => {
    setView('create');
    setSelectedArticle(null);
  };

  const handleEditArticle = (article: KBArticle) => {
    setSelectedArticle(article);
    setView('edit');
  };

  const filteredArticles = articles.filter(article => {
    if (selectedCategory && article.category_id !== selectedCategory) return false;
    
    switch (filterBy) {
      case 'featured':
        return article.is_featured;
      case 'popular':
        return article.views_count > 100;
      default:
        return true;
    }
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.views_count - a.views_count;
      case 'recent':
        return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      case 'rating':
        return b.rating_average - a.rating_average;
      default:
        return 0; // relevance handled by search
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (view === 'article' && selectedArticle) {
    return (
      <ArticleViewer 
        article={selectedArticle}
        onBack={() => setView('browse')}
        onEdit={() => handleEditArticle(selectedArticle)}
      />
    );
  }

  if (view === 'edit' || view === 'create') {
    return (
      <ArticleEditor
        article={view === 'edit' ? selectedArticle : null}
        categories={categories}
        onSave={() => {
          setView('browse');
          loadArticles();
        }}
        onCancel={() => setView('browse')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Knowledge Center</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers, learn best practices, and get the most out of our platform
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <SmartSearch 
              onSearch={handleSearch}
              placeholder="Search articles, features, and guides..."
              suggestions={categories.map(cat => ({ id: cat.id, title: cat.name, type: 'category' }))}
            />
            
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2" />
                      Relevance
                    </div>
                  </SelectItem>
                  <SelectItem value="popularity">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Popularity
                    </div>
                  </SelectItem>
                  <SelectItem value="recent">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Rating
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Articles</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleCreateArticle} className="ml-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="browse" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-8">
            {searchQuery ? (
              // Search Results
              <div>
                <h2 className="text-2xl font-semibold mb-6">
                  Search Results for "{searchQuery}"
                </h2>
                <div className="grid gap-6">
                  {sortedArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleViewArticle(article)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{article.category?.name}</Badge>
                              {article.is_featured && <Badge variant="default">Featured</Badge>}
                            </div>
                            <CardTitle className="text-xl">{article.title}</CardTitle>
                            <p className="text-muted-foreground mt-2">{article.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {article.views_count}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {article.read_time} min read
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {article.rating_average.toFixed(1)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {article.author?.first_name} {article.author?.last_name}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              // Category Browse
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Browse by Category</h2>
                  {selectedCategory && (
                    <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                      Show All Categories
                    </Button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <Card key={category.id} 
                          className={`hover:shadow-md transition-shadow cursor-pointer ${
                            selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedCategory(category.id)}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-lg bg-${category.color}-100 text-${category.color}-600`}>
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <Badge variant="secondary">{category.article_count || 0} articles</Badge>
                        </div>
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <p className="text-muted-foreground">{category.description}</p>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                {selectedCategory && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">
                      Articles in {categories.find(c => c.id === selectedCategory)?.name}
                    </h3>
                    <div className="grid gap-4">
                      {sortedArticles.map((article) => (
                        <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleViewArticle(article)}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg mb-2">{article.title}</h4>
                                <p className="text-muted-foreground mb-3">{article.description}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {article.read_time} min
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {article.views_count}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4" />
                                    {article.rating_average.toFixed(1)}
                                  </div>
                                </div>
                              </div>
                              {article.is_featured && (
                                <Badge variant="default">Featured</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="mt-8">
            <h2 className="text-2xl font-semibold mb-6">Popular Articles</h2>
            <div className="grid gap-4">
              {articles
                .sort((a, b) => b.views_count - a.views_count)
                .slice(0, 10)
                .map((article, index) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewArticle(article)}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{article.title}</h4>
                          <p className="text-muted-foreground mb-3">{article.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="secondary">{article.category?.name}</Badge>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {article.views_count} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {article.rating_average.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-8">
            <ContentSuggestions 
              articles={articles}
              onCreateFromSuggestion={handleCreateArticle}
            />
          </TabsContent>

          <TabsContent value="community" className="mt-8">
            <CommunityFeatures 
              articles={articles}
              onViewArticle={handleViewArticle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};