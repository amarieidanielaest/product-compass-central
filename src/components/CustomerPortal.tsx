import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  ChevronRight,
  Home,
  Settings,
  Eye,
  Clock,
  User,
  ArrowUp,
  MessageCircle,
  BarChart3,
  Building,
  ChevronDown,
  Users,
  Circle
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
  const [availableBoards, setAvailableBoards] = useState<{ id: string; name: string; slug: string; is_public: boolean; }[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

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

      // Load all boards for this organization
      const { data: boardsData } = await supabase
        .from('customer_boards')
        .select('*')
        .eq('organization_id', boardData.organization.id)
        .eq('is_active', true)
        .order('name');

      setAvailableBoards(boardsData || []);

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
      .limit(20);

    if (error) throw error;
    return data || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-muted/50 border-r flex flex-col">
        {/* Portal Header */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3 mb-4">
            {board.organization.logo_url && (
              <img 
                src={board.organization.logo_url} 
                alt={board.organization.name}
                className="h-8 w-8 rounded object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-sm">{board.organization.name}</h3>
              <p className="text-xs text-muted-foreground">{board.name}</p>
            </div>
          </div>
          
          {/* Admin Access */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to="/">
                <Home className="h-3 w-3 mr-1" />
                Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/organizations">
                <Settings className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'feedback' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Send Feedback</span>
              <ChevronDown className="h-3 w-3 ml-auto" />
            </button>
            
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'roadmap' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Roadmap</span>
              <ChevronDown className="h-3 w-3 ml-auto" />
            </button>

            <button
              onClick={() => setActiveTab('changelog')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'changelog' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Megaphone className="h-4 w-4" />
              <span>Changelog</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'knowledge' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Knowledge Center</span>
            </button>
          </nav>

          {/* Boards Section */}
          {availableBoards.length > 1 && (
            <div className="mt-6">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Boards
              </h4>
              <div className="space-y-1">
                {availableBoards.map((availableBoard) => (
                  <Link
                    key={availableBoard.id}
                    to={`/portal/${organizationSlug}/${availableBoard.slug}`}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      availableBoard.id === board.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Building className="h-3 w-3" />
                      <span>{availableBoard.name}</span>
                      {availableBoard.is_public && (
                        <Eye className="h-3 w-3 ml-auto" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Quick Filters
            </h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                <span>All posts</span>
                <span className="text-xs">{feedback.length}</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                <span>In Review</span>
                <span className="text-xs">{feedback.filter(f => f.status === 'under_review').length}</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                <span>Planned</span>
                <span className="text-xs">{feedback.filter(f => f.status === 'planned').length}</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                <span>In Progress</span>
                <span className="text-xs">{feedback.filter(f => f.status === 'in_progress').length}</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                <span>Completed</span>
                <span className="text-xs">{feedback.filter(f => f.status === 'completed').length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">
                  {activeTab === 'feedback' && 'Feedback'}
                  {activeTab === 'roadmap' && 'Roadmap'}
                  {activeTab === 'changelog' && 'Changelog'}
                  {activeTab === 'knowledge' && 'Knowledge Center'}
                </h1>
              </div>
              
              {activeTab === 'feedback' && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Posts ({filteredFeedback.length})</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {activeTab === 'feedback' && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search feedback..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">New</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'feedback' && (
            <div className="p-6">
              {/* Featured Message */}
              <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Have something to say?</h3>
                  <p className="text-muted-foreground mb-4">
                    Tell us how we can make the product more useful to you.
                  </p>
                  <Button variant="outline" className="border-primary/20">
                    <Plus className="h-4 w-4 mr-2" />
                    Edit Message
                  </Button>
                </CardContent>
              </Card>

              {/* Feedback Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">
                  <Circle className="h-3 w-3 mr-2 fill-current" />
                  New
                </Button>
                <Button variant="ghost" size="sm">
                  <TrendingUp className="h-3 w-3 mr-2" />
                  Top
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="h-3 w-3 mr-2" />
                  Trending
                </Button>
              </div>

              {/* Feedback List */}
              <div className="space-y-4">
                {filteredFeedback.map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <ArrowUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{item.upvotes_count}</span>
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                          </div>
                          <p className="text-muted-foreground mb-3 text-sm">{item.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Customer User</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">About 1 hour ago</span>
                            </div>
                            <Badge variant="outline" className={getStatusColor(item.status)}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                            {item.priority && (
                              <span className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            )}
                            <span className="text-muted-foreground">{board.organization.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <MessageCircle className="h-3 w-3" />
                            <span>0</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>1</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other tab contents remain the same but in this layout */}
          {activeTab === 'roadmap' && (
            <div className="p-6">
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
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="p-6">
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
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="p-6">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;