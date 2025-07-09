import { useState, useEffect } from 'react';
import { 
  BarChart3, Target, Map, MessageSquare, Home, FileText, Kanban, Package, 
  ChevronDown, Settings, PanelLeftClose, PanelLeftOpen
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
      className="border-r border-slate-200"
    >
      <SidebarHeader className="border-b border-slate-200">
        {/* Logo at the top */}
        <div className={cn(
          "flex items-center p-4 transition-all duration-200",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <img src={loomLogo} alt="Loom" className="w-8 h-8 flex-shrink-0" />
          {!isCollapsed && (
            <h1 className="text-xl font-headline font-bold text-foreground ml-3 truncate">
              Loom
            </h1>
          )}
        </div>
        
        {/* Product Selector - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="px-4 pb-4">
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
        )}
      </SidebarHeader>

      <SidebarContent>
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
                      tooltip={isCollapsed ? module.name : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      {!isCollapsed && <span>{module.name}</span>}
                      {!isCollapsed && module.badge && (
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

        {/* Context Cards - Hidden when collapsed */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Context</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3 p-2">
                <div className="gradient-clarity p-3 rounded-lg border border-border">
                  <div className="text-xs font-medium text-primary mb-1">Active Sprint</div>
                  <div className="text-sm font-semibold">Sprint 24</div>
                  <div className="text-xs text-muted-foreground">65% complete</div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-accent/10 to-amber/10 p-3 rounded-lg border border-border">
                  <div className="text-xs font-medium text-accent mb-1">Customer Health</div>
                  <div className="text-sm font-semibold">5 High Priority</div>
                  <div className="text-xs text-muted-foreground">2 escalated this week</div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with collapse toggle */}
      <SidebarFooter className="border-t border-slate-200">
        <div className="p-2">
          <SidebarTrigger 
            className={cn(
              "w-full transition-all duration-200 bg-background border border-border hover:bg-accent hover:text-accent-foreground",
              isCollapsed ? "h-10 justify-center" : "h-10 justify-between px-3"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <span className="text-sm font-medium">Collapse Menu</span>
                <PanelLeftClose className="h-4 w-4" />
              </>
            )}
          </SidebarTrigger>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
