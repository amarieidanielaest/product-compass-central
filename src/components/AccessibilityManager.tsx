import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Settings,
  Eye,
  Volume2,
  Keyboard,
  MousePointer,
  Contrast,
  Type,
  Focus,
  Pause,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  focusIndicators: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  fontSize: number;
  animationSpeed: number;
}

interface AccessibilityManagerProps {
  className?: string;
}

export const AccessibilityManager: React.FC<AccessibilityManagerProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    focusIndicators: true,
    screenReaderMode: false,
    keyboardNavigation: true,
    fontSize: 16,
    animationSpeed: 1
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        applySettings(parsed);
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }
  }, []);

  // Apply settings to DOM
  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }

    // Large text
    if (newSettings.largeText) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }

    // Enhanced focus indicators
    if (newSettings.focusIndicators) {
      root.classList.add('accessibility-enhanced-focus');
    } else {
      root.classList.remove('accessibility-enhanced-focus');
    }

    // Screen reader mode
    if (newSettings.screenReaderMode) {
      root.classList.add('accessibility-screen-reader');
    } else {
      root.classList.remove('accessibility-screen-reader');
    }

    // Font size
    root.style.setProperty('--accessibility-font-size', `${newSettings.fontSize}px`);
    
    // Animation speed
    root.style.setProperty('--accessibility-animation-speed', `${newSettings.animationSpeed}s`);

    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  // Keyboard navigation enhancement
  useEffect(() => {
    if (settings.keyboardNavigation) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Skip to main content (Alt + S)
        if (e.altKey && e.key === 's') {
          e.preventDefault();
          const main = document.querySelector('main');
          if (main) {
            main.focus();
            main.scrollIntoView();
          }
        }

        // Skip to navigation (Alt + N)
        if (e.altKey && e.key === 'n') {
          e.preventDefault();
          const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
          if (nav) {
            (nav as HTMLElement).focus();
            nav.scrollIntoView();
          }
        }

        // Escape key closes dialogs/popups
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [settings.keyboardNavigation, isOpen]);

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      focusIndicators: true,
      screenReaderMode: false,
      keyboardNavigation: true,
      fontSize: 16,
      animationSpeed: 1
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
  };

  return (
    <>
      {/* Accessibility Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .accessibility-high-contrast {
          --background: 0 0% 0%;
          --foreground: 0 0% 100%;
          --card: 0 0% 10%;
          --card-foreground: 0 0% 100%;
          --popover: 0 0% 10%;
          --popover-foreground: 0 0% 100%;
          --primary: 47 100% 50%;
          --primary-foreground: 0 0% 0%;
          --secondary: 0 0% 20%;
          --secondary-foreground: 0 0% 100%;
          --muted: 0 0% 15%;
          --muted-foreground: 0 0% 85%;
          --accent: 0 0% 25%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 0 0% 30%;
          --input: 0 0% 20%;
          --ring: 47 100% 50%;
        }

        .accessibility-large-text {
          font-size: 120% !important;
        }

        .accessibility-large-text * {
          font-size: inherit !important;
        }

        .accessibility-reduced-motion,
        .accessibility-reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        .accessibility-enhanced-focus *:focus {
          outline: 3px solid var(--primary) !important;
          outline-offset: 2px !important;
          border-radius: 3px !important;
        }

        .accessibility-screen-reader .sr-only-override {
          position: static !important;
          width: auto !important;
          height: auto !important;
          padding: 0.25rem !important;
          margin: 0 !important;
          overflow: visible !important;
          clip: auto !important;
          white-space: normal !important;
          background: var(--accent) !important;
          color: var(--accent-foreground) !important;
          border: 1px solid var(--border) !important;
          border-radius: 4px !important;
        }

        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: var(--primary);
          color: var(--primary-foreground);
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          z-index: 9999;
          transition: top 0.1s ease-in-out;
        }

        .skip-link:focus {
          top: 6px;
        }
        `
      }} />

      {/* Skip Links */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>

      {/* Accessibility Widget */}
      <div className={cn("fixed bottom-4 left-4 z-50", className)}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-12 h-12 shadow-lg"
              aria-label="Accessibility settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </PopoverTrigger>

          <PopoverContent 
            align="start" 
            className="w-80 p-0 shadow-xl"
            sideOffset={8}
          >
            <Card className="border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Accessibility
                </CardTitle>
                <CardDescription>
                  Customize your experience for better accessibility
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Visual Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    Visual
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="high-contrast" className="text-sm">
                        High Contrast
                      </Label>
                      <Switch
                        id="high-contrast"
                        checked={settings.highContrast}
                        onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="large-text" className="text-sm">
                        Large Text
                      </Label>
                      <Switch
                        id="large-text"
                        checked={settings.largeText}
                        onCheckedChange={(checked) => updateSetting('largeText', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="reduced-motion" className="text-sm">
                        Reduce Motion
                      </Label>
                      <Switch
                        id="reduced-motion"
                        checked={settings.reducedMotion}
                        onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Font Size</Label>
                      <div className="flex items-center space-x-3">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <Slider
                          value={[settings.fontSize]}
                          onValueChange={([value]) => updateSetting('fontSize', value)}
                          max={24}
                          min={12}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm w-8 text-right">{settings.fontSize}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    Navigation
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="focus-indicators" className="text-sm">
                        Enhanced Focus
                      </Label>
                      <Switch
                        id="focus-indicators"
                        checked={settings.focusIndicators}
                        onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="keyboard-nav" className="text-sm">
                        Keyboard Navigation
                      </Label>
                      <Switch
                        id="keyboard-nav"
                        checked={settings.keyboardNavigation}
                        onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="screen-reader" className="text-sm">
                        Screen Reader Mode
                      </Label>
                      <Switch
                        id="screen-reader"
                        checked={settings.screenReaderMode}
                        onCheckedChange={(checked) => updateSetting('screenReaderMode', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts Info */}
                {settings.keyboardNavigation && (
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <h5 className="text-sm font-medium mb-2">Keyboard Shortcuts</h5>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>Alt + S: Skip to main content</div>
                      <div>Alt + N: Skip to navigation</div>
                      <div>Escape: Close dialogs</div>
                    </div>
                  </div>
                )}

                {/* Reset Button */}
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetSettings}
                    className="w-full"
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Screen Reader Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only" 
        id="accessibility-announcements"
      />
    </>
  );
};