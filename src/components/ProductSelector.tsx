
import { ChevronDown, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  status: 'active' | 'development' | 'beta' | 'archived';
}

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductChange: (productId: string) => void;
}

const ProductSelector = ({ products, selectedProductId, onProductChange }: ProductSelectorProps) => {
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="relative group">
      <Button
        variant="outline"
        className="flex items-center space-x-2 min-w-[200px] justify-between bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-300"
      >
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium">
            {selectedProduct ? selectedProduct.name : 'Select Product'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-purple-600" />
      </Button>
      
      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-purple-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductChange(product.id)}
            className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
              selectedProductId === product.id ? 'bg-purple-100 text-purple-700' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{product.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                product.status === 'development' ? 'bg-amber-100 text-amber-700' :
                product.status === 'beta' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {product.status}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSelector;
