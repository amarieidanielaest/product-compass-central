-- First, make price_monthly and price_yearly nullable to support custom pricing
ALTER TABLE pricing_plans ALTER COLUMN price_monthly DROP NOT NULL;

-- Add new columns for per-user pricing model
ALTER TABLE pricing_plans 
ADD COLUMN IF NOT EXISTS price_per_user_monthly integer,
ADD COLUMN IF NOT EXISTS price_per_user_yearly integer,
ADD COLUMN IF NOT EXISTS min_users integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_users integer,
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS is_custom_pricing boolean DEFAULT false;

-- Update Free plan
UPDATE pricing_plans SET 
  price_per_user_monthly = NULL,
  price_per_user_yearly = NULL,
  min_users = 1,
  max_users = 3,
  billing_cycle = 'free',
  is_custom_pricing = false
WHERE name = 'Free';

-- Update Pro plan to become Team plan
UPDATE pricing_plans SET 
  name = 'Team',
  description = 'Perfect for growing teams',
  price_monthly = NULL, -- Remove fixed pricing
  price_yearly = NULL,  -- Remove fixed pricing
  price_per_user_monthly = 2400, -- €24/user/month
  price_per_user_yearly = 23040, -- €24 * 12 * 0.8 (20% discount)
  min_users = 5,
  max_users = 25,
  billing_cycle = 'annual_preferred',
  is_custom_pricing = false,
  features = '["All Free features", "Unlimited dashboards", "Standard integrations", "Team permissions", "Priority email support", "Advanced collaboration tools"]'::jsonb
WHERE name = 'Pro';

-- Update Enterprise plan to become Business plan
UPDATE pricing_plans SET 
  name = 'Business',
  description = 'Advanced features for growing teams',
  price_monthly = NULL, -- Remove fixed pricing
  price_yearly = NULL,  -- Remove fixed pricing
  price_per_user_monthly = 4500, -- €45/user/month  
  price_per_user_yearly = 43200, -- €45 * 12 * 0.8 (20% discount)
  min_users = 20,
  max_users = NULL,
  billing_cycle = 'annual_preferred',
  is_custom_pricing = false,
  features = '["All Team features", "Advanced analytics", "SSO authentication", "API access", "Priority support", "50,000 API calls included", "Custom integrations", "Advanced security"]'::jsonb
WHERE name = 'Enterprise';