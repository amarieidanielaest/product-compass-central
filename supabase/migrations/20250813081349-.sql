-- Create board_memberships table for managing access to customer boards
CREATE TABLE IF NOT EXISTS public.board_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id uuid NOT NULL REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(board_id, user_id)
);

-- Enable RLS
ALTER TABLE public.board_memberships ENABLE ROW LEVEL SECURITY;

-- Board members can view their own memberships
CREATE POLICY "Board members can view their memberships" 
ON public.board_memberships 
FOR SELECT 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Board admins can manage memberships
CREATE POLICY "Board admins can manage memberships" 
ON public.board_memberships 
FOR ALL 
USING (
  board_id IN (
    SELECT id FROM public.customer_boards 
    WHERE organization_id IN (
      SELECT organization_id FROM public.organization_memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create feedback_votes table for voting on feedback items
CREATE TABLE IF NOT EXISTS public.feedback_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id uuid NOT NULL REFERENCES public.feedback_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(feedback_id, user_id)
);

-- Enable RLS for feedback_votes
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;

-- Users can manage their own votes
CREATE POLICY "Users can manage their own votes" 
ON public.feedback_votes 
FOR ALL 
USING (user_id = auth.uid());

-- Anyone can view votes on accessible feedback
CREATE POLICY "Users can view votes on accessible feedback" 
ON public.feedback_votes 
FOR SELECT 
USING (
  feedback_id IN (
    SELECT fi.id FROM public.feedback_items fi
    JOIN public.customer_boards cb ON fi.board_id = cb.id
    WHERE cb.is_public = true OR cb.id IN (
      SELECT board_id FROM public.board_memberships 
      WHERE user_id = auth.uid()
    )
  )
);

-- Add update trigger for feedback_votes count
CREATE TRIGGER update_feedback_votes_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.feedback_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_feedback_votes_count();