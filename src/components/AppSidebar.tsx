import { useState, useEffect } from 'react';
import { 
  BarChart3, Target, Map, MessageSquare, Home, FileText, Kanban, Package, 
  ChevronDown, Settings, ChevronLeft, ChevronRight, BookOpen, Users
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
  useSidebar,
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
import { cn } from '@/lib/utils';
import loomLogo from '@/assets/loom-logo.png';

interface AppSidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  selectedProductId?: string;
  onProductChange?: (productId: string) => void;
}

const AppSidebar = ({ activeModule, setActiveModule, selectedProductId, onProductChange }: AppSidebarProps) => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const { state, setOpen } = useSidebar();
  
  // Auto-collapse when in settings
  useEffect(() => {
    console.log('AppSidebar effect:', { activeModule, state });
    if (activeModule === 'settings' && state === 'expanded') {
      console.log('Auto-collapsing sidebar for settings');
      setOpen(false);
    }
  }, [activeModule, state, setOpen]);
  
  const isCollapsed = state === 'collapsed';
  console.log('AppSidebar render:', { isCollapsed, state, activeModule });

  const modules = [
    // Core Product Features
    { id: 'dashboard', name: 'Dashboard', icon: Home, badge: null, category: 'core' },
    { id: 'strategy', name: 'Strategy', icon: Target, badge: null, category: 'core' },
    { id: 'roadmap', name: 'Roadmap', icon: Map, badge: '3', category: 'core' },
    { id: 'sprints', name: 'Sprint Board', icon: Kanban, badge: '12', category: 'core' },
    { id: 'customer', name: 'Customer Board', icon: MessageSquare, badge: '5', category: 'core' },
    { id: 'prd', name: 'PRD Generator', icon: FileText, badge: null, category: 'core' },
    { id: 'products', name: 'Products', icon: Package, badge: null, category: 'core' },
    { id: 'knowledge', name: 'Knowledge Center', icon: BookOpen, badge: null, category: 'core' },
    { id: 'users', name: 'User Management', icon: Users, badge: null, category: 'core' },
    
    // Settings & Administration
    { id: 'settings', name: 'Settings', icon: Settings, badge: null, category: 'settings' },
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
    <Sidebar 
      collapsible="icon"
      className="bg-white"
    >
      <SidebarHeader className="p-3">
        {/* Logo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img src={loomLogo} alt="Loom" className="w-6 h-6 mr-2" />
            {!isCollapsed && (
              <span className="font-semibold text-sm">Loom</span>
            )}
          </div>
          
          {/* Animated collapse button */}
          <SidebarTrigger className="h-6 w-6 p-0 hover:bg-gray-100 rounded">
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3 transition-transform duration-200" />
            ) : (
              <ChevronLeft className="h-3 w-3 transition-transform duration-200" />
            )}
          </SidebarTrigger>
        </div>
        
        {/* Product Selector - Only when expanded */}
        {!isCollapsed && (
          <div className="mb-3">
            <DropdownMenu open={isProductMenuOpen} onOpenChange={setIsProductMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs">
                  <div className="flex items-center">
                    <Package className="w-3 h-3 mr-1" />
                    <span className="truncate">{getCurrentProduct()}</span>
                  </div>
                  <ChevronDown className="w-3 h-3" />
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
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveModule(module.id)}
                      className={cn(
                        "h-8 px-2 justify-start hover:bg-gray-100 transition-colors duration-150",
                        isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50",
                        isCollapsed && "justify-center px-0"
                      )}
                      tooltip={isCollapsed ? module.name : undefined}
                    >
                      <Icon className={cn(
                        "h-4 w-4 transition-colors duration-150",
                        isActive && "text-blue-700",
                        isCollapsed ? "mx-auto" : "mr-2"
                      )} />
                      
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {module.name}
                          </span>
                          {module.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs h-4 px-1">
                              {module.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
