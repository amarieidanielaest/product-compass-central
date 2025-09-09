import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { CustomerPortal } from './boards/CustomerPortal';
import { cn } from '@/lib/utils';

interface ResponsiveCustomerPortalProps {
  className?: string;
}

export const ResponsiveCustomerPortal: React.FC<ResponsiveCustomerPortalProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Customer Portal</h1>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Navigation</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Mobile menu content would go here */}
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Mobile navigation menu - customize as needed
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6">
        <CustomerPortal />
      </div>
    </div>
  );
};