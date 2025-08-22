-- Now create the profile and memberships with the correct user ID
INSERT INTO public.profiles (id, email, first_name, last_name)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', 
  'admin@enterprise.com', 
  'John', 
  'Enterprise'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Ensure the user has admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Create organization membership for the mock user
INSERT INTO public.organization_memberships (
  id,
  organization_id, 
  user_id, 
  role, 
  status,
  invited_by,
  joined_at
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.organizations LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  'active',
  '550e8400-e29b-41d4-a716-446655440000',
  now()
) ON CONFLICT DO NOTHING;

-- Create board memberships for existing boards
INSERT INTO public.board_memberships (
  id,
  board_id,
  user_id,
  role,
  status,
  invited_by,
  joined_at
)
SELECT 
  gen_random_uuid(),
  cb.id,
  '550e8400-e29b-41d4-a716-446655440000',
  'admin',
  'active',
  '550e8400-e29b-41d4-a716-446655440000',
  now()
FROM public.customer_boards cb
WHERE NOT EXISTS (
  SELECT 1 FROM public.board_memberships 
  WHERE board_id = cb.id 
  AND user_id = '550e8400-e29b-41d4-a716-446655440000'
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
  '550e8400-e29b-41d4-a716-446655440000',
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
  '550e8400-e29b-41d4-a716-446655440000',
  32,
  now() - interval '1 day'
FROM public.customer_boards cb
LIMIT 1
ON CONFLICT DO NOTHING;