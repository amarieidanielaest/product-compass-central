-- Create teams table if not exists
CREATE TABLE IF NOT EXISTS public.teams_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table if not exists  
CREATE TABLE IF NOT EXISTS public.projects_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams_sprint(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  methodology_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sprints table if not exists
CREATE TABLE IF NOT EXISTS public.sprints_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects_sprint(id),
  name TEXT NOT NULL,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  capacity INTEGER DEFAULT 0,
  committed INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  workflow_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_items table if not exists
CREATE TABLE IF NOT EXISTS public.work_items_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID REFERENCES public.sprints_sprint(id),
  roadmap_item_id UUID,
  parent_id UUID REFERENCES public.work_items_sprint(id),
  assignee_id UUID,
  reporter_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'task',
  status TEXT NOT NULL DEFAULT 'todo', 
  priority TEXT NOT NULL DEFAULT 'medium',
  effort_estimate INTEGER DEFAULT 0,
  effort_unit TEXT DEFAULT 'points',
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

-- Create workflow_columns table if not exists
CREATE TABLE IF NOT EXISTS public.workflow_columns_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID REFERENCES public.sprints_sprint(id),
  name TEXT NOT NULL,
  column_type TEXT DEFAULT 'standard',
  color TEXT DEFAULT '#6b7280',
  position INTEGER NOT NULL,
  wip_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams_sprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_sprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints_sprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_items_sprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_columns_sprint ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teams
CREATE POLICY "Users can view teams they are members of" ON public.teams_sprint
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create teams" ON public.teams_sprint
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update teams" ON public.teams_sprint
FOR UPDATE USING (auth.uid() = owner_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view team projects" ON public.projects_sprint
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can manage projects" ON public.projects_sprint
FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for sprints
CREATE POLICY "Users can view sprints" ON public.sprints_sprint
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage sprints" ON public.sprints_sprint
FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for work items
CREATE POLICY "Users can view work items" ON public.work_items_sprint
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage work items" ON public.work_items_sprint
FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for workflow columns
CREATE POLICY "Users can view workflow columns" ON public.workflow_columns_sprint
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage workflow columns" ON public.workflow_columns_sprint
FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert sample data
INSERT INTO public.teams_sprint (id, name, description, owner_id) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Development Team', 'Main development team', auth.uid())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects_sprint (id, team_id, name, description, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Product Management Platform', 'Building the next-gen product management platform', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sprints_sprint (id, project_id, name, goal, status, start_date, end_date) VALUES 
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Sprint 1 - Core Features', 'Implement core sprint board functionality', 'active', '2024-01-01', '2024-01-14')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workflow_columns_sprint (sprint_id, name, position, color) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'To Do', 0, '#ef4444'),
('550e8400-e29b-41d4-a716-446655440002', 'In Progress', 1, '#f59e0b'), 
('550e8400-e29b-41d4-a716-446655440002', 'Review', 2, '#3b82f6'),
('550e8400-e29b-41d4-a716-446655440002', 'Done', 3, '#10b981')
ON CONFLICT DO NOTHING;

INSERT INTO public.work_items_sprint (sprint_id, title, description, item_type, status, priority) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'Setup Sprint Board UI', 'Create the main sprint board interface with drag and drop', 'story', 'todo', 'high'),
('550e8400-e29b-41d4-a716-446655440002', 'Implement Work Item Cards', 'Design and build work item cards with all metadata', 'story', 'in-progress', 'high'),
('550e8400-e29b-41d4-a716-446655440002', 'Add Sprint Analytics', 'Build analytics dashboard for sprint metrics', 'story', 'todo', 'medium'),
('550e8400-e29b-41d4-a716-446655440002', 'Sprint Planning Tools', 'Create planning interface for sprint setup', 'story', 'todo', 'medium')
ON CONFLICT DO NOTHING;