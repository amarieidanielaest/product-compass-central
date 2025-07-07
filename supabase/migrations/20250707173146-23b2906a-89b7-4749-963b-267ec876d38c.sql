-- Create multi-tenant customer portal system

-- Organizations table (customer companies)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  custom_domain TEXT,
  branding_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Organization memberships (users belonging to customer orgs)
CREATE TABLE public.organization_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- admin, member, viewer
  status TEXT DEFAULT 'active', -- active, pending, suspended
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Customer boards (portal spaces for each customer)
CREATE TABLE public.customer_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  branding_config JSONB DEFAULT '{}',
  features_enabled JSONB DEFAULT '{"knowledge_center": true, "roadmap": true, "changelog": true, "feedback": true}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Update help_categories for multi-tenant support
ALTER TABLE public.help_categories ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.help_categories ADD COLUMN board_id UUID REFERENCES public.customer_boards(id) ON DELETE CASCADE;
ALTER TABLE public.help_categories ADD COLUMN visibility TEXT DEFAULT 'general'; -- general, organization, board

-- Update help_articles for multi-tenant support  
ALTER TABLE public.help_articles ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.help_articles ADD COLUMN board_id UUID REFERENCES public.customer_boards(id) ON DELETE CASCADE;
ALTER TABLE public.help_articles ADD COLUMN visibility TEXT DEFAULT 'general'; -- general, organization, board

-- Roadmap items table
CREATE TABLE public.roadmap_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  category TEXT,
  estimated_date DATE,
  completion_date DATE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  board_id UUID REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  visibility TEXT DEFAULT 'general', -- general, organization, board
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  upvotes_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Changelog entries table
CREATE TABLE public.changelog_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  version TEXT,
  type TEXT DEFAULT 'feature', -- feature, improvement, bugfix, breaking
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  board_id UUID REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  visibility TEXT DEFAULT 'general', -- general, organization, board
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Feedback/feature requests table
CREATE TABLE public.feedback_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'submitted', -- submitted, under_review, planned, in_progress, completed, declined
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  board_id UUID REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  upvotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Anyone can view active organizations" 
ON public.organizations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage organizations" 
ON public.organizations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Organization membership policies
CREATE POLICY "Members can view their organization memberships" 
ON public.organization_memberships 
FOR SELECT 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Organization admins can manage memberships" 
ON public.organization_memberships 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin') OR 
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Customer board policies
CREATE POLICY "Anyone can view public boards" 
ON public.customer_boards 
FOR SELECT 
USING (is_public = true AND is_active = true);

CREATE POLICY "Organization members can view their boards" 
ON public.customer_boards 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Organization admins can manage boards" 
ON public.customer_boards 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin') OR 
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update help categories policies for multi-tenant
DROP POLICY "Anyone can view active categories" ON public.help_categories;
CREATE POLICY "Anyone can view general categories" 
ON public.help_categories 
FOR SELECT 
USING (is_active = true AND (visibility = 'general' OR organization_id IS NULL));

CREATE POLICY "Organization members can view their categories" 
ON public.help_categories 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ) AND is_active = true
);

-- Update help articles policies for multi-tenant
DROP POLICY "Anyone can view published articles" ON public.help_articles;
CREATE POLICY "Anyone can view general articles" 
ON public.help_articles 
FOR SELECT 
USING (is_published = true AND (visibility = 'general' OR organization_id IS NULL));

CREATE POLICY "Organization members can view their articles" 
ON public.help_articles 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ) AND is_published = true
);

-- Roadmap policies
CREATE POLICY "Anyone can view general roadmap items" 
ON public.roadmap_items 
FOR SELECT 
USING (visibility = 'general' OR organization_id IS NULL);

CREATE POLICY "Organization members can view their roadmap" 
ON public.roadmap_items 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Admins and org admins can manage roadmap" 
ON public.roadmap_items 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin') OR 
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Changelog policies
CREATE POLICY "Anyone can view general published changelog" 
ON public.changelog_entries 
FOR SELECT 
USING (is_published = true AND (visibility = 'general' OR organization_id IS NULL));

CREATE POLICY "Organization members can view their changelog" 
ON public.changelog_entries 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ) AND is_published = true
);

CREATE POLICY "Admins and org admins can manage changelog" 
ON public.changelog_entries 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin') OR 
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Feedback policies
CREATE POLICY "Anyone can submit feedback to public boards" 
ON public.feedback_items 
FOR INSERT 
WITH CHECK (
  board_id IN (SELECT id FROM customer_boards WHERE is_public = true)
);

CREATE POLICY "Organization members can view and submit feedback" 
ON public.feedback_items 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND status = 'active'
  ) OR has_role(auth.uid(), 'admin')
);

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_boards_updated_at
  BEFORE UPDATE ON public.customer_boards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roadmap_items_updated_at
  BEFORE UPDATE ON public.roadmap_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_changelog_entries_updated_at
  BEFORE UPDATE ON public.changelog_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Sample data for testing
INSERT INTO public.organizations (name, slug, description) VALUES
('TechCorp', 'techcorp', 'A leading technology company'),
('StartupXYZ', 'startupxyz', 'An innovative startup');

-- Create customer boards for the sample organizations
INSERT INTO public.customer_boards (organization_id, name, slug, description, is_public) 
SELECT id, name || ' Portal', 'main', 'Main customer portal for ' || name, true
FROM public.organizations;