import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Send,
  ExternalLink,
  Home,
  Map,
  Sparkles,
  BarChart3,
  Target,
  Shield,
  Users,
  Settings,
  Eye
} from 'lucide-react';

// Icon mapping for dynamic icons
const iconMap = {
  Home,
  Map,
  Sparkles,
  BarChart3,
  Target,
  Shield,
  Users,
  Settings
};

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  article_count?: number;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category_id: string;
  author_id: string;
  read_time: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  category?: {
    name: string;
  };
}

const HelpCenter = () => {
  const { categoryId, articleId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [currentArticle, setCurrentArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);

  // Load categories with article counts
  const loadCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('help_categories')
        .select(`
          *,
          help_articles(count)
        `)
        .eq('is_active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      const categoriesWithCounts = categoriesData?.map(cat => ({
        ...cat,
        article_count: cat.help_articles?.[0]?.count || 0
      })) || [];

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Load articles for a category
  const loadArticles = async (catId: string) => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select(`
          *,
          author:profiles(first_name, last_name, email),
          category:help_categories(name)
        `)
        .eq('category_id', catId)
        .eq('is_published', true)
        .order('sort_order');

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  // Load single article
  const loadArticle = async (artId: string) => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select(`
          *,
          author:profiles(first_name, last_name, email),
          category:help_categories(name)
        `)
        .eq('id', artId)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setCurrentArticle(data);

      // Increment view count
      await supabase.rpc('increment_article_views', { article_id: artId });
    } catch (error) {
      console.error('Error loading article:', error);
    }
  };

  // Search articles
  const searchArticles = async (query: string) => {
    if (!query.trim()) {
      setArticles([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select(`
          *,
          author:profiles(first_name, last_name, email),
          category:help_categories(name)
        `)
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .order('views_count', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error searching articles:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadCategories();
      
      if (articleId) {
        await loadArticle(articleId);
      } else if (categoryId) {
        await loadArticles(categoryId);
      }
      
      setLoading(false);
    };

    init();
  }, [categoryId, articleId]);

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchArticles(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredArticles = searchQuery ? articles : [];

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Home;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading help center...</p>
        </div>
      </div>
    );
  }

  // Article view
  if (currentArticle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-4xl mx-auto p-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/help')}
              className="p-0 h-auto font-normal"
            >
              Help Center
            </Button>
            <ArrowRight className="h-4 w-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/help/category/${currentArticle.category_id}`)}
              className="p-0 h-auto font-normal"
            >
              {currentArticle.category?.name}
            </Button>
            <ArrowRight className="h-4 w-4" />
            <span className="text-foreground">{currentArticle.title}</span>
          </div>

          {/* Article header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{currentArticle.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {currentArticle.author?.first_name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {currentArticle.author?.first_name} {currentArticle.author?.last_name}
                </span>
              </div>
              <span>•</span>
              <span>{currentArticle.read_time} min read</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{currentArticle.views_count} views</span>
              </div>
            </div>
          </div>

          {/* Article content */}
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentArticle.content }} />
          </div>

          {/* Back button */}
          <div className="mt-12 pt-8 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(`/help/category/${currentArticle.category_id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {currentArticle.category?.name}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Category articles view
  if (categoryId && articles.length > 0) {
    const category = categories.find(c => c.id === categoryId);
    
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-4xl mx-auto p-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/help')}
              className="p-0 h-auto font-normal"
            >
              Help Center
            </Button>
            <ArrowRight className="h-4 w-4" />
            <span className="text-foreground">{category?.name}</span>
          </div>

          {/* Category header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{category?.name}</h1>
            <p className="text-muted-foreground">{category?.description}</p>
          </div>

          {/* Articles list */}
          <div className="space-y-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/help/article/${article.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-3">{article.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{article.read_time} min read</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{article.views_count} views</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-4 flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main help center view
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            How can we help you?
          </h1>
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
                <Card
                  key={article.id}
                  className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/help/article/${article.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">{article.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="capitalize">
                          {article.category?.name}
                        </Badge>
                        <span>{article.read_time} min read</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-4 flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {!searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              
              return (
                <Card 
                  key={category.id} 
                  className="p-6 hover:shadow-lg transition-all cursor-pointer group border-border"
                  onClick={() => navigate(`/help/category/${category.id}`)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={cn("p-3 rounded-lg bg-gradient-to-br", category.color)}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      
                      {/* Article count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {category.article_count} articles
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer */}
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

export default HelpCenter;