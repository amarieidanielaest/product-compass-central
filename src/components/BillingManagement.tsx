import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, Users, Settings, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PricingPlans from './PricingPlans';

interface TeamSubscription {
  id: string;
  name: string;
  subscription_status: string;
  subscription_end_date: string;
  pricing_plan: {
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    max_team_members: number;
    max_projects: number;
    features: any;
  };
}

interface BillingManagementProps {
  teamId?: string;
}

const BillingManagement = ({ teamId }: BillingManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [managingPortal, setManagingPortal] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeamSubscription();
    } else {
      setLoading(false);
      setShowPricingPlans(true);
    }
  }, [teamId]);

  const fetchTeamSubscription = async () => {
    if (!teamId) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          subscription_status,
          subscription_end_date,
          pricing_plan:pricing_plans(
            name,
            description,
            price_monthly,
            price_yearly,
            max_team_members,
            max_projects,
            features
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;
      
      if (data && data.pricing_plan) {
        data.pricing_plan.features = Array.isArray(data.pricing_plan.features) 
          ? data.pricing_plan.features 
          : JSON.parse(data.pricing_plan.features as string || '[]');
      }
      setTeam(data);
      
      // Show pricing plans if no active subscription
      if (!data.pricing_plan || data.subscription_status !== 'active') {
        setShowPricingPlans(true);
      }
    } catch (error) {
      console.error('Error fetching team subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { team_id: teamId },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive",
      });
    } finally {
      setManagingPortal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      canceled: { variant: 'destructive' as const, label: 'Canceled' },
      past_due: { variant: 'destructive' as const, label: 'Past Due' },
    };

    const config = variants[status as keyof typeof variants] || variants.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div>Loading billing information...</div>;
  }

  // Show pricing plans if no team or no active subscription
  if (showPricingPlans || !team?.pricing_plan) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground mt-2">
            {teamId ? 'Upgrade your team plan' : 'Select a plan to get started'}
          </p>
        </div>
        <PricingPlans 
          currentTeamId={teamId}
          onPlanSelected={(planId) => {
            toast({
              title: "Redirecting to checkout",
              description: "You'll be redirected to complete your subscription",
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Billing & Subscription</h2>
          <p className="text-muted-foreground">
            Manage your {team.name} subscription and billing
          </p>
        </div>
        <Button
          onClick={handleManageSubscription}
          disabled={managingPortal}
          variant="outline"
        >
          {managingPortal ? (
            'Loading...'
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Billing
            </>
          )}
        </Button>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Plan</span>
            {getStatusBadge(team.subscription_status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{team.pricing_plan.name} Plan</h3>
              <p className="text-muted-foreground">{team.pricing_plan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatPrice(team.pricing_plan.price_monthly)}
              </p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {team.pricing_plan.max_team_members === -1 
                  ? 'Unlimited members' 
                  : `${team.pricing_plan.max_team_members} members`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {team.pricing_plan.max_projects === -1 
                  ? 'Unlimited projects' 
                  : `${team.pricing_plan.max_projects} projects`}
              </span>
            </div>
            {team.subscription_end_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Renews {formatDate(team.subscription_end_date)}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Plan Features</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-muted-foreground">
              {team.pricing_plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upgrade Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Need more features or team members? Upgrade to a higher plan.
            </p>
            <Button 
              onClick={() => setShowPricingPlans(true)}
              className="w-full"
            >
              View Plans
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billing Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Update payment methods, download invoices, and manage your subscription.
            </p>
            <Button 
              onClick={handleManageSubscription}
              disabled={managingPortal}
              variant="outline"
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingManagement;