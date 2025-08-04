import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Star, 
  Eye, 
  Clock, 
  User, 
  Edit, 
  Share, 
  Bookmark, 
  ThumbsUp, 
  MessageSquare,
  Send
} from 'lucide-react';

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
  category?: {
    name: string;
    color: string;
  };
  author?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface ArticleViewerProps {
  article: KBArticle;
  onBack: () => void;
  onEdit: () => void;
}

export const ArticleViewer = ({ article, onBack, onEdit }: ArticleViewerProps) => {
  const [userRating, setUserRating] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
    loadUserInteractions();
  }, [article.id]);

  const loadComments = async () => {
    try {
      // Mock comments data
      const mockComments = [
        {
          id: '1',
          content: 'Great article! Very helpful.',
          author_id: 'user1',
          created_at: new Date().toISOString(),
          author: { first_name: 'John', last_name: 'Doe', avatar_url: '' }
        }
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadUserInteractions = async () => {
    try {
      // Mock user rating
      setUserRating(0);
    } catch (error) {
      console.error('Error loading user interactions:', error);
    }
  };

  const handleRating = async (rating: number) => {
    try {
      // Simulate rating submission
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUserRating(rating);
      toast({
        title: "Rating saved",
        description: "Thank you for your feedback!"
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Error",
        description: "Failed to save rating",
        variant: "destructive"
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      
      // Simulate comment submission
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment,
        author_id: 'user1',
        created_at: new Date().toISOString(),
        author: { first_name: 'Current', last_name: 'User', avatar_url: '' }
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully"
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Center
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsBookmarked(!isBookmarked)}>
              <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className={`bg-${article.category?.color}-100 text-${article.category?.color}-700`}>
              {article.category?.name}
            </Badge>
            {article.is_featured && (
              <Badge variant="default">Featured</Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{article.description}</p>
          
          {/* Article Meta */}
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={article.author?.avatar_url} />
                  <AvatarFallback>
                    {article.author?.first_name?.[0]}{article.author?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span>{article.author?.first_name} {article.author?.last_name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.read_time} min read
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views_count} views
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {article.rating_average.toFixed(1)} ({article.rating_count} ratings)
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(article.last_updated).toLocaleDateString()}
            </div>
          </div>
          
          <Separator />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {renderContent(article.content)}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Rating Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rate this article</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`p-1 rounded transition-colors ${
                    star <= userRating 
                      ? 'text-yellow-400 hover:text-yellow-500' 
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star className={`h-6 w-6 ${star <= userRating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            {userRating > 0 && (
              <p className="text-sm text-muted-foreground">
                You rated this article {userRating} star{userRating !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment */}
            <div className="mb-6">
              <Textarea
                placeholder="Share your thoughts or ask a question..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={isSubmittingComment || !newComment.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>

            <Separator className="mb-6" />

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author?.avatar_url} />
                    <AvatarFallback>
                      {comment.author?.first_name?.[0]}{comment.author?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {comment.author?.first_name} {comment.author?.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};