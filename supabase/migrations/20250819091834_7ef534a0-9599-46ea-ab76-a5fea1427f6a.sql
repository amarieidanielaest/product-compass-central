-- Drop existing policies that are causing recursion
DROP POLICY IF EXISTS "Users can view their board memberships" ON public.board_memberships;
DROP POLICY IF EXISTS "Board admins can manage memberships" ON public.board_memberships;
DROP POLICY IF EXISTS "Users can create memberships for accessible boards" ON public.board_memberships;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_board_access(user_uuid UUID, board_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.board_memberships 
    WHERE user_id = user_uuid AND board_id = board_uuid AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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

-- Create new RLS policies using security definer functions (no recursion)
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

-- Add some sample board memberships for testing
INSERT INTO public.board_memberships (board_id, user_id, role, status)
SELECT 
  id, 
  auth.uid(), 
  'admin',
  'active'
FROM public.customer_boards cb
WHERE cb.is_active = true
ON CONFLICT (board_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status;