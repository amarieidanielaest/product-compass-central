
import { BarChart3, Target, Map, MessageSquare, Home, FileText, Kanban, Package } from 'lucide-react';
import ProductSelector from './ProductSelector';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  selectedProductId?: string;
  onProductChange?: (productId: string) => void;
}

const Navigation = ({ activeModule, setActiveModule, selectedProductId, onProductChange }: NavigationProps) => {
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'strategy', name: 'Strategy', icon: Target },
    { id: 'roadmap', name: 'Roadmap', icon: Map },
    { id: 'sprints', name: 'Sprint Board', icon: Kanban },
    { id: 'prd', name: 'PRD Generator', icon: FileText },
    { id: 'customer', name: 'Customer Board', icon: MessageSquare },
  ];

  // Mock products data - in a real app this would come from a proper state management solution
  const mockProducts = [
    { id: 'main', name: 'Main Product', status: 'active' as const },
    { id: 'beta', name: 'Beta Product', status: 'beta' as const },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm'
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
            {selectedProductId && onProductChange && (
              <ProductSelector
                products={mockProducts}
                selectedProductId={selectedProductId}
                onProductChange={onProductChange}
              />
            )}
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
