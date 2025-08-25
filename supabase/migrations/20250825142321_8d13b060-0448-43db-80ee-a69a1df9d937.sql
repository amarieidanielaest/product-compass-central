-- Create customer_users table for customer authentication
CREATE TABLE public.customer_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  job_title TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on customer_users
ALTER TABLE public.customer_users ENABLE ROW LEVEL SECURITY;

-- Customer users can view and update their own profile
CREATE POLICY "Customer users can view own profile" 
ON public.customer_users 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Customer users can update own profile" 
ON public.customer_users 
FOR UPDATE 
USING (id = auth.uid());

-- Create customer_sessions table for session management
CREATE TABLE public.customer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_user_id UUID NOT NULL REFERENCES public.customer_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on customer_sessions
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

-- Only the session owner can access their sessions
CREATE POLICY "Customer can access own sessions" 
ON public.customer_sessions 
FOR ALL 
USING (customer_user_id = auth.uid());

-- Create customer_board_invitations table
CREATE TABLE public.customer_board_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  role TEXT DEFAULT 'member',
  UNIQUE(board_id, email)
);

-- Enable RLS on customer_board_invitations
ALTER TABLE public.customer_board_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can manage invitations
CREATE POLICY "Admins can manage customer board invitations" 
ON public.customer_board_invitations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR invited_by = auth.uid());

-- Anyone with the token can view invitations (for accepting)
CREATE POLICY "Public can view invitations by token" 
ON public.customer_board_invitations 
FOR SELECT 
USING (true);

-- Update board_memberships to support customer users
ALTER TABLE public.board_memberships 
ADD COLUMN customer_user_id UUID REFERENCES public.customer_users(id) ON DELETE CASCADE;

-- Make user_id nullable since we now support both admin users and customer users
ALTER TABLE public.board_memberships 
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or customer_user_id is set
ALTER TABLE public.board_memberships 
ADD CONSTRAINT board_memberships_user_check 
CHECK (
  (user_id IS NOT NULL AND customer_user_id IS NULL) OR 
  (user_id IS NULL AND customer_user_id IS NOT NULL)
);

-- Update RLS policies for board_memberships to include customer users
DROP POLICY IF EXISTS "Users can view board memberships" ON public.board_memberships;
DROP POLICY IF EXISTS "Board admins can manage memberships" ON public.board_memberships;

CREATE POLICY "Users and customers can view relevant board memberships" 
ON public.board_memberships 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  customer_user_id = auth.uid() OR
  board_id IN (
    SELECT bm.board_id FROM public.board_memberships bm 
    WHERE (bm.user_id = auth.uid() OR bm.customer_user_id = auth.uid()) 
    AND bm.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Board admins can manage memberships" 
ON public.board_memberships 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  board_id IN (
    SELECT bm.board_id FROM public.board_memberships bm 
    WHERE bm.user_id = auth.uid() AND bm.role IN ('admin', 'owner')
  )
);

-- Function to create customer user and return session
CREATE OR REPLACE FUNCTION public.create_customer_user(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_job_title TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  session_token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.customer_users WHERE email = p_email) THEN
    RETURN json_build_object('error', 'Email already exists');
  END IF;
  
  -- Generate session token and expiry
  session_token := encode(gen_random_bytes(32), 'base64');
  expires_at := now() + interval '30 days';
  
  -- Create customer user (password will be hashed by the application)
  INSERT INTO public.customer_users (
    email, password_hash, first_name, last_name, company, job_title
  ) VALUES (
    p_email, p_password, p_first_name, p_last_name, p_company, p_job_title
  ) RETURNING id INTO new_user_id;
  
  -- Create session
  INSERT INTO public.customer_sessions (customer_user_id, token, expires_at)
  VALUES (new_user_id, session_token, expires_at);
  
  RETURN json_build_object(
    'user_id', new_user_id,
    'token', session_token,
    'expires_at', expires_at
  );
END;
$$;

-- Function to authenticate customer user
CREATE OR REPLACE FUNCTION public.authenticate_customer_user(
  p_email TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  session_token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user record
  SELECT * FROM public.customer_users 
  WHERE email = p_email 
  INTO user_record;
  
  IF user_record IS NULL THEN
    RETURN json_build_object('error', 'Invalid credentials');
  END IF;
  
  -- In a real app, verify password hash here
  -- For now, just check if password matches stored hash
  IF user_record.password_hash != p_password THEN
    RETURN json_build_object('error', 'Invalid credentials');
  END IF;
  
  -- Generate new session
  session_token := encode(gen_random_bytes(32), 'base64');
  expires_at := now() + interval '30 days';
  
  -- Clean up old sessions
  DELETE FROM public.customer_sessions 
  WHERE customer_user_id = user_record.id 
  AND expires_at < now();
  
  -- Create new session
  INSERT INTO public.customer_sessions (customer_user_id, token, expires_at)
  VALUES (user_record.id, session_token, expires_at);
  
  RETURN json_build_object(
    'user', json_build_object(
      'id', user_record.id,
      'email', user_record.email,
      'first_name', user_record.first_name,
      'last_name', user_record.last_name,
      'company', user_record.company,
      'job_title', user_record.job_title,
      'avatar_url', user_record.avatar_url
    ),
    'token', session_token,
    'expires_at', expires_at
  );
END;
$$;

-- Function to get customer user by session token
CREATE OR REPLACE FUNCTION public.get_customer_user_by_token(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  user_record RECORD;
BEGIN
  -- Get session
  SELECT * FROM public.customer_sessions 
  WHERE token = p_token AND expires_at > now()
  INTO session_record;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('error', 'Invalid or expired session');
  END IF;
  
  -- Get user
  SELECT * FROM public.customer_users 
  WHERE id = session_record.customer_user_id
  INTO user_record;
  
  IF user_record IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  RETURN json_build_object(
    'user', json_build_object(
      'id', user_record.id,
      'email', user_record.email,
      'first_name', user_record.first_name,
      'last_name', user_record.last_name,
      'company', user_record.company,
      'job_title', user_record.job_title,
      'avatar_url', user_record.avatar_url
    ),
    'expires_at', session_record.expires_at
  );
END;
$$;

-- Function to accept board invitation
CREATE OR REPLACE FUNCTION public.accept_customer_board_invitation(
  p_token TEXT,
  p_customer_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Get invitation
  SELECT * FROM public.customer_board_invitations 
  WHERE token = p_token AND expires_at > now() AND accepted_at IS NULL
  INTO invitation_record;
  
  IF invitation_record IS NULL THEN
    RETURN json_build_object('error', 'Invalid or expired invitation');
  END IF;
  
  -- Create board membership
  INSERT INTO public.board_memberships (board_id, customer_user_id, role, joined_at)
  VALUES (invitation_record.board_id, p_customer_user_id, invitation_record.role, now())
  ON CONFLICT (board_id, customer_user_id) DO UPDATE SET
    role = invitation_record.role,
    joined_at = now();
  
  -- Mark invitation as accepted
  UPDATE public.customer_board_invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;
  
  RETURN json_build_object(
    'success', true,
    'board_id', invitation_record.board_id
  );
END;
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_customer_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_users_updated_at
  BEFORE UPDATE ON public.customer_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_users_updated_at();