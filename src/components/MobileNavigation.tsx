
import { useState } from 'react';
import { Menu, X, Package, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ProductSelector from './ProductSelector';

interface MobileNavigationProps {
  modules: Array<{ id: string; name: string; icon: any }>;
  activeModule: string;
  setActiveModule: (module: string) => void;
  selectedProductId: string;
  onProductChange: (productId: string) => void;
}

const MobileNavigation = ({ 
  modules, 
  activeModule, 
  setActiveModule,
  selectedProductId,
  onProductChange 
}: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const mockProducts = [
    { id: 'main', name: 'Main Product', status: 'active' as const },
    { id: 'beta', name: 'Beta Product', status: 'beta' as const },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ProductHub
            </h2>
          </div>
          
          <div className="mb-6">
            <ProductSelector
              products={mockProducts}
              selectedProductId={selectedProductId}
              onProductChange={onProductChange}
            />
          </div>
          
          <nav className="flex-1">
            <div className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      setActiveModule(module.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeModule === module.id
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {module.name}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
