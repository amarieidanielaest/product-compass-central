-- ========================================
-- PHASE 1: CRITICAL DATABASE INTEGRITY FIXES (INCREMENTAL)
-- Adding only missing Foreign Key Constraints and Indexes
-- ========================================

-- Check and add only missing foreign key constraints

-- User roles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'user_roles_user_id_fkey' 
                 AND table_name = 'user_roles') THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Team memberships (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'team_memberships_team_id_fkey' 
                 AND table_name = 'team_memberships') THEN
    ALTER TABLE public.team_memberships 
    ADD CONSTRAINT team_memberships_team_id_fkey 
    FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'team_memberships_user_id_fkey' 
                 AND table_name = 'team_memberships') THEN
    ALTER TABLE public.team_memberships 
    ADD CONSTRAINT team_memberships_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Board memberships (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'board_memberships_board_id_fkey' 
                 AND table_name = 'board_memberships') THEN
    ALTER TABLE public.board_memberships 
    ADD CONSTRAINT board_memberships_board_id_fkey 
    FOREIGN KEY (board_id) REFERENCES public.customer_boards(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ========================================
-- ADD CRITICAL PERFORMANCE INDEXES (IF NOT EXISTS)
-- ========================================

-- User and role indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Team relationship indexes  
CREATE INDEX IF NOT EXISTS idx_team_memberships_user_id ON public.team_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON public.team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_status ON public.team_memberships(status);

-- Board and feedback indexes
CREATE INDEX IF NOT EXISTS idx_board_memberships_user_id ON public.board_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_board_memberships_board_id ON public.board_memberships(board_id);
CREATE INDEX IF NOT EXISTS idx_feedback_items_board_id ON public.feedback_items(board_id);
CREATE INDEX IF NOT EXISTS idx_feedback_items_status ON public.feedback_items(status);
CREATE INDEX IF NOT EXISTS idx_feedback_items_created_at ON public.feedback_items(created_at);

-- Organization indexes
CREATE INDEX IF NOT EXISTS idx_organization_memberships_user_id ON public.organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_org_id ON public.organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_customer_boards_organization_id ON public.customer_boards(organization_id);

-- RLS performance indexes
CREATE INDEX IF NOT EXISTS idx_customer_boards_is_public ON public.customer_boards(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_customer_boards_is_active ON public.customer_boards(is_active) WHERE is_active = true;

-- ========================================
-- ADD CRITICAL DATA VALIDATION CONSTRAINTS
-- ========================================

-- Email format validation (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'profiles_email_format_check' 
                 AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_email_format_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Team membership role validation (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'team_memberships_role_check' 
                 AND table_name = 'team_memberships') THEN
    ALTER TABLE public.team_memberships 
    ADD CONSTRAINT team_memberships_role_check 
    CHECK (role IN ('owner', 'admin', 'product_manager', 'developer', 'viewer', 'member'));
  END IF;
END $$;

-- Team membership status validation (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'team_memberships_status_check' 
                 AND table_name = 'team_memberships') THEN
    ALTER TABLE public.team_memberships 
    ADD CONSTRAINT team_memberships_status_check 
    CHECK (status IN ('pending', 'active', 'inactive'));
  END IF;
END $$;