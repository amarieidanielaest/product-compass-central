import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Save, 
  X, 
  Plus, 
  Eye, 
  FileText, 
  Tag, 
  Star,
  Clock,
  Sparkles
} from 'lucide-react';

interface KBCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface KBArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category_id: string;
  read_time: number;
  is_featured: boolean;
  is_published: boolean;
  tags: string[];
}

interface ArticleEditorProps {
  article?: KBArticle | null;
  categories: KBCategory[];
  onSave: () => void;
  onCancel: () => void;
}

export const ArticleEditor = ({ article, categories, onSave, onCancel }: ArticleEditorProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    is_featured: false,
    is_published: false,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [aiAssisting, setAiAssisting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        description: article.description,
        content: article.content,
        category_id: article.category_id,
        is_featured: article.is_featured,
        is_published: article.is_published,
        tags: article.tags || []
      });
    }
  }, [article]);

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save articles",
          variant: "destructive"
        });
        return;
      }

      const articleData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        category_id: formData.category_id,
        author_id: user.id,
        read_time: calculateReadTime(formData.content),
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        tags: formData.tags,
        last_updated: new Date().toISOString()
      };

      let error;
      if (article) {
        // Update existing article
        const { error: updateError } = await supabase
          .from('kb_articles')
          .update(articleData)
          .eq('id', article.id);
        error = updateError;
      } else {
        // Create new article
        const { error: insertError } = await supabase
          .from('kb_articles')
          .insert(articleData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${article ? 'updated' : 'created'} successfully`
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: `Failed to ${article ? 'update' : 'create'} article`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAIAssist = async (type: 'title' | 'description' | 'content') => {
    setAiAssisting(true);
    
    try {
      // Simulate AI assistance - replace with actual AI service call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (type) {
        case 'title':
          if (formData.content) {
            const suggestedTitle = `AI-Generated: ${formData.content.slice(0, 50)}...`;
            setFormData(prev => ({ ...prev, title: suggestedTitle }));
          }
          break;
        case 'description':
          if (formData.content) {
            const suggestedDescription = `This article covers ${formData.content.slice(0, 100)}...`;
            setFormData(prev => ({ ...prev, description: suggestedDescription }));
          }
          break;
        case 'content':
          if (formData.title) {
            const suggestedContent = `# ${formData.title}\n\n## Introduction\n\nThis is an AI-generated starting point for your article.\n\n## Main Content\n\nAdd your content here.\n\n## Conclusion\n\nSummarize your key points.`;
            setFormData(prev => ({ ...prev, content: suggestedContent }));
          }
          break;
      }
      
      toast({
        title: "AI Assistance",
        description: `AI suggestions added for ${type}`
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to get AI assistance",
        variant: "destructive"
      });
    } finally {
      setAiAssisting(false);
    }
  };

  const renderPreview = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mb-4 mt-6">{paragraph.slice(2)}</h1>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mb-3 mt-5">{paragraph.slice(3)}</h2>;
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mb-2 mt-4">{paragraph.slice(4)}</h3>;
      }
      if (paragraph.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1">{paragraph.slice(2)}</li>;
      }
      if (paragraph.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {article ? 'Edit Article' : 'Create New Article'}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {previewMode ? (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{formData.title}</h1>
                    <p className="text-xl text-muted-foreground mb-4">{formData.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {calculateReadTime(formData.content)} min read
                      </span>
                    </div>
                  </div>
                  <Separator className="mb-6" />
                  <div className="prose prose-lg max-w-none">
                    {renderPreview(formData.content)}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Title */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Article Title</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAIAssist('title')}
                        disabled={aiAssisting}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Suggest
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Enter a compelling title..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="text-lg"
                    />
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Description</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAIAssist('description')}
                        disabled={aiAssisting}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Suggest
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write a brief description..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Content */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Content</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAIAssist('content')}
                        disabled={aiAssisting}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Draft
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write your article content... (Supports markdown-like formatting)"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={20}
                      className="font-mono"
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                      Estimated read time: {calculateReadTime(formData.content)} minutes
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Published</Label>
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured</Label>
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
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
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Article Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Article Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Word count:</span>
                  <span>{formData.content.split(/\s+/).filter(word => word.length > 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <span>{formData.content.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Read time:</span>
                  <span>{calculateReadTime(formData.content)} min</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};