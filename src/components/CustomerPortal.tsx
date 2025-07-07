import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Map,
  Megaphone,
  MessageSquare,
  Star,
  Calendar,
  TrendingUp,
  FileText,
  ExternalLink,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  branding_config: any;
}

interface CustomerBoard {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_public: boolean;
  features_enabled: any;
  branding_config: any;
  organization: Organization;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  read_time: number;
  views_count: number;
  category?: { name: string };
}

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimated_date?: string;
  upvotes_count: number;
}

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  version?: string;
  type: string;
  published_at: string;
}

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  upvotes_count: number;
  category?: string;
}

const CustomerPortal = () => {
  const { organizationSlug, boardSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [board, setBoard] = useState<CustomerBoard | null>(null);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('knowledge');

  useEffect(() => {
    loadBoardData();
  }, [organizationSlug, boardSlug]);

  const loadBoardData = async () => {
    try {
      setLoading(true);

      // Load board info
      const { data: boardData, error: boardError } = await supabase
        .from('customer_boards')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('slug', boardSlug || 'main')
        .eq('organizations.slug', organizationSlug)
        .single();

      if (boardError || !boardData) {
        navigate('/404');
        return;
      }

      setBoard(boardData);

      // Load content in parallel
      const [articlesData, roadmapData, changelogData, feedbackData] = await Promise.all([
        loadArticles(boardData.organization.id, boardData.id),
        loadRoadmap(boardData.organization.id, boardData.id),
        loadChangelog(boardData.organization.id, boardData.id),
        loadFeedback(boardData.organization.id, boardData.id)
      ]);

      setArticles(articlesData);
      setRoadmapItems(roadmapData);
      setChangelog(changelogData);
      setFeedback(feedbackData);

    } catch (error) {
      console.error('Error loading board:', error);
      toast({
        title: "Error",
        description: "Failed to load customer portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async (orgId: string, boardId: string) => {
    const { data, error } = await supabase
      .from('help_articles')
      .select(`
        id, title, description, read_time, views_count,
        category:help_categories(name)
      `)
      .or(`organization_id.eq.${orgId},organization_id.is.null`)
      .eq('is_published', true)
      .order('views_count', { ascending: false })
      .limit(6);

    if (error) throw error;
    return data || [];
  };

  const loadRoadmap = async (orgId: string, boardId: string) => {
    const { data, error } = await supabase
      .from('roadmap_items')
      .select('*')
      .or(`organization_id.eq.${orgId},organization_id.is.null`)
      .order('sort_order')
      .limit(10);

    if (error) throw error;
    return data || [];
  };

  const loadChangelog = async (orgId: string, boardId: string) => {
    const { data, error } = await supabase
      .from('changelog_entries')
      .select('*')
      .or(`organization_id.eq.${orgId},organization_id.is.null`)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data || [];
  };

  const loadFeedback = async (orgId: string, boardId: string) => {
    const { data, error } = await supabase
      .from('feedback_items')
      .select('*')
      .eq('organization_id', orgId)
      .order('upvotes_count', { ascending: false })
      .limit(8);

    if (error) throw error;
    return data || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'bugfix': return 'bg-red-100 text-red-800';
      case 'breaking': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading customer portal...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Portal Not Found</h2>
            <p className="text-muted-foreground">The requested customer portal could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {board.organization.logo_url && (
                <img 
                  src={board.organization.logo_url} 
                  alt={board.organization.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold">{board.organization.name}</h1>
                <p className="text-lg text-muted-foreground">{board.description}</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="/auth" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Access Portal
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="knowledge" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Knowledge Center</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center space-x-2">
              <Map className="h-4 w-4" />
              <span>Roadmap</span>
            </TabsTrigger>
            <TabsTrigger value="changelog" className="flex items-center space-x-2">
              <Megaphone className="h-4 w-4" />
              <span>Changelog</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </TabsTrigger>
          </TabsList>

          {/* Knowledge Center Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Knowledge Center</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-80"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{article.category?.name}</span>
                      <div className="flex items-center space-x-3">
                        <span>{article.read_time} min read</span>
                        <span>{article.views_count} views</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Product Roadmap</h2>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="space-y-4">
              {roadmapItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <Badge variant="secondary" className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {item.estimated_date && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(item.estimated_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{item.upvotes_count} votes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Changelog Tab */}
          <TabsContent value="changelog" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">What's New</h2>
            </div>

            <div className="space-y-4">
              {changelog.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{entry.title}</h3>
                        {entry.version && (
                          <Badge variant="outline">{entry.version}</Badge>
                        )}
                        <Badge variant="secondary" className={getTypeColor(entry.type)}>
                          {entry.type}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{entry.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Feature Requests & Feedback</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedback.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold flex-1">{item.title}</h3>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span>{item.upvotes_count}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                        {item.category && (
                          <Badge variant="outline">{item.category}</Badge>
                        )}
                      </div>
                      <Badge variant="outline">{item.priority}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerPortal;