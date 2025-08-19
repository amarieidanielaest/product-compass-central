-- Create security definer functions to avoid recursion (these should work now)
CREATE OR REPLACE FUNCTION public.get_user_board_access(user_uuid UUID, board_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.board_memberships 
    WHERE user_id = user_uuid AND board_id = board_uuid
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
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Board admins can manage memberships" 
ON public.board_memberships 
FOR ALL 
USING (
  public.can_manage_board(auth.uid(), board_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create memberships for accessible boards" 
ON public.board_memberships 
FOR INSERT 
WITH CHECK (
  public.can_manage_board(auth.uid(), board_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add some sample board memberships for testing (using correct columns)
INSERT INTO public.board_memberships (board_id, user_id, role)
SELECT 
  id, 
  '00000000-0000-0000-0000-000000000000'::uuid, -- placeholder since auth.uid() won't work in INSERT
  'admin'
FROM public.customer_boards cb
WHERE cb.is_active = true
ON CONFLICT (board_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;