-- Fix security definer functions to include proper search_path
CREATE OR REPLACE FUNCTION public.get_user_board_access(user_uuid UUID, board_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.board_memberships 
    WHERE user_id = user_uuid AND board_id = board_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;