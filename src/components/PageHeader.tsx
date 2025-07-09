import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
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
import loomLogo from '@/assets/loom-logo.png';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          
          {/* Logo - visible on larger screens */}
          <div className="hidden md:flex items-center space-x-3">
            <img src={loomLogo} alt="Loom" className="w-8 h-8" />
            <h1 className="text-xl font-headline font-bold text-foreground">
              Loom
            </h1>
          </div>
          
          {/* Page Title */}
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-px bg-border" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 flex justify-center px-4">
          <div className="w-full max-w-md">
            <GlobalSearch />
          </div>
        </div>

        {/* Right side - Actions and User */}
        <div className="flex items-center gap-2">
          {/* Mobile search trigger */}
          <Button variant="ghost" size="sm" className="sm:hidden">
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Notifications */}
          <NotificationBell />
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm">
                    {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">
                    {profile?.first_name || profile?.last_name 
                      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                      : profile?.email || 'User'
                    }
                  </p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;