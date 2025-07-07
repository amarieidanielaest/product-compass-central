import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VoiceInterfaceProps {
  onCommand?: (command: string) => void;
  className?: string;
}

export const VoiceInterface = ({ onCommand, className }: VoiceInterfaceProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          onCommand?.(finalTranscript);
          
          // Process voice commands
          processVoiceCommand(finalTranscript.toLowerCase());
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again or check your microphone permissions.",
          variant: "destructive"
        });
      };
    }
  }, [onCommand, toast]);

  const processVoiceCommand = (command: string) => {
    // Voice command processing logic
    if (command.includes('dashboard')) {
      toast({
        title: "Voice Command Recognized",
        description: "Navigating to dashboard...",
      });
    } else if (command.includes('create') && command.includes('project')) {
      toast({
        title: "Voice Command Recognized", 
        description: "Opening project creation...",
      });
    } else if (command.includes('show') && command.includes('analytics')) {
      toast({
        title: "Voice Command Recognized",
        description: "Displaying analytics...",
      });
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card className={cn("loom-glass border border-border/30", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium font-body">Voice Assistant</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => speakText("Hello! I'm your Loom voice assistant. How can I help you today?")}
            className="loom-rounded"
          >
            <VolumeX className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={isListening ? "destructive" : "loom-accent"}
            size="sm"
            onClick={toggleListening}
            className={cn(
              "loom-rounded transition-all duration-200",
              isListening && "animate-pulse loom-shadow-lg"
            )}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {isListening ? 'Stop' : 'Listen'}
          </Button>
          
          {transcript && (
            <div className="flex-1 text-sm text-muted-foreground font-body italic">
              "{transcript}"
            </div>
          )}
        </div>
        
        {isListening && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-4 bg-primary loom-rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-body">
              Listening... Try saying "show dashboard" or "create project"
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Extend window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default VoiceInterface;