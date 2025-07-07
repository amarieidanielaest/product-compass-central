import { useState } from 'react';
import { CheckCircle, Sparkles, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmotionalFeedbackProps {
  message: string;
  type?: 'success' | 'celebration' | 'encouragement' | 'achievement';
  onDismiss?: () => void;
  className?: string;
}

export const EmotionalFeedback = ({ 
  message, 
  type = 'success', 
  onDismiss,
  className 
}: EmotionalFeedbackProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getIcon = () => {
    switch (type) {
      case 'celebration':
        return <Sparkles className="w-5 h-5" />;
      case 'encouragement':
        return <Heart className="w-5 h-5" />;
      case 'achievement':
        return <Star className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'celebration':
        return 'loom-premium';
      case 'encouragement':
        return 'loom-coral';
      case 'achievement':
        return 'loom-accent';
      default:
        return 'loom-action';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "loom-glass loom-rounded-lg p-4 loom-fade-in border-l-4",
      type === 'celebration' && "border-l-primary",
      type === 'encouragement' && "border-l-coral", 
      type === 'achievement' && "border-l-accent",
      type === 'success' && "border-l-indigo",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-2 loom-rounded-full",
            type === 'celebration' && "bg-primary/10 text-primary",
            type === 'encouragement' && "bg-coral/10 text-coral",
            type === 'achievement' && "bg-accent/10 text-accent", 
            type === 'success' && "bg-indigo/10 text-indigo"
          )}>
            {getIcon()}
          </div>
          <p className="text-sm font-body text-foreground">{message}</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="loom-rounded opacity-70 hover:opacity-100"
        >
          ✕
        </Button>
      </div>
    </div>
  );
};

// SaaS Trend: Gamification - Achievement celebrations
export const AchievementToast = ({ 
  title, 
  description, 
  badge 
}: { 
  title: string; 
  description: string; 
  badge?: string; 
}) => {
  return (
    <div className="loom-glass loom-rounded-lg p-6 loom-bounce-gentle border border-primary/20">
      <div className="flex items-start space-x-4">
        <div className="bg-primary/10 p-3 loom-rounded-full">
          <Star className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-headline font-semibold text-foreground">{title}</h4>
            {badge && (
              <span className="px-2 py-1 text-xs font-semibold loom-rounded-full bg-accent text-accent-foreground">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-body">{description}</p>
        </div>
        <div className="text-2xl animate-pulse">🎉</div>
      </div>
    </div>
  );
};

export default EmotionalFeedback;