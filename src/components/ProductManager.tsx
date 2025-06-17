
import { useState } from 'react';
import { Plus, Settings, Rocket, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'development' | 'beta' | 'archived';
  deploymentUrl?: string;
  lastDeployed?: string;
  users: number;
  revenue: string;
}

interface ProductManagerProps {
  onProductSelect: (productId: string) => void;
  selectedProductId: string;
}

const ProductManager = ({ onProductSelect, selectedProductId }: ProductManagerProps) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'main',
      name: 'Main Product',
      description: 'Primary product offering',
      status: 'active',
      deploymentUrl: 'https://main.yourproduct.com',
      lastDeployed: '2024-06-15',
      users: 1250,
      revenue: '$25K MRR'
    }
  ]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: ''
  });

  const addProduct = () => {
    if (newProduct.name && newProduct.description) {
      const product: Product = {
        id: `product-${Date.now()}`,
        name: newProduct.name,
        description: newProduct.description,
        status: 'development',
        users: 0,
        revenue: '$0'
      };
      setProducts([...products, product]);
      setNewProduct({ name: '', description: '' });
      setShowAddProduct(false);
    }
  };

  const deployProduct = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { 
            ...p, 
            deploymentUrl: `https://${p.name.toLowerCase().replace(/\s+/g, '-')}.yourproduct.com`,
            lastDeployed: new Date().toISOString().split('T')[0],
            status: 'active' as const
          }
        : p
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'development': return 'bg-amber-100 text-amber-700';
      case 'beta': return 'bg-blue-100 text-blue-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Product Portfolio
          </h2>
          <p className="text-slate-600">Manage your product ecosystem with unified strategy</p>
        </div>
        <Button 
          onClick={() => setShowAddProduct(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* PLG Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Products</p>
                <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              </div>
              <Settings className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.reduce((sum, p) => sum + p.users, 0).toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Products</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Rocket className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total MRR</p>
                <p className="text-2xl font-bold text-slate-900">$125K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedProductId === product.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
            }`}
            onClick={() => onProductSelect(product.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm mb-4">{product.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Users:</span>
                  <span className="font-medium">{product.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Revenue:</span>
                  <span className="font-medium">{product.revenue}</span>
                </div>
                {product.lastDeployed && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Last Deploy:</span>
                    <span className="font-medium">{product.lastDeployed}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {product.status !== 'active' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      deployProduct(product.id);
                    }}
                    className="flex-1"
                  >
                    <Rocket className="w-3 h-3 mr-1" />
                    Deploy
                  </Button>
                )}
                {product.deploymentUrl && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(product.deploymentUrl, '_blank');
                    }}
                    className="flex-1"
                  >
                    View Live
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Describe your product"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={addProduct} className="flex-1">
                  Add Product
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
