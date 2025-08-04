-- Phase 1: Database Schema Improvements for Customer Boards

-- Create board memberships table for user access control
CREATE TABLE public.board_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(board_id, user_id)
);

-- Enable RLS on board memberships
ALTER TABLE public.board_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for board memberships
CREATE POLICY "Board admins can manage memberships"
ON public.board_memberships
FOR ALL
USING (
  board_id IN (
    SELECT bm.board_id 
    FROM public.board_memberships bm 
    WHERE bm.user_id = auth.uid() AND bm.role = 'admin'
  ) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can view their board memberships"
ON public.board_memberships
FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Create feedback votes table
CREATE TABLE public.feedback_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedback_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL DEFAULT 'upvote' CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(feedback_id, user_id)
);

-- Enable RLS on feedback votes
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback votes
CREATE POLICY "Users can manage their own votes"
ON public.feedback_votes
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Anyone can view votes on accessible feedback"
ON public.feedback_votes
FOR SELECT
USING (
  feedback_id IN (
    SELECT fi.id FROM public.feedback_items fi
    WHERE fi.board_id IN (
      SELECT cb.id FROM public.customer_boards cb
      WHERE cb.is_public = true OR
      cb.id IN (
        SELECT bm.board_id FROM public.board_memberships bm
        WHERE bm.user_id = auth.uid()
      )
    )
  )
);

-- Create feedback comments table (enhanced)
CREATE TABLE public.feedback_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedback_items(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.feedback_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on feedback comments
ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback comments
CREATE POLICY "Users can view comments on accessible feedback"
ON public.feedback_comments
FOR SELECT
USING (
  feedback_id IN (
    SELECT fi.id FROM public.feedback_items fi
    WHERE fi.board_id IN (
      SELECT cb.id FROM public.customer_boards cb
      WHERE cb.is_public = true OR
      cb.id IN (
        SELECT bm.board_id FROM public.board_memberships bm
        WHERE bm.user_id = auth.uid()
      )
    )
  ) AND (is_internal = false OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Users can create comments on accessible feedback"
ON public.feedback_comments
FOR INSERT
WITH CHECK (
  feedback_id IN (
    SELECT fi.id FROM public.feedback_items fi
    WHERE fi.board_id IN (
      SELECT cb.id FROM public.customer_boards cb
      WHERE cb.is_public = true OR
      cb.id IN (
        SELECT bm.board_id FROM public.board_memberships bm
        WHERE bm.user_id = auth.uid()
      )
    )
  ) AND author_id = auth.uid()
);

CREATE POLICY "Users can update their own comments"
ON public.feedback_comments
FOR UPDATE
USING (author_id = auth.uid());

-- Enhance customer_boards table
ALTER TABLE public.customer_boards 
ADD COLUMN IF NOT EXISTS board_type TEXT DEFAULT 'general' CHECK (board_type IN ('general', 'customer_specific', 'internal')),
ADD COLUMN IF NOT EXISTS customer_organization_id UUID REFERENCES public.organizations(id),
ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'public' CHECK (access_type IN ('public', 'private', 'invite_only'));

-- Enhance feedback_items table
ALTER TABLE public.feedback_items 
ADD COLUMN IF NOT EXISTS votes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS impact_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS effort_estimate INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS customer_info JSONB DEFAULT '{}';

-- Update existing board policies to include membership check
DROP POLICY IF EXISTS "Anyone can view public boards" ON public.customer_boards;
CREATE POLICY "Users can view accessible boards"
ON public.customer_boards
FOR SELECT
USING (
  (is_public = true AND is_active = true) OR
  id IN (
    SELECT bm.board_id FROM public.board_memberships bm
    WHERE bm.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update feedback policies to work with board memberships
DROP POLICY IF EXISTS "Anyone can submit feedback to public boards" ON public.feedback_items;
CREATE POLICY "Users can submit feedback to accessible boards"
ON public.feedback_items
FOR INSERT
WITH CHECK (
  board_id IN (
    SELECT cb.id FROM public.customer_boards cb
    WHERE cb.is_public = true OR
    cb.id IN (
      SELECT bm.board_id FROM public.board_memberships bm
      WHERE bm.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can view feedback on accessible boards"
ON public.feedback_items
FOR SELECT
USING (
  board_id IN (
    SELECT cb.id FROM public.customer_boards cb
    WHERE cb.is_public = true OR
    cb.id IN (
      SELECT bm.board_id FROM public.board_memberships bm
      WHERE bm.user_id = auth.uid()
    )
  ) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create functions for vote counting
CREATE OR REPLACE FUNCTION update_feedback_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.feedback_items
  SET votes_count = (
    SELECT COUNT(*) FROM public.feedback_votes
    WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id)
    AND vote_type = 'upvote'
  ) - (
    SELECT COUNT(*) FROM public.feedback_votes
    WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id)
    AND vote_type = 'downvote'
  )
  WHERE id = COALESCE(NEW.feedback_id, OLD.feedback_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counting
CREATE TRIGGER update_feedback_votes_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.feedback_votes
FOR EACH ROW EXECUTE FUNCTION update_feedback_votes_count();

-- Create function for comment counting
CREATE OR REPLACE FUNCTION update_feedback_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.feedback_items
  SET comments_count = (
    SELECT COUNT(*) FROM public.feedback_comments
    WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id)
  )
  WHERE id = COALESCE(NEW.feedback_id, OLD.feedback_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment counting
CREATE TRIGGER update_feedback_comments_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.feedback_comments
FOR EACH ROW EXECUTE FUNCTION update_feedback_comments_count();

-- Create updated_at trigger for feedback comments
CREATE TRIGGER update_feedback_comments_updated_at
BEFORE UPDATE ON public.feedback_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();