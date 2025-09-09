-- Create board-specific knowledge integration
-- Add board_id to help_articles for board-specific content
ALTER TABLE public.help_articles 
ADD COLUMN IF NOT EXISTS board_id uuid REFERENCES public.customer_boards(id) ON DELETE CASCADE;

-- Create board_knowledge_sections table for flexible content organization
CREATE TABLE IF NOT EXISTS public.board_knowledge_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id uuid NOT NULL REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.help_categories(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  custom_title text,
  custom_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(board_id, category_id)
);

-- Create kb_board_associations for flexible article sharing
CREATE TABLE IF NOT EXISTS public.kb_board_associations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL REFERENCES public.help_articles(id) ON DELETE CASCADE,
  board_id uuid NOT NULL REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  is_featured boolean DEFAULT false,
  custom_title text,
  custom_description text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(article_id, board_id)
);

-- Add RLS policies for board knowledge sections
ALTER TABLE public.board_knowledge_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Board knowledge sections viewable by board members"
ON public.board_knowledge_sections
FOR SELECT
USING (
  board_id IN (
    SELECT cb.id 
    FROM customer_boards cb 
    WHERE cb.is_public = true 
    OR cb.id IN (
      SELECT bm.board_id 
      FROM board_memberships bm 
      WHERE bm.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Board admins can manage knowledge sections"
ON public.board_knowledge_sections
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  board_id IN (
    SELECT cb.id
    FROM customer_boards cb
    WHERE cb.organization_id IN (
      SELECT om.organization_id
      FROM organization_memberships om
      WHERE om.user_id = auth.uid() AND om.role = 'admin'
    )
  )
);

-- Add RLS policies for kb_board_associations
ALTER TABLE public.kb_board_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "KB board associations viewable by board members"
ON public.kb_board_associations
FOR SELECT
USING (
  board_id IN (
    SELECT cb.id 
    FROM customer_boards cb 
    WHERE cb.is_public = true 
    OR cb.id IN (
      SELECT bm.board_id 
      FROM board_memberships bm 
      WHERE bm.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Board admins can manage KB associations"
ON public.kb_board_associations
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  board_id IN (
    SELECT cb.id
    FROM customer_boards cb
    WHERE cb.organization_id IN (
      SELECT om.organization_id
      FROM organization_memberships om
      WHERE om.user_id = auth.uid() AND om.role = 'admin'
    )
  )
);

-- Update help_articles RLS to support board-specific content
DROP POLICY IF EXISTS "Anyone can view general articles" ON public.help_articles;
DROP POLICY IF EXISTS "Organization members can view their articles" ON public.help_articles;

-- New policies for board-specific and general articles
CREATE POLICY "Anyone can view general published articles"
ON public.help_articles
FOR SELECT
USING (
  is_published = true AND 
  board_id IS NULL AND
  ((visibility = 'general') OR (organization_id IS NULL))
);

CREATE POLICY "Board members can view board-specific articles"
ON public.help_articles
FOR SELECT
USING (
  is_published = true AND
  board_id IS NOT NULL AND
  board_id IN (
    SELECT cb.id 
    FROM customer_boards cb 
    WHERE cb.is_public = true 
    OR cb.id IN (
      SELECT bm.board_id 
      FROM board_memberships bm 
      WHERE bm.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Organization members can view org-specific articles"
ON public.help_articles
FOR SELECT
USING (
  is_published = true AND
  organization_id IS NOT NULL AND
  organization_id IN (
    SELECT om.organization_id
    FROM organization_memberships om
    WHERE om.user_id = auth.uid() AND om.status = 'active'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_help_articles_board_id ON public.help_articles(board_id);
CREATE INDEX IF NOT EXISTS idx_board_knowledge_sections_board_id ON public.board_knowledge_sections(board_id);
CREATE INDEX IF NOT EXISTS idx_kb_board_associations_board_id ON public.kb_board_associations(board_id);
CREATE INDEX IF NOT EXISTS idx_kb_board_associations_article_id ON public.kb_board_associations(article_id);