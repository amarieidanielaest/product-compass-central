import { useState, useEffect } from 'react';
import { 
  BarChart3, Target, Map, MessageSquare, Home, FileText, Kanban, Package, 
  ChevronDown, Settings, ChevronLeft, ChevronRight, BookOpen, Users, 
  ChevronUp, Brain
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
  const [isCustomerBoardsOpen, setIsCustomerBoardsOpen] = useState(false);
  const { state, setOpen } = useSidebar();
  
  // Auto-collapse when in settings and auto-expand customer boards submenu
  useEffect(() => {
    console.log('AppSidebar effect:', { activeModule, state });
    if (activeModule === 'settings' && state === 'expanded') {
      console.log('Auto-collapsing sidebar for settings');
      setOpen(false);
    }

    // Auto-expand customer boards submenu when navigating to customer board modules
    if (customerBoardModules.some(m => m.id === activeModule)) {
      setIsCustomerBoardsOpen(true);
    }
  }, [activeModule, state, setOpen]);
  
  const isCollapsed = state === 'collapsed';
  console.log('AppSidebar render:', { isCollapsed, state, activeModule });

  const coreModules = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, badge: null },
    { id: 'strategy', name: 'Strategy', icon: Target, badge: null },
    { id: 'roadmap', name: 'Roadmap', icon: Map, badge: '3' },
    { id: 'sprints', name: 'Sprint Board', icon: Kanban, badge: '12' },
  ];

  const toolsModules = [
    { id: 'prd', name: 'PRD Generator', icon: FileText, badge: null },
    { id: 'knowledge', name: 'Knowledge Center', icon: BookOpen, badge: null },
    { id: 'phase4', name: 'Enterprise Hub', icon: BarChart3, badge: null },
    { id: 'phase5', name: 'AI Intelligence', icon: Brain, badge: 'NEW' },
  ];

  const adminModules = [
    { id: 'products', name: 'Products', icon: Package, badge: null },
    { id: 'users', name: 'User Management', icon: Users, badge: null },
    { id: 'settings', name: 'Settings', icon: Settings, badge: null },
  ];

  const customerBoardModules = [
    { id: 'customer', name: 'Board Admin', icon: MessageSquare, badge: '5', category: 'customer-boards' },
    { id: 'customer-admin', name: 'Customer Admin', icon: Users, badge: null, category: 'customer-boards' },
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
      className="border-r bg-sidebar w-60"
    >
      <SidebarHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg viewBox="0 0 30 20" className="w-4 h-3">
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
              <span className="font-bold text-base text-sidebar-foreground">Loom</span>
            )}
          </div>
          
          <SidebarTrigger className="h-7 w-7">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </SidebarTrigger>
        </div>
        
        {/* Product Selector */}
        {!isCollapsed && (
          <div className="mt-3">
            <DropdownMenu open={isProductMenuOpen} onOpenChange={setIsProductMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    <span className="truncate">{getCurrentProduct()}</span>
                  </div>
                  <ChevronDown className="w-3 h-3" />
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
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{product.name}</span>
                      {product.status === 'beta' && (
                        <Badge variant="secondary" className="text-xs">Beta</Badge>
                      )}
                      {selectedProductId === product.id && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveModule('products')} className="text-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Products
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs uppercase tracking-wide text-sidebar-foreground/60 mb-2", isCollapsed && "sr-only")}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* Core Modules */}
              {coreModules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveModule(module.id)}
                      className={cn(
                        "h-9 px-3 rounded-md text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-0"
                      )}
                      tooltip={isCollapsed ? module.name : undefined}
                    >
                      <Icon className={cn(
                        "h-4 w-4",
                        isCollapsed ? "mx-auto" : "mr-3"
                      )} />
                      
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="truncate">
                            {module.name}
                          </span>
                          {module.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs h-4 px-1.5">
                              {module.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Tools Section */}
              {!isCollapsed && (
                <div className="pt-4">
                  <div className="text-xs uppercase tracking-wide text-sidebar-foreground/40 mb-2 px-3">Tools</div>
                </div>
              )}
              {toolsModules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveModule(module.id)}
                      className={cn(
                        "h-9 px-3 rounded-md text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-0"
                      )}
                      tooltip={isCollapsed ? module.name : undefined}
                    >
                      <Icon className={cn(
                        "h-4 w-4",
                        isCollapsed ? "mx-auto" : "mr-3"
                      )} />
                      
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="truncate">
                            {module.name}
                          </span>
                          {module.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs h-4 px-1.5">
                              {module.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Customer Boards Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsCustomerBoardsOpen(!isCustomerBoardsOpen)}
                  className={cn(
                    "h-9 px-3 rounded-md text-sm font-medium transition-all duration-200",
                    customerBoardModules.some(m => activeModule === m.id)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    isCollapsed && "justify-center px-0"
                  )}
                  tooltip={isCollapsed ? "Customer Boards" : undefined}
                >
                  <MessageSquare className={cn(
                    "h-4 w-4",
                    isCollapsed ? "mx-auto" : "mr-3"
                  )} />
                  
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="truncate">Customer Boards</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs h-4 px-1.5">5</Badge>
                        {isCustomerBoardsOpen ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  )}
                </SidebarMenuButton>

                {/* Submenu Items */}
                {!isCollapsed && isCustomerBoardsOpen && (
                  <SidebarMenu className="mt-2 ml-4 space-y-1">
                    {customerBoardModules.map((module) => {
                      const Icon = module.icon;
                      const isActive = activeModule === module.id;
                      
                      return (
                        <SidebarMenuItem key={module.id}>
                          <SidebarMenuButton
                            onClick={() => setActiveModule(module.id)}
                            className={cn(
                              "h-8 px-3 rounded-md text-sm transition-all duration-200",
                              isActive 
                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <Icon className="h-3 w-3 mr-2" />
                            <span className="truncate">{module.name}</span>
                            {module.badge && (
                              <Badge variant="secondary" className="ml-2 text-xs h-4 px-1.5">
                                {module.badge}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                )}
              </SidebarMenuItem>

              {/* Admin Section */}
              {!isCollapsed && (
                <div className="pt-4">
                  <div className="text-xs uppercase tracking-wide text-sidebar-foreground/40 mb-2 px-3">Admin</div>
                </div>
              )}
              {adminModules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveModule(module.id)}
                      className={cn(
                        "h-9 px-3 rounded-md text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-0"
                      )}
                      tooltip={isCollapsed ? module.name : undefined}
                    >
                      <Icon className={cn(
                        "h-4 w-4",
                        isCollapsed ? "mx-auto" : "mr-3"
                      )} />
                      
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="truncate">
                            {module.name}
                          </span>
                          {module.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs h-4 px-1.5">
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
