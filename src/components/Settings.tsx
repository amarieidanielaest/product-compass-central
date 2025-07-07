import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Users, 
  DollarSign, 
  Shield, 
  Crown,
  Zap,
  Bell
} from 'lucide-react';
import PricingPlans from './PricingPlans';
import BillingManagement from './BillingManagement';
import TeamManagement from './TeamManagement';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';

type SettingsSection = 
  | 'overview' 
  | 'billing' 
  | 'pricing' 
  | 'teams' 
  | 'admin' 
  | 'users'
  | 'integrations'
  | 'notifications';

interface SettingsProps {
  currentTeamId?: string;
}

const Settings = ({ currentTeamId }: SettingsProps) => {
  const { user, hasRole, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsSection>('overview');
  const isMobile = useIsMobile();

  // Group tabs by categories for better organization
  const accountTabs = [
    { id: 'overview', title: 'Overview', icon: SettingsIcon },
    { id: 'billing', title: 'Billing', icon: CreditCard },
    { id: 'pricing', title: 'Plans', icon: DollarSign },
  ];

  const teamTabs = [
    { id: 'teams', title: 'Team', icon: Users },
  ];

  const configTabs = [
    { id: 'integrations', title: 'Integrations', icon: Zap, comingSoon: true },
    { id: 'notifications', title: 'Notifications', icon: Bell, comingSoon: true },
  ];

  const adminTabs = hasRole('admin') ? [
    { id: 'admin', title: 'Admin', icon: Crown },
    { id: 'users', title: 'Users', icon: Shield },
  ] : [];

  const allTabs = [...accountTabs, ...teamTabs, ...configTabs, ...adminTabs];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, team, and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsSection)} className="w-full">
        <div className="mb-6 overflow-x-auto">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-1 h-auto p-1 bg-muted`}>
            {/* Account & Billing Group */}
            <div className={`${isMobile ? 'col-span-1' : 'col-span-1'} space-y-1`}>
              <div className="text-xs font-medium text-muted-foreground px-3 py-1">Account</div>
              {accountTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="w-full flex items-center justify-start gap-2 p-2 text-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className={isMobile ? 'hidden sm:inline' : ''}>{tab.title}</span>
                </TabsTrigger>
              ))}
            </div>

            {/* Team Group */}
            <div className={`${isMobile ? 'col-span-1' : 'col-span-1'} space-y-1`}>
              <div className="text-xs font-medium text-muted-foreground px-3 py-1">Team</div>
              {teamTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="w-full flex items-center justify-start gap-2 p-2 text-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className={isMobile ? 'hidden sm:inline' : ''}>{tab.title}</span>
                </TabsTrigger>
              ))}
            </div>

            {/* Configuration Group */}
            <div className={`${isMobile ? 'col-span-1' : 'col-span-1'} space-y-1`}>
              <div className="text-xs font-medium text-muted-foreground px-3 py-1">Config</div>
              {configTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="w-full flex items-center justify-start gap-2 p-2 text-sm relative"
                  disabled={tab.comingSoon}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className={isMobile ? 'hidden sm:inline' : ''}>{tab.title}</span>
                  {tab.comingSoon && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-auto">
                      Soon
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </div>

            {/* Admin Group */}
            {adminTabs.length > 0 && (
              <div className={`${isMobile ? 'col-span-1' : 'col-span-1'} space-y-1`}>
                <div className="text-xs font-medium text-muted-foreground px-3 py-1">Admin</div>
                {adminTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="w-full flex items-center justify-start gap-2 p-2 text-sm"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className={isMobile ? 'hidden sm:inline' : ''}>{tab.title}</span>
                  </TabsTrigger>
                ))}
              </div>
            )}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent value="overview" className="mt-0">
            <SettingsOverview user={user} profile={profile} currentTeamId={currentTeamId} />
          </TabsContent>

          <TabsContent value="billing" className="mt-0">
            <BillingManagement teamId={currentTeamId} />
          </TabsContent>

          <TabsContent value="pricing" className="mt-0">
            <PricingPlans currentTeamId={currentTeamId} />
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            {currentTeamId ? <TeamManagement teamId={currentTeamId} /> : <NoTeamSelected />}
          </TabsContent>

          <TabsContent value="integrations" className="mt-0">
            <ComingSoonSection title="Integrations" description="Connect your favorite tools and automate workflows" />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <ComingSoonSection title="Notifications" description="Customize how and when you receive notifications" />
          </TabsContent>

          {hasRole('admin') && (
            <>
              <TabsContent value="admin" className="mt-0">
                <AdminDashboard />
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <UserManagement />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

// Settings Overview Component
const SettingsOverview = ({ user, profile, currentTeamId }: any) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground">
                {profile?.first_name || profile?.last_name 
                  ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                  : 'Not set'
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Member since</label>
              <p className="text-sm text-muted-foreground">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Team Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Zap className="mr-2 h-4 w-4" />
              View Integrations
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">Free Plan</p>
            </div>
            <Button>Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper Components
const NoTeamSelected = () => (
  <Card>
    <CardContent className="pt-6 text-center">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Team Selected</h3>
      <p className="text-muted-foreground mb-4">
        Please select a team from the product selector to manage team settings.
      </p>
    </CardContent>
  </Card>
);

const ComingSoonSection = ({ title, description }: { title: string; description: string }) => (
  <Card>
    <CardContent className="pt-6 text-center">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
        <Zap className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
        Coming Soon
      </div>
    </CardContent>
  </Card>
);

export default Settings;