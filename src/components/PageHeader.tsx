import React from 'react';
import { Bell, ChevronDown, LogOut, Plus, Settings, User, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { JiraLikeSearch } from './search/JiraLikeSearch';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const PageHeader = ({ title, subtitle, breadcrumbs }: PageHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Left side - Breadcrumbs & Title */}
          <div className="flex items-center gap-4 min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center">
                    <Home className="h-4 w-4" />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs && breadcrumbs.map((breadcrumb, index) => (
                  <div key={index}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {breadcrumb.href ? (
                        <BreadcrumbLink 
                          href={breadcrumb.href}
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                        >
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="font-semibold text-foreground text-sm">
                          {breadcrumb.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Global Search */}
            <div className="hidden lg:flex items-center gap-2">
              <JiraLikeSearch />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create new</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                      <Bell className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 px-2 gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;