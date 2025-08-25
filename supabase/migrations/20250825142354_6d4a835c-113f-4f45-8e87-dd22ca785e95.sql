-- Fix function search path issues by setting search_path
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
SET search_path = public
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
SET search_path = public
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
SET search_path = public
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
SET search_path = public
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

-- Fix the trigger function
CREATE OR REPLACE FUNCTION public.update_customer_users_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;