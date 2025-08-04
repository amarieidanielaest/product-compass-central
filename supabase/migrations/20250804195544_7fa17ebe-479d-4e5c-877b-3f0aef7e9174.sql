-- Create sprint-related tables for the enhanced sprint board

-- Teams table for sprint management
CREATE TABLE IF NOT EXISTS public.teams_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projects table for sprint management  
CREATE TABLE IF NOT EXISTS public.projects_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams_sprint(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  methodology_type TEXT NOT NULL DEFAULT 'scrum',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sprints table for sprint management
CREATE TABLE IF NOT EXISTS public.sprints_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects_sprint(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  capacity INTEGER DEFAULT 0,
  committed INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Work items table for sprint management
CREATE TABLE IF NOT EXISTS public.work_items_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID REFERENCES public.sprints_sprint(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'task',
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  effort_estimate INTEGER DEFAULT 0,
  assignee_id UUID REFERENCES public.profiles(id),
  reporter_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflow columns table for sprint management
CREATE TABLE IF NOT EXISTS public.workflow_columns_sprint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID REFERENCES public.sprints_sprint(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  wip_limit INTEGER,
  column_type TEXT DEFAULT 'standard',
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams_sprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_sprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints_sprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_items_sprint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_columns_sprint ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams_sprint
CREATE POLICY "Users can view teams" ON public.teams_sprint FOR SELECT USING (true);
CREATE POLICY "Users can manage teams" ON public.teams_sprint FOR ALL USING (true);

-- RLS Policies for projects_sprint
CREATE POLICY "Users can view projects" ON public.projects_sprint FOR SELECT USING (true);
CREATE POLICY "Users can manage projects" ON public.projects_sprint FOR ALL USING (true);

-- RLS Policies for sprints_sprint
CREATE POLICY "Users can view sprints" ON public.sprints_sprint FOR SELECT USING (true);
CREATE POLICY "Users can manage sprints" ON public.sprints_sprint FOR ALL USING (true);

-- RLS Policies for work_items_sprint
CREATE POLICY "Users can view work items" ON public.work_items_sprint FOR SELECT USING (true);
CREATE POLICY "Users can manage work items" ON public.work_items_sprint FOR ALL USING (true);

-- RLS Policies for workflow_columns_sprint
CREATE POLICY "Users can view workflow columns" ON public.workflow_columns_sprint FOR SELECT USING (true);
CREATE POLICY "Users can manage workflow columns" ON public.workflow_columns_sprint FOR ALL USING (true);

-- Insert sample data
INSERT INTO public.teams_sprint (id, name, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'Product Team', 'Main product development team'),
('22222222-2222-2222-2222-222222222222', 'Engineering Team', 'Core engineering team');

INSERT INTO public.projects_sprint (id, team_id, name, description, methodology_type) VALUES 
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Web Platform', 'Main web platform project', 'scrum'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Mobile App', 'Mobile application project', 'kanban');

INSERT INTO public.sprints_sprint (id, project_id, name, goal, start_date, end_date, status, capacity, committed, completed) VALUES 
('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Sprint 1', 'Implement user authentication', '2024-08-01', '2024-08-14', 'active', 40, 35, 20),
('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Sprint 2', 'Build dashboard features', '2024-08-15', '2024-08-28', 'planned', 40, 0, 0);

INSERT INTO public.workflow_columns_sprint (sprint_id, name, position, wip_limit) VALUES 
('55555555-5555-5555-5555-555555555555', 'To Do', 0, NULL),
('55555555-5555-5555-5555-555555555555', 'In Progress', 1, 3),
('55555555-5555-5555-5555-555555555555', 'Review', 2, 2),
('55555555-5555-5555-5555-555555555555', 'Done', 3, NULL);

INSERT INTO public.work_items_sprint (sprint_id, title, description, item_type, status, priority, effort_estimate) VALUES 
('55555555-5555-5555-5555-555555555555', 'Implement login form', 'Create responsive login form with validation', 'story', 'done', 'high', 8),
('55555555-5555-5555-5555-555555555555', 'Setup authentication API', 'Configure backend authentication endpoints', 'task', 'done', 'high', 13),
('55555555-5555-5555-5555-555555555555', 'Design user dashboard', 'Create wireframes and mockups for dashboard', 'task', 'in-progress', 'medium', 5),
('55555555-5555-5555-5555-555555555555', 'Implement password reset', 'Add password reset functionality', 'story', 'todo', 'medium', 8),
('55555555-5555-5555-5555-555555555555', 'Write unit tests', 'Add comprehensive test coverage', 'task', 'todo', 'low', 3);