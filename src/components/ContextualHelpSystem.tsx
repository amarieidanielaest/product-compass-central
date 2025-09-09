import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  HelpCircle, 
  X, 
  Lightbulb, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualHelpProps {
  context: string; // Current page/section context
  boardId?: string;
  className?: string;
}

interface HelpTip {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'guide' | 'tutorial' | 'warning';
  priority: 'high' | 'medium' | 'low';
  context: string[];
  isNew?: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  relevanceScore: number;
}

export const ContextualHelpSystem: React.FC<ContextualHelpProps> = ({
  context,
  boardId,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [userBehavior, setUserBehavior] = useState({
    timeOnPage: 0,
    clickCount: 0,
    scrollDepth: 0
  });

  // Mock contextual help data
  const helpTips: HelpTip[] = [
    {
      id: 'feedback-submission',
      title: 'How to Submit Great Feedback',
      description: 'Learn best practices for writing feedback that gets results',
      type: 'tip',
      priority: 'high',
      context: ['customer-portal', 'feedback'],
      actionUrl: '/knowledge/feedback-guide',
      actionLabel: 'View Guide'
    },
    {
      id: 'roadmap-understanding',
      title: 'Understanding the Roadmap',
      description: 'Learn how to read roadmap statuses and timelines',
      type: 'guide',
      priority: 'medium',
      context: ['customer-portal', 'roadmap'],
      isNew: true
    },
    {
      id: 'board-features',
      title: 'Explore Board Features',
      description: 'Discover advanced features available in this board',
      type: 'tutorial',
      priority: 'medium',
      context: ['customer-portal'],
      actionLabel: 'Take Tour'
    }
  ];

  // Smart suggestions based on context and behavior
  const generateSmartSuggestions = (): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];

    // Time-based suggestions
    if (userBehavior.timeOnPage > 30000) { // 30 seconds
      suggestions.push({
        id: 'quick-start',
        title: 'Need help getting started?',
        description: 'Check out our quick start guide',
        icon: <Lightbulb className="h-4 w-4" />,
        action: () => console.log('Open quick start'),
        relevanceScore: 0.9
      });
    }

    // Context-based suggestions
    if (context === 'customer-portal') {
      suggestions.push({
        id: 'feedback-tips',
        title: 'Submit Better Feedback',
        description: 'Learn how to write feedback that gets prioritized',
        icon: <MessageCircle className="h-4 w-4" />,
        action: () => console.log('Open feedback tips'),
        relevanceScore: 0.8
      });
    }

    // Board-specific suggestions
    if (boardId) {
      suggestions.push({
        id: 'board-help',
        title: 'Board-Specific Help',
        description: 'View articles specific to this board',
        icon: <BookOpen className="h-4 w-4" />,
        action: () => console.log('Open board help'),
        relevanceScore: 0.7
      });
    }

    return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  const contextualTips = helpTips.filter(tip => 
    tip.context.includes(context) && !dismissedTips.includes(tip.id)
  );

  const smartSuggestions = generateSmartSuggestions();

  const dismissTip = (tipId: string) => {
    setDismissedTips(prev => [...prev, tipId]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb className="h-4 w-4" />;
      case 'guide': return <BookOpen className="h-4 w-4" />;
      case 'tutorial': return <Sparkles className="h-4 w-4" />;
      case 'warning': return <HelpCircle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tip': return 'text-blue-500';
      case 'guide': return 'text-green-500';
      case 'tutorial': return 'text-purple-500';
      case 'warning': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };

  // Track user behavior
  useEffect(() => {
    const startTime = Date.now();
    let clickCount = 0;

    const handleClick = () => setUserBehavior(prev => ({ ...prev, clickCount: prev.clickCount + 1 }));
    const handleScroll = () => {
      const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setUserBehavior(prev => ({ ...prev, scrollDepth }));
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);

    const interval = setInterval(() => {
      setUserBehavior(prev => ({ 
        ...prev, 
        timeOnPage: Date.now() - startTime 
      }));
    }, 1000);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  if (contextualTips.length === 0 && smartSuggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            className="rounded-full w-12 h-12 shadow-lg relative"
            variant="default"
          >
            <HelpCircle className="h-5 w-5" />
            {(contextualTips.length > 0 || smartSuggestions.length > 0) && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {contextualTips.length + smartSuggestions.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          align="end" 
          className="w-80 p-0 shadow-xl border-0"
          sideOffset={8}
        >
          <Card className="border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Helpful Tips</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-xs">
                Contextual help for your current page
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              {/* Smart Suggestions */}
              {smartSuggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    Smart Suggestions
                  </div>
                  
                  {smartSuggestions.slice(0, 2).map((suggestion) => (
                    <div 
                      key={suggestion.id}
                      className="p-3 rounded-lg bg-accent/50 border hover:bg-accent cursor-pointer transition-colors"
                      onClick={suggestion.action}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-primary mt-0.5">
                          {suggestion.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">
                            {suggestion.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contextual Tips */}
              {contextualTips.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Contextual Help
                  </div>
                  
                  {contextualTips.map((tip) => (
                    <div 
                      key={tip.id}
                      className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("text-sm", getTypeColor(tip.type))}>
                            {getTypeIcon(tip.type)}
                          </div>
                          <h4 className="font-medium text-sm">
                            {tip.title}
                          </h4>
                          {tip.isNew && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => dismissTip(tip.id)}
                          className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3">
                        {tip.description}
                      </p>

                      {tip.actionUrl && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs"
                        >
                          {tip.actionLabel || 'Learn More'}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Help Actions */}
              <div className="pt-3 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start h-8 text-xs"
                >
                  <BookOpen className="h-3 w-3 mr-2" />
                  View All Help Articles
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};