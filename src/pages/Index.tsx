
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '../components/AppSidebar';
import Dashboard from '../components/Dashboard';
import Strategy from '../components/Strategy';
import Roadmap from '../components/Roadmap';
import SprintBoard from '../components/SprintBoard';
import PRDGenerator from '../components/PRDGenerator';
import CustomerBoard from '../components/CustomerBoard';
import ProductManager from '../components/ProductManager';
import UserManagement from '../components/UserManagement';
import BreadcrumbNav from '../components/BreadcrumbNav';
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

  const getBreadcrumbItems = () => {
    return [{ label: getModuleName(activeModule) }];
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <AppSidebar 
          activeModule={activeModule} 
          setActiveModule={setActiveModule}
          selectedProductId={selectedProductId}
          onProductChange={setSelectedProductId}
        />
        <main className="flex-1 transition-all duration-300 overflow-hidden">
          <div className="h-full overflow-auto">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-8">
              <div className="space-y-4 sm:space-y-6">
                <BreadcrumbNav 
                  items={getBreadcrumbItems()}
                  currentProduct={getCurrentProduct()}
                />
                <div className="block sm:hidden">
                  <QuickActions 
                    currentModule={activeModule}
                    onNavigate={setActiveModule}
                  />
                </div>
                <div className="hidden sm:block">
                  <QuickActions 
                    currentModule={activeModule}
                    onNavigate={setActiveModule}
                  />
                </div>
                <div className="w-full">
                  {renderModule()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
