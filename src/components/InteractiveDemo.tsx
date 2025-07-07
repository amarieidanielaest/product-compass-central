import { useState, useRef } from 'react';
import { Play, RotateCcw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface InteractiveDemoProps {
  title: string;
  description: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    duration: number;
  }>;
  onComplete?: () => void;
  className?: string;
}

export const InteractiveDemo = ({
  title,
  description,
  steps,
  onComplete,
  className
}: InteractiveDemoProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
    playStep(0);
  };

  const playStep = (stepIndex: number) => {
    if (stepIndex >= steps.length) {
      setIsPlaying(false);
      setProgress(100);
      onComplete?.();
      return;
    }

    const step = steps[stepIndex];
    const stepProgress = (stepIndex / steps.length) * 100;
    setCurrentStep(stepIndex);
    
    let currentProgress = stepProgress;
    const increment = ((100 / steps.length) / step.duration) * 100; // Progress per 100ms
    
    intervalRef.current = setInterval(() => {
      currentProgress += increment;
      setProgress(currentProgress);
      
      if (currentProgress >= ((stepIndex + 1) / steps.length) * 100) {
        clearInterval(intervalRef.current!);
        setTimeout(() => playStep(stepIndex + 1), 500);
      }
    }, 100);
  };

  const resetDemo = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
  };

  return (
    <Card className={cn("loom-glass loom-hover-lift", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 font-headline">
              <Maximize2 className="w-5 h-5 text-primary" />
              <span>{title}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {description}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetDemo}
              disabled={!isPlaying && progress === 0}
              className="loom-rounded"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="loom-action"
              size="sm"
              onClick={startDemo}
              disabled={isPlaying}
              className="loom-rounded"
            >
              <Play className="w-4 h-4 mr-1" />
              {isPlaying ? 'Playing...' : 'Start Demo'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-body">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Demo Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "p-3 loom-rounded-lg border-l-4 transition-all duration-300",
                index === currentStep && isPlaying
                  ? "border-l-primary bg-primary/5 loom-shadow-md"
                  : index < currentStep 
                  ? "border-l-accent bg-accent/5"
                  : "border-l-border bg-background/50"
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "w-6 h-6 loom-rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                  index === currentStep && isPlaying
                    ? "bg-primary text-primary-foreground animate-pulse"
                    : index < currentStep
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium font-headline text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Step Highlight */}
        {isPlaying && (
          <div className="p-4 loom-glass-dark loom-rounded-lg border border-primary/20 loom-fade-in">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-primary loom-rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold font-headline text-primary">
                Step {currentStep + 1}: {steps[currentStep]?.title}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              {steps[currentStep]?.description}
            </p>
          </div>
        )}

        {progress === 100 && !isPlaying && (
          <div className="p-4 bg-accent/10 border border-accent/20 loom-rounded-lg loom-bounce-gentle">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎉</span>
              <span className="text-sm font-semibold font-headline text-accent">
                Demo completed! You're ready to explore.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveDemo;