-- Fix critical security issues in database functions
-- Issue 1: Fix function search paths for security (immutable search_path)

-- Update existing functions to have secure search_path
CREATE OR REPLACE FUNCTION public.update_article_rating_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.kb_articles
  SET 
    rating_average = (
      SELECT AVG(rating)::DECIMAL
      FROM public.kb_article_ratings
      WHERE article_id = COALESCE(NEW.article_id, OLD.article_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.kb_article_ratings
      WHERE article_id = COALESCE(NEW.article_id, OLD.article_id)
    )
  WHERE id = COALESCE(NEW.article_id, OLD.article_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_article_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_feedback_votes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.feedback_items
  SET votes_count = (
    SELECT COUNT(*) FROM public.feedback_votes
    WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id)
    AND vote_type = 'upvote'
  ) - (
    SELECT COUNT(*) FROM public.feedback_votes
    WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id)
    AND vote_type = 'downvote'
  )
  WHERE id = COALESCE(NEW.feedback_id, OLD.feedback_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_feedback_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.feedback_items
  SET comments_count = (
    SELECT COUNT(*) FROM public.feedback_comments
    WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id)
  )
  WHERE id = COALESCE(NEW.feedback_id, OLD.feedback_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_customer_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_article_views(article_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  UPDATE public.help_articles 
  SET views_count = views_count + 1 
  WHERE id = article_id AND is_published = true;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.create_team_with_owner(team_name text, team_slug text, team_description text DEFAULT NULL::text, plan_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_team_id UUID;
  user_id UUID;
BEGIN
  -- Get the current user
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Create the team
  INSERT INTO public.teams (name, slug, description, owner_id, pricing_plan_id)
  VALUES (team_name, team_slug, team_description, user_id, plan_id)
  RETURNING id INTO new_team_id;

  -- Add owner as team member
  INSERT INTO public.team_memberships (team_id, user_id, role, status, joined_at)
  VALUES (new_team_id, user_id, 'owner', 'active', NOW());

  -- Update user's current team
  UPDATE public.profiles SET current_team_id = new_team_id WHERE id = user_id;

  RETURN new_team_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Assign default viewer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get invitation details
  SELECT * FROM public.team_invitations 
  WHERE token = invitation_token AND expires_at > NOW() AND accepted_at IS NULL
  INTO invitation_record;

  IF invitation_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user email matches invitation
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND email = invitation_record.email
  ) THEN
    RETURN FALSE;
  END IF;

  -- Create team membership
  INSERT INTO public.team_memberships (team_id, user_id, role, invited_by, status, joined_at)
  VALUES (invitation_record.team_id, user_id, invitation_record.role, invitation_record.invited_by, 'active', NOW())
  ON CONFLICT (team_id, user_id) DO UPDATE SET
    role = invitation_record.role,
    status = 'active',
    joined_at = NOW();

  -- Mark invitation as accepted
  UPDATE public.team_invitations 
  SET accepted_at = NOW() 
  WHERE id = invitation_record.id;

  -- Update user's current team if they don't have one
  UPDATE public.profiles 
  SET current_team_id = invitation_record.team_id 
  WHERE id = user_id AND current_team_id IS NULL;

  RETURN TRUE;
END;
$function$;