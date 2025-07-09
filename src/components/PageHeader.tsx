import React from 'react';
import { Bell, Search, Menu, Home, ChevronRight } from 'lucide-react';
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
    <div className="bg-white border-b border-gray-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <GlobalSearch />
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

      {/* Page Header Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol role="list" className="flex items-center space-x-4">
                <li>
                  <div>
                    <a href="/" className="text-gray-400 hover:text-gray-500">
                      <Home className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      <span className="sr-only">Home</span>
                    </a>
                  </div>
                </li>
                {breadcrumbs.map((item, index) => (
                  <li key={index}>
                    <div className="flex items-center">
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                      {item.href ? (
                        <a
                          href={item.href}
                          className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span className="ml-4 text-sm font-medium text-gray-500">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-lg text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;