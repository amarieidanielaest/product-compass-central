import { useState } from 'react';
import { Mic, MicOff, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VoiceInterface } from '@/components/VoiceInterface';
import { cn } from '@/lib/utils';

export const FloatingVoiceAssistant = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    // Voice command processing will be handled by VoiceInterface
  };

  if (isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="loom-glass border border-border/30 w-80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium font-headline">Voice Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="loom-rounded h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <VoiceInterface onCommand={handleVoiceCommand} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setIsExpanded(true)}
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 loom-rounded-full loom-shadow-lg",
        "loom-glass border border-border/30 loom-hover-lift",
        "transition-all duration-300 hover:scale-110",
        isListening && "animate-pulse border-primary/50"
      )}
      variant="loom-accent"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
};

export default FloatingVoiceAssistant;