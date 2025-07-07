-- First, let's update the existing pricing_plans table to support the new hybrid model
ALTER TABLE pricing_plans 
ADD COLUMN price_per_user_monthly integer,
ADD COLUMN price_per_user_yearly integer,
ADD COLUMN min_users integer DEFAULT 1,
ADD COLUMN max_users integer,
ADD COLUMN billing_cycle text DEFAULT 'monthly',
ADD COLUMN is_custom_pricing boolean DEFAULT false;

-- Update existing plans to new structure
UPDATE pricing_plans SET 
  price_per_user_monthly = NULL,
  price_per_user_yearly = NULL,
  min_users = 1,
  max_users = 3,
  billing_cycle = 'monthly'
WHERE name = 'Free';

UPDATE pricing_plans SET 
  price_per_user_monthly = 2400, -- €24/user/month
  price_per_user_yearly = 23040, -- €24 * 12 * 0.8 (20% discount for annual)
  min_users = 5,
  max_users = 25,
  billing_cycle = 'annual_preferred'
WHERE name = 'Pro';

UPDATE pricing_plans SET 
  name = 'Business',
  description = 'Advanced features for growing teams',
  price_per_user_monthly = 4500, -- €45/user/month  
  price_per_user_yearly = 43200, -- €45 * 12 * 0.8 (20% discount for annual)
  min_users = 20,
  max_users = NULL, -- No upper limit
  billing_cycle = 'annual_preferred',
  features = '["All Team features", "Advanced analytics", "SSO authentication", "API access", "Priority support", "50,000 API calls included", "Custom integrations", "Advanced security"]'::jsonb
WHERE name = 'Enterprise';

-- Create new Team plan (rename Pro to Team)
UPDATE pricing_plans SET 
  name = 'Team',
  description = 'Perfect for growing teams',
  features = '["All Free features", "Unlimited dashboards", "Standard integrations", "Team permissions", "Priority email support", "Advanced collaboration tools"]'::jsonb
WHERE name = 'Pro';

-- Add new Enterprise plan with custom pricing
INSERT INTO pricing_plans (name, description, price_monthly, price_yearly, price_per_user_monthly, price_per_user_yearly, min_users, max_users, features, is_custom_pricing, is_active)
VALUES (
  'Enterprise',
  'Custom solutions for large organizations',
  NULL, -- No fixed price
  NULL, -- No fixed price
  NULL, -- Custom per-user pricing
  NULL, -- Custom per-user pricing
  100,  -- Minimum 100 users
  NULL, -- No upper limit
  '["All Business features", "Dedicated account manager", "Security audits", "Uptime SLA", "Custom integrations", "Advanced compliance", "Custom onboarding", "24/7 phone support", "Custom contract terms"]'::jsonb,
  true, -- Custom pricing
  true
);

-- Create usage metrics table
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  description TEXT,
  cost_per_unit DECIMAL(10, 4) NOT NULL,
  unit_name TEXT NOT NULL, -- e.g., 'API call', 'GB', 'user'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create plan usage quotas table
CREATE TABLE public.plan_usage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES pricing_plans(id) ON DELETE CASCADE,
  metric_id UUID REFERENCES usage_metrics(id) ON DELETE CASCADE,
  included_quota BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_id, metric_id)
);

-- Enable RLS on new tables
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_usage_quotas ENABLE ROW LEVEL SECURITY;

-- Create policies for usage metrics (readable by everyone)
CREATE POLICY "Anyone can view usage metrics" ON public.usage_metrics FOR SELECT USING (true);

-- Create policies for plan usage quotas (readable by everyone)  
CREATE POLICY "Anyone can view plan usage quotas" ON public.plan_usage_quotas FOR SELECT USING (true);

-- Insert sample usage metrics
INSERT INTO usage_metrics (metric_name, description, cost_per_unit, unit_name) VALUES
('api_calls', 'API calls for automation and integrations', 0.0015, 'API call'),
('storage_gb', 'Additional data storage beyond included quota', 2.50, 'GB'),
('advanced_reports', 'Custom report generation', 5.00, 'report');

-- Insert usage quotas for Business plan (find the Business plan ID first)
INSERT INTO plan_usage_quotas (plan_id, metric_id, included_quota)
SELECT 
  p.id as plan_id,
  m.id as metric_id,
  CASE m.metric_name
    WHEN 'api_calls' THEN 50000
    WHEN 'storage_gb' THEN 100
    WHEN 'advanced_reports' THEN 10
  END as included_quota
FROM pricing_plans p
CROSS JOIN usage_metrics m
WHERE p.name = 'Business' AND m.metric_name IN ('api_calls', 'storage_gb', 'advanced_reports');