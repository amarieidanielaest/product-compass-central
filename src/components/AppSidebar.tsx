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
      className="border-r bg-sidebar"
    >
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg viewBox="0 0 30 20" className="w-5 h-3">
                <defs>
                  <linearGradient id="loomWave" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:'white', stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor:'white', stopOpacity:0.8}} />
                    <stop offset="100%" style={{stopColor:'white', stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <path d="M0 8 Q5 3 10 8 T20 8 T30 8" stroke="url(#loomWave)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M0 12 Q5 7 10 12 T20 12 T30 12" stroke="url(#loomWave)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
              </svg>
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg text-sidebar-foreground">Loom</span>
            )}
          </div>
          
          <SidebarTrigger className="h-8 w-8">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </SidebarTrigger>
        </div>
        
        {/* Product Selector */}
        {!isCollapsed && (
          <div className="mt-4">
            <DropdownMenu open={isProductMenuOpen} onOpenChange={setIsProductMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span className="truncate">{getCurrentProduct()}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Switch Product</div>
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
                        <Badge variant="secondary">Beta</Badge>
                      )}
                      {selectedProductId === product.id && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
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

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs uppercase tracking-wider text-sidebar-foreground/60 mb-3", isCollapsed && "sr-only")}>
            Navigation
          </SidebarGroupLabel>
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
                        "h-10 px-3 rounded-lg font-medium transition-all duration-200",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-0"
                      )}
                      tooltip={isCollapsed ? module.name : undefined}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        isCollapsed ? "mx-auto" : "mr-3"
                      )} />
                      
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="truncate">
                            {module.name}
                          </span>
                          {module.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs h-5 px-2">
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
