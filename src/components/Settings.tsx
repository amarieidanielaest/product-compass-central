import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Users, 
  DollarSign, 
  Shield, 
  Crown,
  Zap,
  Palette,
  Globe,
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
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');

  const settingSections = [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Account overview and quick actions',
      icon: SettingsIcon,
      category: 'account'
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      description: 'Manage your subscription and billing',
      icon: CreditCard,
      category: 'account'
    },
    {
      id: 'pricing',
      title: 'Pricing Plans',
      description: 'View and change your plan',
      icon: DollarSign,
      category: 'account'
    },
    {
      id: 'teams',
      title: 'Team Management',
      description: 'Manage team members and permissions',
      icon: Users,
      category: 'collaboration'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect external tools and services',
      icon: Zap,
      category: 'configuration',
      comingSoon: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: Bell,
      category: 'configuration',
      comingSoon: true
    },
    ...(hasRole('admin') ? [
      {
        id: 'admin' as const,
        title: 'Admin Dashboard',
        description: 'System administration and analytics',
        icon: Crown,
        category: 'admin' as const
      },
      {
        id: 'users' as const,
        title: 'User Management',
        description: 'Manage all users and roles',
        icon: Shield,
        category: 'admin' as const
      }
    ] : [])
  ];

  const categories = {
    account: 'Account & Billing',
    collaboration: 'Team & Collaboration',
    configuration: 'Configuration',
    admin: 'Administration'
  };

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'overview':
        return <SettingsOverview user={user} profile={profile} currentTeamId={currentTeamId} />;
      case 'billing':
        return <BillingManagement teamId={currentTeamId} />;
      case 'pricing':
        return <PricingPlans currentTeamId={currentTeamId} />;
      case 'teams':
        return currentTeamId ? <TeamManagement teamId={currentTeamId} /> : <NoTeamSelected />;
      case 'admin':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'integrations':
        return <ComingSoonSection title="Integrations" description="Connect your favorite tools and automate workflows" />;
      case 'notifications':
        return <ComingSoonSection title="Notifications" description="Customize how and when you receive notifications" />;
      default:
        return <SettingsOverview user={user} profile={profile} currentTeamId={currentTeamId} />;
    }
  };

  const getCurrentSectionTitle = () => {
    const section = settingSections.find(s => s.id === activeSection);
    return section?.title || 'Settings';
  };

  return (
    <div className="flex h-full">
      {/* Settings Navigation */}
      <div className="w-80 border-r bg-muted/30 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account, team, and preferences
            </p>
          </div>

          {Object.entries(categories).map(([categoryKey, categoryTitle]) => {
            const sectionsInCategory = settingSections.filter(s => s.category === categoryKey);
            
            if (sectionsInCategory.length === 0) return null;

            return (
              <div key={categoryKey} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {categoryTitle}
                </h3>
                <div className="space-y-1">
                  {sectionsInCategory.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setActiveSection(section.id as SettingsSection)}
                    >
                      <div className="flex items-start space-x-3">
                        <section.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{section.title}</span>
                            {section.comingSoon && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Soon
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{getCurrentSectionTitle()}</h1>
          </div>
          {renderSettingsContent()}
        </div>
      </div>
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