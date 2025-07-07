-- Create tables for the Knowledge Center / Help Portal

-- Categories table for organizing articles
CREATE TABLE public.help_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Articles table for help content
CREATE TABLE public.help_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.help_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  read_time INTEGER DEFAULT 5, -- in minutes
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tags for articles
CREATE TABLE public.help_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Many-to-many relationship between articles and tags
CREATE TABLE public.help_article_tags (
  article_id UUID REFERENCES public.help_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.help_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_article_tags ENABLE ROW LEVEL SECURITY;

-- Policies for public read access (knowledge center is public)
CREATE POLICY "Anyone can view active categories" 
ON public.help_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view published articles" 
ON public.help_articles 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Anyone can view tags" 
ON public.help_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view article tags" 
ON public.help_article_tags 
FOR SELECT 
USING (true);

-- Admin policies for content management
CREATE POLICY "Admins can manage categories" 
ON public.help_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage articles" 
ON public.help_articles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage tags" 
ON public.help_tags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage article tags" 
ON public.help_article_tags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_help_categories_updated_at
  BEFORE UPDATE ON public.help_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_articles_updated_at
  BEFORE UPDATE ON public.help_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment article views
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.help_articles 
  SET views_count = views_count + 1 
  WHERE id = article_id AND is_published = true;
$$;

-- Insert sample categories
INSERT INTO public.help_categories (name, description, icon, color, sort_order) VALUES
('Getting Started', 'Best steps on getting started with our unified product management platform.', 'Home', 'from-blue-500 to-blue-600', 1),
('Feedback & Roadmaps', 'Set up your Feedback Portal & Roadmaps to collect feedback and show users what you''re working on.', 'Map', 'from-purple-500 to-purple-600', 2),
('AI & Automation', 'Leverage AI-powered features for intelligent product management and automation.', 'Sparkles', 'from-emerald-500 to-emerald-600', 3),
('Analytics & Insights', 'Learn how to customize your analytics dashboard, create reports, and analyze user behavior.', 'BarChart3', 'from-indigo-500 to-indigo-600', 4),
('Strategy & Planning', 'Learn to manage your strategy, OKRs and different ways of planning product development.', 'Target', 'from-orange-500 to-orange-600', 5),
('Enterprise Features', 'Learn how to set up, customize, and manage enterprise security and multi-product features.', 'Shield', 'from-red-500 to-red-600', 6),
('Users', 'Learn how to manage your users, create segments, and define user roles.', 'Users', 'from-pink-500 to-pink-600', 7),
('Integrations', 'Learn to integrate with your favorite tools to help you get the most out of your product data.', 'Settings', 'from-teal-500 to-teal-600', 8);