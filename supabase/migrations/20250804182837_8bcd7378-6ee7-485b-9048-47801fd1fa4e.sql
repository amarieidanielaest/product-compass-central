-- Create Knowledge Base categories table
CREATE TABLE public.kb_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'folder',
  color TEXT NOT NULL DEFAULT '#6b7280',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID,
  board_id UUID,
  visibility TEXT DEFAULT 'general' CHECK (visibility IN ('general', 'organization', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Knowledge Base articles table
CREATE TABLE public.kb_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category_id UUID,
  author_id UUID,
  organization_id UUID,
  board_id UUID,
  read_time INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  rating_average DECIMAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  visibility TEXT DEFAULT 'general' CHECK (visibility IN ('general', 'organization', 'private')),
  sort_order INTEGER DEFAULT 0,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create article versions table for version control
CREATE TABLE public.kb_article_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID,
  changes_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create article ratings table
CREATE TABLE public.kb_article_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- Create article comments table
CREATE TABLE public.kb_article_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID, -- For nested comments
  is_helpful BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create article views tracking
CREATE TABLE public.kb_article_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content suggestions table for AI features
CREATE TABLE public.kb_content_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('improvement', 'related', 'gap', 'duplicate')),
  suggestion_text TEXT NOT NULL,
  confidence_score DECIMAL DEFAULT 0,
  is_applied BOOLEAN DEFAULT false,
  suggested_by TEXT DEFAULT 'ai',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_content_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "Anyone can view active general categories" ON public.kb_categories
  FOR SELECT USING (is_active = true AND (visibility = 'general' OR organization_id IS NULL));

CREATE POLICY "Organization members can view their categories" ON public.kb_categories
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_memberships.organization_id
      FROM organization_memberships
      WHERE organization_memberships.user_id = auth.uid()
        AND organization_memberships.status = 'active'
    ) AND is_active = true
  );

CREATE POLICY "Admins can manage categories" ON public.kb_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for articles
CREATE POLICY "Anyone can view published general articles" ON public.kb_articles
  FOR SELECT USING (is_published = true AND (visibility = 'general' OR organization_id IS NULL));

CREATE POLICY "Organization members can view their published articles" ON public.kb_articles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_memberships.organization_id
      FROM organization_memberships
      WHERE organization_memberships.user_id = auth.uid()
        AND organization_memberships.status = 'active'
    ) AND is_published = true
  );

CREATE POLICY "Admins and org admins can manage articles" ON public.kb_articles
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    organization_id IN (
      SELECT organization_memberships.organization_id
      FROM organization_memberships
      WHERE organization_memberships.user_id = auth.uid()
        AND organization_memberships.role = 'admin'
    )
  );

-- Create RLS policies for ratings
CREATE POLICY "Users can manage their own ratings" ON public.kb_article_ratings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can view ratings" ON public.kb_article_ratings
  FOR SELECT USING (true);

-- Create RLS policies for comments
CREATE POLICY "Users can manage their own comments" ON public.kb_article_comments
  FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Anyone can view comments on published articles" ON public.kb_article_comments
  FOR SELECT USING (
    article_id IN (
      SELECT id FROM public.kb_articles 
      WHERE is_published = true
    )
  );

-- Create RLS policies for views
CREATE POLICY "Users can view article views" ON public.kb_article_views
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert article views" ON public.kb_article_views
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for content suggestions
CREATE POLICY "Admins can manage content suggestions" ON public.kb_content_suggestions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view content suggestions" ON public.kb_content_suggestions
  FOR SELECT USING (true);

-- Create functions for search and ratings
CREATE OR REPLACE FUNCTION public.update_article_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kb_articles_search_vector
  BEFORE INSERT OR UPDATE ON public.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_article_search_vector();

CREATE OR REPLACE FUNCTION public.update_article_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.kb_articles
  SET 
    rating_average = (
      SELECT AVG(rating)::DECIMAL
      FROM public.kb_article_ratings
      WHERE article_id = COALESCE(NEW.article_id, OLD.article_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.kb_article_ratings
      WHERE article_id = COALESCE(NEW.article_id, OLD.article_id)
    )
  WHERE id = COALESCE(NEW.article_id, OLD.article_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.kb_article_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_article_rating_stats();

-- Create updated_at triggers
CREATE TRIGGER update_kb_categories_updated_at
  BEFORE UPDATE ON public.kb_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON public.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kb_article_ratings_updated_at
  BEFORE UPDATE ON public.kb_article_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kb_article_comments_updated_at
  BEFORE UPDATE ON public.kb_article_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.kb_categories (name, description, icon, color, sort_order, visibility) VALUES
('Getting Started', 'Essential guides to get up and running quickly', 'rocket', '#10b981', 1, 'general'),
('Features', 'Detailed guides on product features and capabilities', 'star', '#3b82f6', 2, 'general'),
('Integrations', 'How to connect with external tools and services', 'link', '#8b5cf6', 3, 'general'),
('Troubleshooting', 'Solutions to common issues and problems', 'tool', '#f59e0b', 4, 'general'),
('API Documentation', 'Technical documentation for developers', 'code', '#6b7280', 5, 'general'),
('Best Practices', 'Tips and recommendations for optimal usage', 'lightbulb', '#ef4444', 6, 'general');