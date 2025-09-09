import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  BookOpen, 
  Settings,
  Search,
  Filter,
  Link,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BoardContentManagerProps {
  className?: string;
}

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  categoryId: string;
  isPublished: boolean;
  isFeatured: boolean;
  visibility: 'general' | 'organization' | 'board';
  boardIds: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  status: 'draft' | 'review' | 'published' | 'archived';
}

interface Board {
  id: string;
  name: string;
  organizationId: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BoardContentManager: React.FC<BoardContentManagerProps> = ({ className }) => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state
  const [articleForm, setArticleForm] = useState({
    title: '',
    description: '',
    content: '',
    categoryId: '',
    visibility: 'general' as 'general' | 'organization' | 'board',
    boardIds: [] as string[],
    isFeatured: false,
    isPublished: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Mock data - in real app, fetch from Supabase
    setBoards([
      { id: '1', name: 'Product Feedback Board', organizationId: 'org1', isActive: true },
      { id: '2', name: 'Customer Support Portal', organizationId: 'org1', isActive: true },
      { id: '3', name: 'Beta Testing Board', organizationId: 'org1', isActive: true }
    ]);

    setCategories([
      { id: '1', name: 'Getting Started', description: 'Onboarding guides', icon: 'BookOpen', color: 'blue' },
      { id: '2', name: 'Feature Guides', description: 'How-to articles', icon: 'Settings', color: 'green' },
      { id: '3', name: 'Troubleshooting', description: 'Problem solving', icon: 'AlertCircle', color: 'orange' }
    ]);

    setArticles([
      {
        id: '1',
        title: 'Getting Started with Your Board',
        description: 'Learn the basics of using this feedback board',
        content: '# Getting Started\n\nWelcome to your board...',
        categoryId: '1',
        isPublished: true,
        isFeatured: false,
        visibility: 'board',
        boardIds: ['1'],
        authorId: 'user1',
        createdAt: '2025-01-07',
        updatedAt: '2025-01-07',
        viewCount: 45,
        status: 'published'
      },
      {
        id: '2',
        title: 'How to Submit Effective Feedback',
        description: 'Best practices for providing actionable feedback',
        content: '# Effective Feedback\n\nTo submit great feedback...',
        categoryId: '2',
        isPublished: true,
        isFeatured: true,
        visibility: 'general',
        boardIds: [],
        authorId: 'user1',
        createdAt: '2025-01-06',
        updatedAt: '2025-01-06',
        viewCount: 123,
        status: 'published'
      }
    ]);
  };

  const handleCreateArticle = async () => {
    if (!articleForm.title || !articleForm.categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      });
      return;
    }

    const newArticle: Article = {
      id: Date.now().toString(),
      ...articleForm,
      authorId: 'current-user',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      viewCount: 0,
      status: articleForm.isPublished ? 'published' : 'draft'
    };

    setArticles(prev => [...prev, newArticle]);
    setIsCreateDialogOpen(false);
    resetForm();
    
    toast({
      title: 'Success',
      description: 'Article created successfully'
    });
  };

  const handleBulkAssignBoards = async (articleIds: string[], boardIds: string[]) => {
    setArticles(prev => prev.map(article => 
      articleIds.includes(article.id)
        ? { ...article, boardIds: [...new Set([...article.boardIds, ...boardIds])] }
        : article
    ));

    toast({
      title: 'Success',
      description: `Articles assigned to ${boardIds.length} board(s)`
    });
  };

  const resetForm = () => {
    setArticleForm({
      title: '',
      description: '',
      content: '',
      categoryId: '',
      visibility: 'general',
      boardIds: [],
      isFeatured: false,
      isPublished: false
    });
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBoard = selectedBoard === 'all' || 
                        article.boardIds.includes(selectedBoard) ||
                        (selectedBoard === 'unassigned' && article.boardIds.length === 0);
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;

    return matchesSearch && matchesBoard && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: Clock },
      review: { variant: 'outline' as const, icon: Eye },
      published: { variant: 'default' as const, icon: CheckCircle },
      archived: { variant: 'destructive' as const, icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage knowledge base articles and board-specific content
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Article</DialogTitle>
              <DialogDescription>
                Create a new knowledge base article that can be shared across boards
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="Article title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={articleForm.categoryId}
                    onValueChange={(value) => setArticleForm({ ...articleForm, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={articleForm.description}
                  onChange={(e) => setArticleForm({ ...articleForm, description: e.target.value })}
                  placeholder="Brief description of the article"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Article content (Markdown supported)"
                  rows={10}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={articleForm.visibility}
                    onValueChange={(value: 'general' | 'organization' | 'board') => 
                      setArticleForm({ ...articleForm, visibility: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General (All users)</SelectItem>
                      <SelectItem value="organization">Organization only</SelectItem>
                      <SelectItem value="board">Specific boards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {articleForm.visibility === 'board' && (
                  <div>
                    <Label>Assign to Boards</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                      {boards.map((board) => (
                        <div key={board.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`board-${board.id}`}
                            checked={articleForm.boardIds.includes(board.id)}
                            onChange={(e) => {
                              const boardIds = e.target.checked
                                ? [...articleForm.boardIds, board.id]
                                : articleForm.boardIds.filter(id => id !== board.id);
                              setArticleForm({ ...articleForm, boardIds });
                            }}
                          />
                          <Label htmlFor={`board-${board.id}`} className="text-sm">
                            {board.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={articleForm.isFeatured}
                    onCheckedChange={(checked) => setArticleForm({ ...articleForm, isFeatured: checked })}
                  />
                  <Label htmlFor="featured">Featured article</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={articleForm.isPublished}
                    onCheckedChange={(checked) => setArticleForm({ ...articleForm, isPublished: checked })}
                  />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateArticle} disabled={!articleForm.title || !articleForm.categoryId}>
                Create Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All boards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Boards</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {boards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Articles ({filteredArticles.length})</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first article to get started.'}
                </p>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{article.title}</h3>
                        {getStatusBadge(article.status)}
                        {article.isFeatured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                        {article.boardIds.length > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {article.boardIds.length} board(s)
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {article.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{article.viewCount} views</span>
                        <span>Updated {article.updatedAt}</span>
                        <span className="capitalize">{article.visibility}</span>
                      </div>

                      {article.boardIds.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Assigned to:</div>
                          <div className="flex flex-wrap gap-1">
                            {article.boardIds.map((boardId) => {
                              const board = boards.find(b => b.id === boardId);
                              return board ? (
                                <Badge key={boardId} variant="outline" className="text-xs">
                                  {board.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};