-- Ensure the real user has admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('afae4ea9-4d63-4615-b2f2-7b9c1871e40d', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Create organization memberships for the real user
INSERT INTO public.organization_memberships (
  id,
  organization_id, 
  user_id, 
  role, 
  status,
  invited_by,
  joined_at
)
SELECT 
  gen_random_uuid(),
  o.id,
  'afae4ea9-4d63-4615-b2f2-7b9c1871e40d',
  'admin',
  'active',
  'afae4ea9-4d63-4615-b2f2-7b9c1871e40d',
  now()
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.organization_memberships 
  WHERE organization_id = o.id 
  AND user_id = 'afae4ea9-4d63-4615-b2f2-7b9c1871e40d'
);

-- Create board memberships for existing boards (without status column)
INSERT INTO public.board_memberships (
  id,
  board_id,
  user_id,
  role,
  invited_by,
  joined_at
)
SELECT 
  gen_random_uuid(),
  cb.id,
  'afae4ea9-4d63-4615-b2f2-7b9c1871e40d',
  'admin',
  'afae4ea9-4d63-4615-b2f2-7b9c1871e40d',
  now()
FROM public.customer_boards cb
WHERE NOT EXISTS (
  SELECT 1 FROM public.board_memberships 
  WHERE board_id = cb.id 
  AND user_id = 'afae4ea9-4d63-4615-b2f2-7b9c1871e40d'
);

-- Add sample feedback items to existing boards
INSERT INTO public.feedback_items (
  id,
  title,
  description,
  status,
  priority,
  category,
  board_id,
  organization_id,
  submitted_by,
  votes_count,
  created_at
)
SELECT 
  gen_random_uuid(),
  'Improve Dashboard Performance',
  'The main dashboard takes too long to load. We need to optimize the queries and add caching.',
  'under_review',
  'high',
  'performance',
  cb.id,
  cb.organization_id,
  'afae4ea9-4d63-4615-b2f2-7b9c1871e40d',
  15,
  now() - interval '2 days'
FROM public.customer_boards cb
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.feedback_items (
  id,
  title,
  description,
  status,
  priority,
  category,
  board_id,
  organization_id,
  submitted_by,
  votes_count,
  created_at
)
SELECT 
  gen_random_uuid(),
  'Add Dark Mode Support',
  'Many users have requested a dark mode option for better usability in low-light environments.',
  'planned',
  'medium',
  'feature',
  cb.id,
  cb.organization_id,
  'afae4ea9-4d63-4615-b2f2-7b9c1871e40d',
  32,
  now() - interval '1 day'
FROM public.customer_boards cb
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.feedback_items (
  id,
  title,
  description,
  status,
  priority,
  category,
  board_id,
  organization_id,
  submitted_by,
  votes_count,
  created_at
)
SELECT 
  gen_random_uuid(),
  'Mobile App Crashes on iOS',
  'The mobile app crashes frequently on iOS 17+ devices when trying to access the settings page.',
  'in_progress',
  'critical',
  'bug',
  cb.id,
  cb.organization_id,
  'afae4ea9-4d63-4615-b2f2-7b9c1871e40d',
  8,
  now() - interval '3 hours'
FROM public.customer_boards cb
LIMIT 1
ON CONFLICT DO NOTHING;