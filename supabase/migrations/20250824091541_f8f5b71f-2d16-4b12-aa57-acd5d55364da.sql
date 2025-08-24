-- Fix RLS policies for customer boards to allow authenticated users to create boards

-- Drop existing policies
DROP POLICY IF EXISTS "Organization admins can manage boards" ON public.customer_boards;
DROP POLICY IF EXISTS "Users can view accessible boards" ON public.customer_boards;

-- Create new policies that allow authenticated users to create and manage boards
CREATE POLICY "Authenticated users can create boards" 
ON public.customer_boards 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view all active boards" 
ON public.customer_boards 
FOR SELECT 
TO authenticated 
USING (is_active = true);

CREATE POLICY "Authenticated users can update their boards" 
ON public.customer_boards 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IS NOT NULL);

-- Also fix board_memberships to allow authenticated users to manage memberships
DROP POLICY IF EXISTS "Board admins can manage integrations" ON public.board_memberships;

CREATE POLICY "Authenticated users can manage board memberships" 
ON public.board_memberships 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL);

-- Ensure organization_memberships allows authenticated users
CREATE POLICY "Authenticated users can manage organization memberships" 
ON public.organization_memberships 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL);