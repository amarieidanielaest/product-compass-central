
import { BarChart3, Target, Map, MessageSquare, Home, FileText, Kanban } from 'lucide-react';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const Navigation = ({ activeModule, setActiveModule }: NavigationProps) => {
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'strategy', name: 'Strategy', icon: Target },
    { id: 'roadmap', name: 'Roadmap', icon: Map },
    { id: 'sprints', name: 'Sprint Board', icon: Kanban },
    { id: 'prd', name: 'PRD Generator', icon: FileText },
    { id: 'customer', name: 'Customer Board', icon: MessageSquare },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ProductHub
              </h1>
            </div>
            <div className="flex space-x-4">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeModule === module.id
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {module.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
