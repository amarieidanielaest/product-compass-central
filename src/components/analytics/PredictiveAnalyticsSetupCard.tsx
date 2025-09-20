import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Target,
  ArrowRight,
  CheckCircle,
  Settings,
  Database
} from 'lucide-react';

interface PredictiveAnalyticsSetupCardProps {
  onSetupClick?: () => void;
}

export const PredictiveAnalyticsSetupCard = ({ onSetupClick }: PredictiveAnalyticsSetupCardProps) => {
  const setupSteps = [
    {
      title: "Connect AI Service",
      description: "Link OpenAI or Azure AI services for predictive modeling",
      status: "pending" as "pending" | "completed",
      icon: Brain
    },
    {
      title: "Historical Data Collection",
      description: "Enable data collection for baseline predictions",
      status: "pending" as "pending" | "completed",
      icon: Database
    },
    {
      title: "Model Training",
      description: "Train predictive models on your product data",
      status: "pending" as "pending" | "completed",
      icon: Zap
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-background to-blue-50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Set Up AI Predictions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Enable machine learning insights and forecasting capabilities
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-background/50 border">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-medium text-sm">Growth Forecasting</h4>
            <p className="text-xs text-muted-foreground mt-1">Predict user growth & metrics</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-background/50 border">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-medium text-sm">Smart Recommendations</h4>
            <p className="text-xs text-muted-foreground mt-1">AI-powered optimization tips</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-background/50 border">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="font-medium text-sm">Risk Detection</h4>
            <p className="text-xs text-muted-foreground mt-1">Early warning systems</p>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-500" />
            Configuration Required
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
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            size="lg"
          >
            <Brain className="w-4 h-4 mr-2" />
            Configure AI Analytics
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-3">
            Requires AI service integration • Advanced analytics features
          </p>
        </div>
      </CardContent>
    </Card>
  );
};