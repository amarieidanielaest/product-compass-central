-- Create board_memberships table for customer boards
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

-- Enable RLS
ALTER TABLE public.board_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for board_memberships
CREATE POLICY "Board admins can manage memberships"
  ON public.board_memberships
  FOR ALL
  USING (
    board_id IN (
      SELECT cb.id 
      FROM customer_boards cb 
      WHERE cb.organization_id IN (
        SELECT om.organization_id
        FROM organization_memberships om
        WHERE om.user_id = auth.uid() AND om.role = 'admin'
      )
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can view board memberships for accessible boards"
  ON public.board_memberships
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
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );