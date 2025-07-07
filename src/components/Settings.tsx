import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Users, 
  DollarSign, 
  Shield, 
  Crown,
  Zap,
  Bell,
  ChevronRight,
  Building,
  Lock,
  Key,
  AlertTriangle,
  FileText,
  Code,
  Webhook,
  MessageSquare
} from 'lucide-react';
import PricingPlans from './PricingPlans';
import BillingManagement from './BillingManagement';
import TeamManagement from './TeamManagement';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import KnowledgeCenter from './KnowledgeCenter';

type SettingsSection = 
  | 'overview' 
  | 'billing' 
  | 'pricing' 
  | 'teams' 
  | 'admin' 
  | 'users'
  | 'integrations'
  | 'notifications'
  | 'organization'
  | 'security'
  | 'api'
  | 'webhooks'
  | 'danger'
  | 'help';

interface SettingsProps {
  currentTeamId?: string;
}

interface SidebarSection {
  title: string;
  items: Array<{
    id: SettingsSection;
    title: string;
    icon: any;
    description?: string;
    comingSoon?: boolean;
    requiresAdmin?: boolean;
  }>;
}

const Settings = ({ currentTeamId }: SettingsProps) => {
  const { user, hasRole, profile } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');
  const isMobile = useIsMobile();

  const sidebarSections: SidebarSection[] = [
    {
      title: 'Account & Billing',
      items: [
        { 
          id: 'overview', 
          title: 'Overview', 
          icon: SettingsIcon,
          description: 'Account information and quick actions'
        },
        { 
          id: 'billing', 
          title: 'Billing', 
          icon: CreditCard,
          description: 'Manage your subscription and payment methods'
        },
        { 
          id: 'pricing', 
          title: 'Plans', 
          icon: DollarSign,
          description: 'View and upgrade your pricing plan'
        },
      ]
    },
    {
      title: 'Team & Organization',
      items: [
        { 
          id: 'teams', 
          title: 'Team Management', 
          icon: Users,
          description: 'Manage team members and permissions'
        },
        { 
          id: 'organization', 
          title: 'Organization Access', 
          icon: Building,
          description: 'Organization-wide settings and access controls',
          comingSoon: true
        },
      ]
    },
    {
      title: 'Security & Access',
      items: [
        { 
          id: 'security', 
          title: 'Auth & Security', 
          icon: Lock,
          description: 'SSO, 2FA, and security settings',
          comingSoon: true
        },
      ]
    },
    {
      title: 'Integrations',
      items: [
        { 
          id: 'integrations', 
          title: 'Integrations', 
          icon: Zap,
          description: 'Connect with external tools and services'
        },
        { 
          id: 'notifications', 
          title: 'Notifications', 
          icon: Bell,
          description: 'Configure notification preferences',
          comingSoon: true
        },
        { 
          id: 'api', 
          title: 'API', 
          icon: Code,
          description: 'API keys and documentation',
          comingSoon: true
        },
        { 
          id: 'webhooks', 
          title: 'Webhooks', 
          icon: Webhook,
          description: 'Configure webhook endpoints',
          comingSoon: true
        },
      ]
    },
    {
      title: 'Admin',
      items: [
        { 
          id: 'admin', 
          title: 'Admin Dashboard', 
          icon: Crown,
          description: 'System administration and analytics',
          requiresAdmin: true
        },
        { 
          id: 'users', 
          title: 'User Management', 
          icon: Shield,
          description: 'Manage users and roles',
          requiresAdmin: true
        },
      ]
    },
    {
      title: 'Advanced',
      items: [
        { 
          id: 'danger', 
          title: 'Danger Zone', 
          icon: AlertTriangle,
          description: 'Destructive actions and account deletion',
          comingSoon: true
        },
      ]
    },
    {
      title: 'Resources',
      items: [
        { 
          id: 'help', 
          title: 'Help Center', 
          icon: MessageSquare,
          description: 'Documentation and support resources'
        },
      ]
    }
  ];

  const visibleSections = sidebarSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      !item.requiresAdmin || hasRole('admin')
    )
  })).filter(section => section.items.length > 0);

  const renderContent = () => {
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
      case 'help':
        return <KnowledgeCenter />;
      case 'integrations':
        return <IntegrationsSection />;
      default:
        return <ComingSoonSection 
          title={visibleSections.flatMap(s => s.items).find(i => i.id === activeSection)?.title || 'Coming Soon'} 
          description={visibleSections.flatMap(s => s.items).find(i => i.id === activeSection)?.description || 'This feature is coming soon'} 
        />;
    }
  };

  if (isMobile) {
    // Mobile view with dropdown selector
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, team, and preferences
          </p>
        </div>
        <div className="space-y-4">
          {visibleSections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.items.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(item.id)}
                    disabled={item.comingSoon}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                    {item.comingSoon && (
                      <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Desktop view with sidebar
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, team, and preferences
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-6">
            {visibleSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => !item.comingSoon && setActiveSection(item.id)}
                      disabled={item.comingSoon}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group",
                        activeSection === item.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground",
                        item.comingSoon && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.comingSoon && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            Soon
                          </span>
                        )}
                        {!item.comingSoon && (
                          <ChevronRight className={cn(
                            "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                            activeSection === item.id && "opacity-100"
                          )} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {renderContent()}
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
              <p className="text-sm text-muted-foreground">Enterprise Plan</p>
            </div>
            <Button>Manage Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Integrations Section Component
const IntegrationsSection = () => {
  const integrations = [
    { name: 'Zapier', description: 'Automate workflows with 5000+ apps', color: 'bg-orange-500', buttonText: 'Get API Key' },
    { name: 'Segment', description: 'Customer data platform', color: 'bg-green-500', buttonText: 'Set your API key' },
    { name: 'Intercom', description: 'Customer messaging platform', color: 'bg-blue-500', buttonText: 'Connect to Intercom', buttons: ['Customize card', 'Customize feedback page'] },
    { name: 'Linear', description: 'Issue tracking for modern teams', color: 'bg-purple-500', buttonText: 'Connect to Linear' },
    { name: 'Slack', description: 'Team collaboration hub', color: 'bg-green-600', buttonText: 'Configure Slack' },
    { name: 'Jira', description: 'Project management tool', color: 'bg-blue-600', buttonText: 'Configure Jira' },
    { name: 'ClickUp', description: 'All-in-one workspace', color: 'bg-pink-500', buttonText: 'Connect to ClickUp' },
    { name: 'Discord', description: 'Voice, video and text communication', color: 'bg-indigo-500', buttonText: 'Configure Discord' },
    { name: 'Zendesk', description: 'Customer service platform', color: 'bg-gray-600', buttonText: 'Configure Zendesk' },
    { name: 'GitHub', description: 'Code repository hosting', color: 'bg-gray-800', buttonText: 'Connect to GitHub' },
    { name: 'Azure DevOps', description: 'Development collaboration tools', color: 'bg-blue-700', buttonText: 'Talk to Sales' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Learn more about each integration and view the documentation{' '}
          <span className="text-primary cursor-pointer hover:underline">here</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.name} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded ${integration.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {integration.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {integration.buttons?.map((buttonText) => (
                  <Button key={buttonText} variant="outline" size="sm">
                    {buttonText}
                  </Button>
                ))}
                <Button 
                  variant={integration.name === 'Azure DevOps' ? 'default' : 'default'} 
                  size="sm"
                  className={integration.name === 'Azure DevOps' ? 'bg-pink-600 hover:bg-pink-700' : ''}
                >
                  {integration.buttonText}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
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
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-4">
        <Zap className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
        Coming Soon
      </div>
    </CardContent>
  </Card>
);

export default Settings;