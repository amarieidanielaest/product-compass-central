-- Fix infinite recursion in organization_memberships policies
-- First, drop the problematic policies
DROP POLICY IF EXISTS "Organization admins can manage memberships" ON public.organization_memberships;
DROP POLICY IF EXISTS "Organization members can view memberships" ON public.organization_memberships;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_organization_role(user_uuid uuid, org_uuid uuid)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT role 
  FROM public.organization_memberships 
  WHERE user_id = user_uuid 
    AND organization_id = org_uuid 
    AND status = 'active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_organization_member(user_uuid uuid, org_uuid uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_memberships 
    WHERE user_id = user_uuid 
      AND organization_id = org_uuid 
      AND status = 'active'
  );
$$;

-- Recreate the policies using the security definer functions
CREATE POLICY "Organization admins can manage memberships"
ON public.organization_memberships
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR public.get_user_organization_role(auth.uid(), organization_id) = 'admin'
);

CREATE POLICY "Organization members can view memberships"
ON public.organization_memberships
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR public.is_organization_member(auth.uid(), organization_id)
);

-- Also fix customer_boards policies that might have similar issues
DROP POLICY IF EXISTS "Organization members can view their boards" ON public.customer_boards;

CREATE POLICY "Organization members can view their boards"
ON public.customer_boards
FOR SELECT
USING (
  (public.is_organization_member(auth.uid(), organization_id) AND is_active = true)
  OR has_role(auth.uid(), 'admin'::app_role)
);