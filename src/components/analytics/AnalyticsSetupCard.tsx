import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Zap, 
  Users, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AnalyticsSetupCardProps {
  onSetupClick?: () => void;
}

export const AnalyticsSetupCard = ({ onSetupClick }: AnalyticsSetupCardProps) => {
  const setupSteps = [
    {
      title: "Connect Data Sources",
      description: "Link your user events and product interactions",
      status: "pending" as "pending" | "completed",
      icon: Users
    },
    {
      title: "Configure Tracking",
      description: "Set up event tracking for key user actions",
      status: "pending" as "pending" | "completed",
      icon: BarChart3
    },
    {
      title: "Enable Real-time Analytics",
      description: "Activate live data streaming and monitoring",
      status: "pending" as "pending" | "completed",
      icon: Zap
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 via-background to-accent/5 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Set Up Real-Time Analytics</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Get powerful insights into user behavior and product performance
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-background/50 border">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-medium text-sm">Live Metrics</h4>
            <p className="text-xs text-muted-foreground mt-1">Real-time user activity</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-background/50 border">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-medium text-sm">Smart Insights</h4>
            <p className="text-xs text-muted-foreground mt-1">AI-powered analytics</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-background/50 border">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-medium text-sm">Growth Tracking</h4>
            <p className="text-xs text-muted-foreground mt-1">Performance monitoring</p>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Setup Required
          </h4>
          
          {setupSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step.status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <step.icon className="w-3 h-3" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              
              <Badge 
                variant={step.status === 'completed' ? 'secondary' : 'outline'} 
                className="text-xs"
              >
                {step.status === 'completed' ? 'Done' : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            onClick={onSetupClick}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Start Analytics Setup
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-3">
            Takes 2-3 minutes to complete • No technical knowledge required
          </p>
        </div>
      </CardContent>
    </Card>
  );
};