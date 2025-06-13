
import { useState } from 'react';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import Strategy from '../components/Strategy';
import Roadmap from '../components/Roadmap';
import SprintBoard from '../components/SprintBoard';
import PRDGenerator from '../components/PRDGenerator';
import CustomerBoard from '../components/CustomerBoard';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'strategy':
        return <Strategy />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="transition-all duration-300">
        {renderModule()}
      </main>
    </div>
  );
};

export default Index;
