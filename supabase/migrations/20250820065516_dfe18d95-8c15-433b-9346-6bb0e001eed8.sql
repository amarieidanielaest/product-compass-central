-- First, drop ALL existing policies on board_memberships
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'board_memberships' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.board_memberships';
    END LOOP;
END $$;

-- Create security definer functions to avoid recursion
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

-- Now create clean RLS policies using security definer functions
CREATE POLICY "board_memberships_select_policy" 
ON public.board_memberships 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.can_manage_board(auth.uid(), board_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "board_memberships_all_policy" 
ON public.board_memberships 
FOR ALL 
USING (
  public.can_manage_board(auth.uid(), board_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add some sample data with a valid user ID from profiles table
INSERT INTO public.board_memberships (board_id, user_id, role)
SELECT DISTINCT
  cb.id, 
  p.id,
  'admin'
FROM public.customer_boards cb
CROSS JOIN public.profiles p
WHERE cb.is_active = true
LIMIT 5
ON CONFLICT (board_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;