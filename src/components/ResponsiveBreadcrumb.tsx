import React from 'react';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  action?: () => void;
}

interface ResponsiveBreadcrumbProps {
  items: BreadcrumbItem[];
  currentProduct?: string;
  className?: string;
}

const ResponsiveBreadcrumb = ({ items, currentProduct, className }: ResponsiveBreadcrumbProps) => {
  const maxVisibleItems = 2; // On mobile, show max 2 items before ellipsis
  const shouldCollapse = items.length > maxVisibleItems;

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean = false) => (
    <div key={index} className="flex items-center">
      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mx-1 sm:mx-2 flex-shrink-0" />
      {item.action ? (
        <Button 
          variant="link" 
          className="h-auto p-0 text-xs sm:text-sm text-muted-foreground hover:text-foreground max-w-[120px] sm:max-w-none"
          onClick={item.action}
        >
          <span className="truncate">{item.label}</span>
        </Button>
      ) : (
        <span className={cn(
          "text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none",
          isLast ? "text-foreground" : "text-muted-foreground"
        )}>
          {item.label}
        </span>
      )}
    </div>
  );

  const renderCollapsedItems = (hiddenItems: BreadcrumbItem[]) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-1 hover:bg-accent">
          <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {hiddenItems.map((item, index) => (
          <DropdownMenuItem key={index} onClick={item.action}>
            <span className="truncate">{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className={cn(
      "flex items-center text-sm mb-4 sm:mb-6 overflow-hidden",
      className
    )} aria-label="Breadcrumb">
      <div className="flex items-center min-w-0">
        {/* Home Icon */}
        <Home className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
        
        {/* Current Product */}
        {currentProduct && (
          <>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mx-1 sm:mx-2 flex-shrink-0" />
            <span className="font-medium text-primary text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
              {currentProduct}
            </span>
          </>
        )}

        {/* Breadcrumb Items - Mobile Responsive */}
        <div className="flex items-center min-w-0">
          {/* Desktop: Show all items */}
          <div className="hidden sm:flex items-center">
            {items.map((item, index) => 
              renderBreadcrumbItem(item, index, index === items.length - 1)
            )}
          </div>

          {/* Mobile: Show collapsed version if too many items */}
          <div className="flex sm:hidden items-center min-w-0">
            {shouldCollapse ? (
              <>
                {/* Show first item */}
                {items.length > 0 && renderBreadcrumbItem(items[0], 0)}
                
                {/* Show ellipsis for middle items */}
                {items.length > 2 && (
                  <>
                    <ChevronRight className="w-3 h-3 text-muted-foreground mx-1 flex-shrink-0" />
                    {renderCollapsedItems(items.slice(1, -1))}
                  </>
                )}
                
                {/* Show last item */}
                {items.length > 1 && renderBreadcrumbItem(items[items.length - 1], items.length - 1, true)}
              </>
            ) : (
              items.map((item, index) => 
                renderBreadcrumbItem(item, index, index === items.length - 1)
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ResponsiveBreadcrumb;