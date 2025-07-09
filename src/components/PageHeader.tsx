import React from 'react';
import { Bell, Search, Menu, Home, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import NotificationBell from './notifications/NotificationBell';
import GlobalSearch from './GlobalSearch';
import { useAuth } from '@/contexts/AuthContext';
import { H1, Lead } from '@/components/ui/typography';
import { PageContainer, PageContent } from '@/components/PageLayout';

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
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Top Header Bar with Breadcrumbs and Search */}
      <header className="sticky top-0 z-50 w-full bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Breadcrumbs and Search */}
            <div className="flex items-center gap-4 flex-1">
              {/* Breadcrumbs first */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb className="hidden md:flex">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/" className="flex items-center">
                        <Home className="h-3 w-3" />
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbs.map((item, index) => (
                      <React.Fragment key={index}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {item.href ? (
                            <BreadcrumbLink href={item.href} className="text-xs">
                              {item.label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="text-xs font-medium">
                              {item.label}
                            </BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
              
              {/* Search after breadcrumbs */}
              <div className="max-w-lg">
                <GlobalSearch />
              </div>
            </div>

            {/* Right side - Actions and User */}
            <div className="flex items-center gap-4">
              {/* Mobile search trigger */}
              <Button variant="ghost" size="sm" className="sm:hidden h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Notifications */}
              <NotificationBell />
              
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-600 text-white text-sm">
                        {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">
                        {profile?.first_name || profile?.last_name 
                          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                          : profile?.email || 'User'
                        }
                      </p>
                      <p className="w-[200px] truncate text-xs text-gray-500">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-sm">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title Section */}
      <div className="bg-white">
        <PageContainer>
          <PageContent className="py-6">
            <div>
              <H1>{title}</H1>
              {subtitle && (
                <Lead className="mt-2">
                  {subtitle}
                </Lead>
              )}
            </div>
          </PageContent>
        </PageContainer>
      </div>
    </>
  );
};

export default PageHeader;