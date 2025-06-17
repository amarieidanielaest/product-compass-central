
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  action?: () => void;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  currentProduct?: string;
}

const BreadcrumbNav = ({ items, currentProduct }: BreadcrumbNavProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
      <Home className="w-4 h-4" />
      {currentProduct && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-purple-600">{currentProduct}</span>
        </>
      )}
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4" />
          {item.action ? (
            <Button 
              variant="link" 
              className="h-auto p-0 text-slate-600 hover:text-slate-900"
              onClick={item.action}
            >
              {item.label}
            </Button>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;
