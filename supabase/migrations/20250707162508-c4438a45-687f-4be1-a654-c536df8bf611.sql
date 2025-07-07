-- Create pricing plans table
CREATE TABLE public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  price_yearly INTEGER, -- in cents, optional for annual discount
  max_team_members INTEGER,
  max_projects INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pricing_plan_id UUID REFERENCES public.pricing_plans(id),
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive', -- active, inactive, canceled, past_due
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team memberships table
CREATE TABLE public.team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- owner, admin, member, viewer
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, active, removed
  UNIQUE (team_id, user_id)
);

-- Create team invitations table
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  invited_by UUID REFERENCES public.profiles(id) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, email)
);

-- Add team_id to existing tables that should be team-scoped
ALTER TABLE public.profiles ADD COLUMN current_team_id UUID REFERENCES public.teams(id);

-- Enable RLS on all new tables
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing_plans (public read)
CREATE POLICY "Anyone can view active pricing plans" 
  ON public.pricing_plans FOR SELECT 
  USING (is_active = true);

-- RLS Policies for teams
CREATE POLICY "Team members can view their teams" 
  ON public.teams FOR SELECT 
  USING (
    id IN (
      SELECT team_id FROM public.team_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Team owners can update their teams" 
  ON public.teams FOR UPDATE 
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create teams" 
  ON public.teams FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for team_memberships
CREATE POLICY "Team members can view team memberships" 
  ON public.team_memberships FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Team owners and admins can manage memberships" 
  ON public.team_memberships FOR ALL 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- RLS Policies for team_invitations
CREATE POLICY "Team members can view invitations" 
  ON public.team_invitations FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

CREATE POLICY "Team owners and admins can manage invitations" 
  ON public.team_invitations FOR ALL 
  USING (
    team_id IN (
      SELECT team_id FROM public.team_memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, description, price_monthly, price_yearly, max_team_members, max_projects, features) VALUES
('Free', 'Perfect for getting started', 0, 0, 3, 1, '["Basic dashboard", "1 project", "Up to 3 team members", "Community support"]'),
('Pro', 'For growing teams', 1999, 19999, 10, 5, '["Everything in Free", "5 projects", "Up to 10 team members", "Advanced analytics", "Priority support", "Custom integrations"]'),
('Enterprise', 'For large organizations', 4999, 49999, -1, -1, '["Everything in Pro", "Unlimited projects", "Unlimited team members", "SSO authentication", "Advanced security", "Dedicated support", "Custom onboarding"]');

-- Create function to handle team creation with membership
CREATE OR REPLACE FUNCTION public.create_team_with_owner(
  team_name TEXT,
  team_slug TEXT,
  team_description TEXT DEFAULT NULL,
  plan_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create function to accept team invitation
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;