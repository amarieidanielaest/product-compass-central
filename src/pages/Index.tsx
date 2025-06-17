
import { useState } from 'react';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import Strategy from '../components/Strategy';
import Roadmap from '../components/Roadmap';
import SprintBoard from '../components/SprintBoard';
import PRDGenerator from '../components/PRDGenerator';
import CustomerBoard from '../components/CustomerBoard';
import ProductManager from '../components/ProductManager';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState('main');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManager onProductSelect={setSelectedProductId} selectedProductId={selectedProductId} />;
      case 'strategy':
        return <Strategy selectedProductId={selectedProductId} />;
      case 'roadmap':
        return <Roadmap />;
      case 'sprints':
        return <SprintBoard />;
      case 'prd':
        return <PRDGenerator />;
      case 'customer':
        return <CustomerBoard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Navigation 
        activeModule={activeModule} 
        setActiveModule={setActiveModule}
        selectedProductId={selectedProductId}
        onProductChange={setSelectedProductId}
      />
      <main className="transition-all duration-300">
        {renderModule()}
      </main>
    </div>
  );
};

export default Index;
