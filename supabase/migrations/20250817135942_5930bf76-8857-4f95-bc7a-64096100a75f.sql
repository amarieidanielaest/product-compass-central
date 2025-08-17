-- Create board_integrations table for integration settings
CREATE TABLE public.board_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(board_id, integration_type)
);

-- Enable RLS
ALTER TABLE public.board_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Board admins can manage integrations"
  ON public.board_integrations
  FOR ALL
  USING (
    board_id IN (
      SELECT cb.id 
      FROM customer_boards cb 
      WHERE cb.organization_id IN (
        SELECT om.organization_id
        FROM organization_memberships om
        WHERE om.user_id = auth.uid() AND om.role = 'admin'
      )
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );