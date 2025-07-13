-- Create comprehensive sprint board tables with roadmap integration

-- Teams table for sprint organization
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  methodology TEXT NOT NULL DEFAULT 'agile', -- 'agile', 'waterfall', 'hybrid'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projects table to group sprints and roadmap items
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  team_id UUID REFERENCES public.teams(id),
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'planning', 'active', 'completed', 'on-hold'
  methodology_config JSONB DEFAULT '{}', -- Store methodology-specific configurations
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced roadmap_items table (extending existing)
ALTER TABLE public.roadmap_items 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id),
ADD COLUMN IF NOT EXISTS effort_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS business_value_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Sprints table
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT,
  project_id UUID REFERENCES public.projects(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'active', 'completed', 'cancelled'
  capacity INTEGER DEFAULT 0, -- Total capacity in story points or hours
  committed INTEGER DEFAULT 0, -- Committed work
  completed INTEGER DEFAULT 0, -- Completed work
  methodology_type TEXT NOT NULL DEFAULT 'scrum', -- 'scrum', 'kanban', 'waterfall'
  workflow_config JSONB DEFAULT '{}', -- Column definitions, WIP limits, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Work items (tasks, stories, epics, etc.)
CREATE TABLE IF NOT EXISTS public.work_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'task', -- 'task', 'story', 'epic', 'bug', 'feature', 'milestone'
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  sprint_id UUID REFERENCES public.sprints(id),
  roadmap_item_id UUID REFERENCES public.roadmap_items(id),
  parent_id UUID REFERENCES public.work_items(id), -- For subtasks/hierarchies
  assignee_id UUID REFERENCES public.profiles(id),
  reporter_id UUID REFERENCES public.profiles(id),
  effort_estimate INTEGER DEFAULT 0, -- Story points, hours, or days
  effort_unit TEXT DEFAULT 'points', -- 'points', 'hours', 'days'
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  acceptance_criteria TEXT,
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  linked_feedback_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dependencies between work items
CREATE TABLE IF NOT EXISTS public.work_item_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_item_id UUID REFERENCES public.work_items(id) ON DELETE CASCADE,
  to_item_id UUID REFERENCES public.work_items(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'blocks', -- 'blocks', 'depends_on', 'relates_to'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_item_id, to_item_id, dependency_type)
);

-- Workflow columns (customizable for different methodologies)
CREATE TABLE IF NOT EXISTS public.workflow_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  wip_limit INTEGER, -- Work-in-progress limit for Kanban
  column_type TEXT DEFAULT 'standard', -- 'start', 'standard', 'end'
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Work item comments/activity
CREATE TABLE IF NOT EXISTS public.work_item_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_item_id UUID REFERENCES public.work_items(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'comment', -- 'comment', 'status_change', 'assignment'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Methodology templates for quick setup
CREATE TABLE IF NOT EXISTS public.methodology_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  methodology_type TEXT NOT NULL, -- 'scrum', 'kanban', 'waterfall', 'hybrid'
  description TEXT,
  default_columns JSONB NOT NULL, -- Default workflow columns
  default_statuses JSONB NOT NULL, -- Default work item statuses
  default_config JSONB DEFAULT '{}', -- Default methodology configurations
  is_system_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default methodology templates
INSERT INTO public.methodology_templates (name, methodology_type, description, default_columns, default_statuses, default_config, is_system_template) VALUES
('Scrum Board', 'scrum', 'Standard Scrum board with sprint management', 
 '[{"name": "Sprint Backlog", "position": 0, "color": "#6b7280"}, {"name": "In Progress", "position": 1, "color": "#3b82f6"}, {"name": "Review", "position": 2, "color": "#f59e0b"}, {"name": "Done", "position": 3, "color": "#10b981"}]',
 '["todo", "in_progress", "review", "done"]',
 '{"sprint_duration": 14, "velocity_tracking": true, "burndown_charts": true}',
 true),
('Kanban Board', 'kanban', 'Continuous flow Kanban board with WIP limits',
 '[{"name": "Backlog", "position": 0, "color": "#6b7280"}, {"name": "Ready", "position": 1, "color": "#8b5cf6", "wip_limit": 5}, {"name": "In Progress", "position": 2, "color": "#3b82f6", "wip_limit": 3}, {"name": "Review", "position": 3, "color": "#f59e0b", "wip_limit": 2}, {"name": "Done", "position": 4, "color": "#10b981"}]',
 '["backlog", "ready", "in_progress", "review", "done"]',
 '{"wip_limits": true, "cycle_time_tracking": true, "cumulative_flow": true}',
 true),
('Waterfall Project', 'waterfall', 'Sequential waterfall project management',
 '[{"name": "Requirements", "position": 0, "color": "#6b7280"}, {"name": "Design", "position": 1, "color": "#8b5cf6"}, {"name": "Development", "position": 2, "color": "#3b82f6"}, {"name": "Testing", "position": 3, "color": "#f59e0b"}, {"name": "Deployment", "position": 4, "color": "#10b981"}]',
 '["requirements", "design", "development", "testing", "deployment"]',
 '{"milestone_tracking": true, "gantt_view": true, "baseline_comparison": true}',
 true);

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_item_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.methodology_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for teams
CREATE POLICY "Users can view teams they're members of" ON public.teams FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.team_memberships WHERE team_id = id AND user_id = auth.uid() AND status = 'active')
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Team members can manage teams" ON public.teams FOR ALL USING (
  EXISTS (SELECT 1 FROM public.team_memberships WHERE team_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active')
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create policies for projects
CREATE POLICY "Users can view team projects" ON public.projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.team_memberships WHERE team_id = projects.team_id AND user_id = auth.uid() AND status = 'active')
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Team members can manage projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.team_memberships WHERE team_id = projects.team_id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'product_manager') AND status = 'active')
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create policies for sprints
CREATE POLICY "Users can view team sprints" ON public.sprints FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    JOIN public.team_memberships tm ON p.team_id = tm.team_id 
    WHERE p.id = sprints.project_id AND tm.user_id = auth.uid() AND tm.status = 'active'
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Team members can manage sprints" ON public.sprints FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    JOIN public.team_memberships tm ON p.team_id = tm.team_id 
    WHERE p.id = sprints.project_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin', 'product_manager', 'developer') AND tm.status = 'active'
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create policies for work items
CREATE POLICY "Users can view team work items" ON public.work_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sprints s
    JOIN public.projects p ON s.project_id = p.id
    JOIN public.team_memberships tm ON p.team_id = tm.team_id 
    WHERE s.id = work_items.sprint_id AND tm.user_id = auth.uid() AND tm.status = 'active'
  )
  OR assignee_id = auth.uid()
  OR reporter_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can manage assigned work items" ON public.work_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.sprints s
    JOIN public.projects p ON s.project_id = p.id
    JOIN public.team_memberships tm ON p.team_id = tm.team_id 
    WHERE s.id = work_items.sprint_id AND tm.user_id = auth.uid() AND tm.status = 'active'
  )
  OR assignee_id = auth.uid()
  OR reporter_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policies for other tables (similar pattern)
CREATE POLICY "Users can view dependencies" ON public.work_item_dependencies FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.work_items WHERE id = from_item_id AND (assignee_id = auth.uid() OR reporter_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM public.work_items WHERE id = to_item_id AND (assignee_id = auth.uid() OR reporter_id = auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can manage dependencies" ON public.work_item_dependencies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.work_items WHERE id = from_item_id AND (assignee_id = auth.uid() OR reporter_id = auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view methodology templates" ON public.methodology_templates FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON public.methodology_templates FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create update triggers
CREATE OR REPLACE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_sprints_updated_at BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_work_items_updated_at BEFORE UPDATE ON public.work_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();