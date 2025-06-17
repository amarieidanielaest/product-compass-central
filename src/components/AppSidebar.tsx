
import { useState } from 'react';
import { 
  BarChart3, Target, Map, MessageSquare, Home, FileText, Kanban, Package, 
  ChevronDown, Settings, User, LogOut, Bell, Search
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppSidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  selectedProductId?: string;
  onProductChange?: (productId: string) => void;
}

const AppSidebar = ({ activeModule, setActiveModule, selectedProductId, onProductChange }: AppSidebarProps) => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, badge: null },
    { id: 'strategy', name: 'Strategy', icon: Target, badge: null },
    { id: 'roadmap', name: 'Roadmap', icon: Map, badge: '3' },
    { id: 'sprints', name: 'Sprint Board', icon: Kanban, badge: '12' },
    { id: 'customer', name: 'Customer Board', icon: MessageSquare, badge: '5' },
    { id: 'prd', name: 'PRD Generator', icon: FileText, badge: null },
    { id: 'products', name: 'Products', icon: Package, badge: null },
  ];

  const mockProducts = [
    { id: 'main', name: 'Main Product', status: 'active' as const },
    { id: 'beta', name: 'Beta Product', status: 'beta' as const },
  ];

  const getCurrentProduct = () => {
    if (selectedProductId === 'main') return 'Main Product';
    if (selectedProductId === 'beta') return 'Beta Product';
    return 'All Products';
  };

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ProductHub
          </h1>
          <SidebarTrigger />
        </div>
        
        {/* Product Selector */}
        <div className="mt-4">
          <DropdownMenu open={isProductMenuOpen} onOpenChange={setIsProductMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="truncate">{getCurrentProduct()}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <div className="text-xs font-medium text-slate-500 mb-2">Switch Product</div>
                {mockProducts.map((product) => (
                  <DropdownMenuItem
                    key={product.id}
                    onClick={() => {
                      onProductChange?.(product.id);
                      setIsProductMenuOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{product.name}</span>
                    {product.status === 'beta' && (
                      <Badge variant="secondary" className="text-xs">Beta</Badge>
                    )}
                    {selectedProductId === product.id && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveModule('products')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Products
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-2 p-2">
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Bell className="w-3 h-3 mr-1" />
                Alerts
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Search className="w-3 h-3 mr-1" />
                Search
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveModule(module.id)}
                      isActive={activeModule === module.id}
                      className="w-full"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{module.name}</span>
                      {module.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {module.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Context Cards */}
        <SidebarGroup>
          <SidebarGroupLabel>Context</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3 p-2">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border">
                <div className="text-xs font-medium text-purple-700 mb-1">Active Sprint</div>
                <div className="text-sm font-semibold text-slate-900">Sprint 24</div>
                <div className="text-xs text-slate-600">65% complete</div>
                <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-3 rounded-lg border">
                <div className="text-xs font-medium text-emerald-700 mb-1">Customer Health</div>
                <div className="text-sm font-semibold text-slate-900">5 High Priority</div>
                <div className="text-xs text-slate-600">2 escalated this week</div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarFallback className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-slate-500">Product Manager</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
