
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AccessibilityManager } from '@/components/AccessibilityManager';
import { ErrorBoundaryEnhanced } from '@/components/ErrorBoundaryEnhanced';
import AppSidebar from '../components/AppSidebar';
import PageHeader from '../components/PageHeader';
import Dashboard from '../components/Dashboard';
import Strategy from '../components/Strategy';
import Roadmap from '../components/Roadmap';
import { AdaptableSprintBoard } from '../components/AdaptableSprintBoard';
import PRDGenerator from '../components/PRDGenerator';
import CustomerBoard from '../components/CustomerBoard';
import ProductManager from '../components/ProductManager';
import { SimplifiedCustomerAdminDashboard } from '@/components/customer/SimplifiedCustomerAdminDashboard';
import UserManagement from '@/components/UserManagement';
import QuickActions from '../components/QuickActions';
import Settings from '../components/Settings';
import KnowledgeCenter from '../components/KnowledgeCenter';
import EnterpriseHub from '@/components/EnterpriseHub';
import CleanEnterpriseConsole from '@/components/CleanEnterpriseConsole';
import AICopilotDashboard from '@/components/AICopilotDashboard';
import { BoardContentManager } from '@/components/admin/BoardContentManager';

const Index = () => {
  console.log('Index component rendering');
  const [activeModule, setActiveModule] = useState('customer');
  const [selectedProductId, setSelectedProductId] = useState('main');

  const getModuleName = (moduleId: string) => {
    const moduleNames: Record<string, string> = {
      dashboard: 'Dashboard',
      products: 'Products',
      strategy: 'Strategy',
      roadmap: 'Roadmap',
      sprints: 'Sprint Board',
      prd: 'PRD Generator',
      customer: 'Customer Board',
      'customer-admin': 'Customer Admin',
      knowledge: 'Knowledge Center',
      'content-admin': 'Content Management',
      users: 'User Management',
      settings: 'Settings',
      phase4: 'Phase 4: Production Ready',
      enterprise: 'Enterprise Console',
      'ai-copilot': 'AI CoPilot',
    };
    return moduleNames[moduleId] || moduleId;
  };

  const getCurrentProduct = () => {
    if (selectedProductId === 'main') return 'Main Product';
    if (selectedProductId === 'beta') return 'Beta Product';
    return 'All Products';
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    
    // Add product context if not on products page
    if (activeModule !== 'products') {
      breadcrumbs.push({
        label: getCurrentProduct(),
        href: '#'
      });
    }
    
    // Add current module
    breadcrumbs.push({
      label: getModuleName(activeModule)
    });
    
    return breadcrumbs;
  };


  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
      case 'products':
        return <ProductManager onProductSelect={setSelectedProductId} selectedProductId={selectedProductId} />;
      case 'strategy':
        return <Strategy />;
      case 'roadmap':
        return <Roadmap />;
      case 'sprints':
        return <AdaptableSprintBoard key={`${activeModule}-${selectedProductId}`} />;
      case 'prd':
        return <PRDGenerator />;
      case 'customer':
        return <CustomerBoard selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
      case 'customer-admin':
        return <SimplifiedCustomerAdminDashboard />;
      case 'content-admin':
        return <BoardContentManager />;
      case 'knowledge':
        return <KnowledgeCenter />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings currentTeamId={selectedProductId} />;
      case 'enterprise':
        return <CleanEnterpriseConsole onNavigateBack={() => setActiveModule('dashboard')} />;
      case 'ai-copilot':
        return <AICopilotDashboard onNavigate={setActiveModule} />;
      default:
        return <CustomerBoard selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
    }
  };

  return (
    <ErrorBoundaryEnhanced level="page">
      <SidebarProvider>
        <div className="min-h-screen flex w-full font-body bg-background">
          <AppSidebar 
            activeModule={activeModule} 
            setActiveModule={setActiveModule}
            selectedProductId={selectedProductId}
            onProductChange={setSelectedProductId}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <PageHeader 
              title={getModuleName(activeModule)}
              breadcrumbs={getBreadcrumbs()}
            />
            <main className="flex-1 overflow-auto bg-background">
              <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
                <ErrorBoundaryEnhanced level="component">
                  {renderModule()}
                </ErrorBoundaryEnhanced>
              </div>
            </main>
          </div>
        </div>
        <AccessibilityManager />
      </SidebarProvider>
    </ErrorBoundaryEnhanced>
  );
};

export default Index;
