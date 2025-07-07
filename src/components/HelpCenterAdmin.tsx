import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  FileText,
  Folder,
  BarChart3
} from 'lucide-react';

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  article_count?: number;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category_id: string;
  read_time: number;
  is_featured: boolean;
  is_published: boolean;
  views_count: number;
  sort_order: number;
  created_at: string;
  category?: { name: string };
  author?: { first_name: string; last_name: string };
}

const HelpCenterAdmin = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'analytics'>('articles');
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [editingCategory, setEditingCategory] = useState<HelpCategory | null>(null);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Check if user is admin
  if (!hasRole('admin')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Load data
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('help_categories')
        .select(`
          *,
          help_articles(count)
        `)
        .order('sort_order');

      if (error) throw error;

      const categoriesWithCounts = data?.map(cat => ({
        ...cat,
        article_count: cat.help_articles?.[0]?.count || 0
      })) || [];

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select(`
          *,
          category:help_categories(name),
          author:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadCategories(), loadArticles()]);
      setLoading(false);
    };
    init();
  }, []);

  // Article CRUD
  const handleSaveArticle = async (formData: FormData) => {
    try {
      const articleData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        content: formData.get('content') as string,
        category_id: formData.get('category_id') as string,
        read_time: parseInt(formData.get('read_time') as string),
        is_featured: formData.get('is_featured') === 'on',
        is_published: formData.get('is_published') === 'on',
        sort_order: parseInt(formData.get('sort_order') as string) || 0,
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('help_articles')
          .update(articleData)
          .eq('id', editingArticle.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Article updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('help_articles')
          .insert([{ ...articleData, author_id: (await supabase.auth.getUser()).data.user?.id }]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Article created successfully",
        });
      }

      setIsArticleDialogOpen(false);
      setEditingArticle(null);
      loadArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: "Failed to save article",
        variant: "destructive",
      });
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('help_articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
      
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  // Category CRUD
  const handleSaveCategory = async (formData: FormData) => {
    try {
      const categoryData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        icon: formData.get('icon') as string,
        color: formData.get('color') as string,
        sort_order: parseInt(formData.get('sort_order') as string) || 0,
        is_active: formData.get('is_active') === 'on',
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('help_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('help_categories')
          .insert([categoryData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('help_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Help Center Admin</h1>
          <p className="text-muted-foreground">Manage help articles, categories, and analytics</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'articles' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Articles</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'categories' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Folder className="h-4 w-4" />
              <span>Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            {/* Articles header */}
            <div className="flex items-center justify-between">
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
              <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingArticle(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingArticle ? 'Edit Article' : 'Create New Article'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingArticle ? 'Update the article details below.' : 'Fill in the details to create a new help article.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveArticle(new FormData(e.currentTarget));
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          name="title"
                          defaultValue={editingArticle?.title || ''}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingArticle?.description || ''}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category_id">Category</Label>
                        <Select name="category_id" defaultValue={editingArticle?.category_id || ''} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
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
                      <div className="grid gap-2">
                        <Label htmlFor="content">Content (HTML)</Label>
                        <Textarea
                          id="content"
                          name="content"
                          defaultValue={editingArticle?.content || ''}
                          rows={8}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="read_time">Read Time (minutes)</Label>
                          <Input
                            id="read_time"
                            name="read_time"
                            type="number"
                            defaultValue={editingArticle?.read_time || 5}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="sort_order">Sort Order</Label>
                          <Input
                            id="sort_order"
                            name="sort_order"
                            type="number"
                            defaultValue={editingArticle?.sort_order || 0}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_featured"
                            name="is_featured"
                            defaultChecked={editingArticle?.is_featured || false}
                          />
                          <Label htmlFor="is_featured">Featured</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_published"
                            name="is_published"
                            defaultChecked={editingArticle?.is_published || false}
                          />
                          <Label htmlFor="is_published">Published</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {editingArticle ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Articles list */}
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card key={article.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{article.title}</h3>
                          <div className="flex items-center space-x-2">
                            {article.is_published ? (
                              <Badge variant="default">
                                <Eye className="h-3 w-3 mr-1" />
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Draft
                              </Badge>
                            )}
                            {article.is_featured && (
                              <Badge variant="outline">Featured</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-3">{article.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{article.category?.name}</span>
                          <span>•</span>
                          <span>{article.read_time} min read</span>
                          <span>•</span>
                          <span>{article.views_count} views</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingArticle(article);
                            setIsArticleDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this article?')) {
                              handleDeleteArticle(article.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Categories header */}
            <div className="flex justify-end">
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingCategory(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCategory ? 'Update the category details below.' : 'Fill in the details to create a new category.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCategory(new FormData(e.currentTarget));
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingCategory?.name || ''}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingCategory?.description || ''}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="icon">Icon (Lucide name)</Label>
                          <Input
                            id="icon"
                            name="icon"
                            defaultValue={editingCategory?.icon || 'Home'}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="color">Color (Tailwind gradient)</Label>
                          <Input
                            id="color"
                            name="color"
                            defaultValue={editingCategory?.color || 'from-blue-500 to-blue-600'}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sort_order">Sort Order</Label>
                        <Input
                          id="sort_order"
                          name="sort_order"
                          type="number"
                          defaultValue={editingCategory?.sort_order || 0}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          name="is_active"
                          defaultChecked={editingCategory?.is_active !== false}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {editingCategory ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Categories list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                        <p className="text-muted-foreground mb-3 text-sm">{category.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{category.article_count} articles</span>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category);
                            setIsCategoryDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this category? This will also delete all articles in this category.')) {
                              handleDeleteCategory(category.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{articles.length}</div>
                  <p className="text-sm text-muted-foreground">
                    {articles.filter(a => a.is_published).length} published
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{categories.length}</div>
                  <p className="text-sm text-muted-foreground">
                    {categories.filter(c => c.is_active).length} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {articles.reduce((sum, article) => sum + article.views_count, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Most viewed articles */}
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles
                    .sort((a, b) => b.views_count - a.views_count)
                    .slice(0, 5)
                    .map((article) => (
                      <div key={article.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-muted-foreground">{article.category?.name}</p>
                        </div>
                        <Badge variant="outline">{article.views_count} views</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenterAdmin;