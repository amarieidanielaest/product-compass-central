-- Create customer access requests table for managing access to private boards
CREATE TABLE public.customer_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.customer_boards(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  job_title TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customer notifications table for real-time updates
CREATE TABLE public.customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id UUID NOT NULL REFERENCES public.customer_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feedback_status_change', 'roadmap_update', 'board_announcement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.customer_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer_access_requests
CREATE POLICY "Admins can manage all access requests" ON public.customer_access_requests
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Board admins can manage requests for their boards" ON public.customer_access_requests
  FOR ALL USING (
    board_id IN (
      SELECT cb.id FROM public.customer_boards cb
      WHERE cb.organization_id IN (
        SELECT om.organization_id FROM public.organization_memberships om
        WHERE om.user_id = auth.uid() AND om.role = 'admin'
      )
    )
  );

-- RLS policies for customer_notifications  
CREATE POLICY "Customer users can view their own notifications" ON public.customer_notifications
  FOR SELECT USING (customer_user_id = auth.uid());

CREATE POLICY "Customer users can update their own notifications" ON public.customer_notifications
  FOR UPDATE USING (customer_user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_customer_access_requests_updated_at
    BEFORE UPDATE ON public.customer_access_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_customer_access_requests_board_id ON public.customer_access_requests(board_id);
CREATE INDEX idx_customer_access_requests_status ON public.customer_access_requests(status);
CREATE INDEX idx_customer_access_requests_email ON public.customer_access_requests(email);
CREATE INDEX idx_customer_notifications_customer_user_id ON public.customer_notifications(customer_user_id);
CREATE INDEX idx_customer_notifications_read ON public.customer_notifications(read);
CREATE INDEX idx_customer_notifications_created_at ON public.customer_notifications(created_at);