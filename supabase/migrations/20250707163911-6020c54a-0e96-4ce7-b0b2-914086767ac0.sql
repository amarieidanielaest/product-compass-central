-- Update Enterprise pricing to be more sustainable
UPDATE pricing_plans 
SET 
  price_monthly = 19999,  -- 199.99€ monthly
  price_yearly = 199999,  -- 1999.99€ yearly (save 16.7%)
  updated_at = now()
WHERE name = 'Enterprise' AND is_active = true;