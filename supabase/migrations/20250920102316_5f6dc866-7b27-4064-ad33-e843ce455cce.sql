-- Create analytics tables for tracking events and metrics

-- Analytics events table to store all tracked events
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('user', 'product', 'business', 'plg', 'feedback')),
  action TEXT NOT NULL,
  feature TEXT,
  page TEXT,
  component TEXT,
  properties JSONB DEFAULT '{}',
  value NUMERIC,
  currency TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User metrics aggregation table
CREATE TABLE public.user_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  active_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  retention_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  churn_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  engagement_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Feature adoption metrics table
CREATE TABLE public.feature_adoption (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature TEXT NOT NULL,
  adoption_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('increasing', 'decreasing', 'stable')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(feature, date)
);

-- Product health metrics table
CREATE TABLE public.product_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_health DECIMAL(5,2) NOT NULL DEFAULT 0,
  performance_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  reliability_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  satisfaction_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  trends JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_action ON public.analytics_events(action);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_feature ON public.analytics_events(feature) WHERE feature IS NOT NULL;

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_adoption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own events" ON public.analytics_events 
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics events" ON public.analytics_events 
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own events" ON public.analytics_events 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user metrics" ON public.user_metrics 
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view user metrics" ON public.user_metrics 
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage feature adoption" ON public.feature_adoption 
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view feature adoption" ON public.feature_adoption 
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage product health" ON public.product_health 
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view product health" ON public.product_health 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_analytics()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_metrics_updated_at
  BEFORE UPDATE ON public.user_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_analytics();

CREATE TRIGGER update_feature_adoption_updated_at
  BEFORE UPDATE ON public.feature_adoption
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_analytics();

CREATE TRIGGER update_product_health_updated_at
  BEFORE UPDATE ON public.product_health
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_analytics();