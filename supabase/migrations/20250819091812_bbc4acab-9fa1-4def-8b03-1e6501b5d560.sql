-- Create board_memberships table that was missing
CREATE TABLE IF NOT EXISTS public.board_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(board_id, user_id)
);

-- Enable RLS
ALTER TABLE public.board_memberships ENABLE ROW LEVEL SECURITY;

-- Create security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_board_access(user_uuid UUID, board_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.board_memberships 
    WHERE user_id = user_uuid AND board_id = board_uuid AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create security definer function to check if user can manage board
CREATE OR REPLACE FUNCTION public.can_manage_board(user_uuid UUID, board_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.board_memberships 
    WHERE user_id = user_uuid 
    AND board_id = board_uuid 
    AND role IN ('admin', 'owner') 
    AND status = 'active'
  ) OR public.has_role(user_uuid, 'admin'::app_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create RLS policies using security definer functions
CREATE POLICY "Users can view their board memberships" 
ON public.board_memberships 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.can_manage_board(auth.uid(), board_id)
);

CREATE POLICY "Board admins can manage memberships" 
ON public.board_memberships 
FOR ALL 
USING (public.can_manage_board(auth.uid(), board_id));

CREATE POLICY "Users can create memberships for accessible boards" 
ON public.board_memberships 
FOR INSERT 
WITH CHECK (public.can_manage_board(auth.uid(), board_id));

-- Create trigger for updated_at
CREATE TRIGGER update_board_memberships_updated_at
  BEFORE UPDATE ON public.board_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.board_memberships (board_id, user_id, role, status)
SELECT 
  cb.id, 
  '00000000-0000-0000-0000-000000000000'::uuid, -- placeholder user id
  'admin',
  'active'
FROM public.customer_boards cb
WHERE NOT EXISTS (
  SELECT 1 FROM public.board_memberships bm 
  WHERE bm.board_id = cb.id
)
ON CONFLICT (board_id, user_id) DO NOTHING;