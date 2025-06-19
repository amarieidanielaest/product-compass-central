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
import BreadcrumbNav from '../components/BreadcrumbNav';
import QuickActions from '../components/QuickActions';

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
        return <Dashboard />;
      case 'products':
        return <ProductManager onProductSelect={setSelectedProductId} selectedProductId={selectedProductId} />;
      case 'strategy':
        return <Strategy selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
      case 'roadmap':
        return <Roadmap selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
      case 'sprints':
        return <SprintBoard selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
      case 'prd':
        return <PRDGenerator />;
      case 'customer':
        return <CustomerBoard selectedProductId={selectedProductId} onNavigate={setActiveModule} />;
      default:
        return <Dashboard />;
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
              <BreadcrumbNav 
                items={getBreadcrumbItems()}
                currentProduct={getCurrentProduct()}
              />
              <QuickActions 
                currentModule={activeModule}
                onNavigate={setActiveModule}
              />
              {renderModule()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
