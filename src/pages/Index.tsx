
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '../components/AppSidebar';
import PageHeader from '../components/PageHeader';
import Dashboard from '../components/Dashboard';
import Strategy from '../components/Strategy';
import Roadmap from '../components/Roadmap';
import SprintBoard from '../components/SprintBoard';
import PRDGenerator from '../components/PRDGenerator';
import CustomerBoard from '../components/CustomerBoard';
import ProductManager from '../components/ProductManager';
import UserManagement from '../components/UserManagement';
import QuickActions from '../components/QuickActions';
import Settings from '../components/Settings';
import KnowledgeCenter from '../components/KnowledgeCenter';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
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
      settings: 'Settings',
    };
    return moduleNames[moduleId] || moduleId;
  };

  const getCurrentProduct = () => {
    if (selectedProductId === 'main') return 'Main Product';
    if (selectedProductId === 'beta') return 'Beta Product';
    return 'All Products';
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
        return <SprintBoard selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
      case 'prd':
        return <PRDGenerator />;
      case 'customer':
        return <CustomerBoard selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
      case 'settings':
        return <Settings currentTeamId={selectedProductId} />;
      default:
        return <Dashboard selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full font-body">
        <AppSidebar 
          activeModule={activeModule} 
          setActiveModule={setActiveModule}
          selectedProductId={selectedProductId}
          onProductChange={setSelectedProductId}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <PageHeader 
            title={getModuleName(activeModule)}
            subtitle={`Current Product: ${getCurrentProduct()}`}
          />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              <div className="space-y-6">
                {/* Page Content */}
                <div className="w-full">
                  {renderModule()}
                </div>
                
                {/* Quick Actions - Moved to bottom */}
                <div className="border-t border-border/40 pt-6">
                  <QuickActions 
                    currentModule={activeModule}
                    onNavigate={setActiveModule}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
