import { useState, useEffect } from 'react';
import { Eye, EyeOff, Type, Contrast, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  fontSize: number;
  focusVisible: boolean;
}

interface AccessibilityPanelProps {
  className?: string;
}

export const AccessibilityPanel = ({ className }: AccessibilityPanelProps) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    fontSize: 100,
    focusVisible: true
  });

  useEffect(() => {
    // Load accessibility settings from localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    
    // Check for user's system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setSettings(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast
    }));
  }, []);

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement;
    
    if (settings.highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }
    
    if (settings.largeText) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }
    
    if (settings.reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }
    
    if (settings.focusVisible) {
      root.classList.add('accessibility-focus-visible');
    } else {
      root.classList.remove('accessibility-focus-visible');
    }
    
    root.style.fontSize = `${settings.fontSize}%`;
    
    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const announceChange = (message: string) => {
    // Create announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return (
    <Card className={cn("loom-glass accessibility-panel", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-headline">
          <Eye className="w-5 h-5 text-primary" />
          <span>Accessibility Settings</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Contrast className="w-4 h-4 text-muted-foreground" />
            <label 
              htmlFor="high-contrast"
              className="text-sm font-medium font-body cursor-pointer"
            >
              High Contrast
            </label>
          </div>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={(checked) => {
              updateSetting('highContrast', checked);
              announceChange(`High contrast ${checked ? 'enabled' : 'disabled'}`);
            }}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Type className="w-4 h-4 text-muted-foreground" />
            <label 
              htmlFor="large-text"
              className="text-sm font-medium font-body cursor-pointer"
            >
              Large Text
            </label>
          </div>
          <Switch
            id="large-text"
            checked={settings.largeText}
            onCheckedChange={(checked) => {
              updateSetting('largeText', checked);
              announceChange(`Large text ${checked ? 'enabled' : 'disabled'}`);
            }}
            aria-label="Toggle large text mode"
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-muted-foreground" />
            <label 
              htmlFor="reduced-motion"
              className="text-sm font-medium font-body cursor-pointer"
            >
              Reduce Motion
            </label>
          </div>
          <Switch
            id="reduced-motion"
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => {
              updateSetting('reducedMotion', checked);
              announceChange(`Reduced motion ${checked ? 'enabled' : 'disabled'}`);
            }}
            aria-label="Toggle reduced motion mode"
          />
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label 
            htmlFor="font-size"
            className="text-sm font-medium font-body"
          >
            Font Size: {settings.fontSize}%
          </label>
          <Slider
            id="font-size"
            min={75}
            max={150}
            step={25}
            value={[settings.fontSize]}
            onValueChange={(value) => {
              updateSetting('fontSize', value[0]);
              announceChange(`Font size set to ${value[0]} percent`);
            }}
            className="w-full"
            aria-label="Adjust font size"
          />
        </div>

        {/* Screen Reader Support */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <label 
              htmlFor="screen-reader"
              className="text-sm font-medium font-body cursor-pointer"
            >
              Screen Reader Optimized
            </label>
          </div>
          <Switch
            id="screen-reader"
            checked={settings.screenReader}
            onCheckedChange={(checked) => {
              updateSetting('screenReader', checked);
              announceChange(`Screen reader optimization ${checked ? 'enabled' : 'disabled'}`);
            }}
            aria-label="Toggle screen reader optimization"
          />
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={() => {
            const defaultSettings: AccessibilitySettings = {
              highContrast: false,
              largeText: false,
              reducedMotion: false,
              screenReader: false,
              fontSize: 100,
              focusVisible: true
            };
            setSettings(defaultSettings);
            announceChange('Accessibility settings reset to default');
          }}
          className="w-full loom-rounded"
          aria-label="Reset all accessibility settings to default"
        >
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccessibilityPanel;