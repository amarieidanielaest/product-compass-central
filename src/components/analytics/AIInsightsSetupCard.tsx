import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Lightbulb, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface AIInsightsSetupCardProps {
  onSetupClick?: () => void;
}

export const AIInsightsSetupCard = ({ onSetupClick }: AIInsightsSetupCardProps) => {
  const setupSteps = [
    {
      title: "Connect AI Models",
      description: "Link GPT-4 or Claude for intelligent analysis",
      status: "pending" as "pending" | "completed",
      icon: Brain
    },
    {
      title: "Data Integration",
      description: "Connect product analytics and user feedback data",
      status: "pending" as "pending" | "completed",
      icon: BarChart3
    },
    {
      title: "Insight Categories",
      description: "Configure insight types and priority levels",
      status: "pending" as "pending" | "completed",
      icon: Lightbulb
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-background to-purple-50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Set Up AI Insights</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Get intelligent analysis and recommendations from your data
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-background/50 border">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="font-medium text-sm">Smart Insights</h4>
            <p className="text-xs text-muted-foreground mt-1">Automated pattern detection</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-background/50 border">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-medium text-sm">AI Chat Assistant</h4>
            <p className="text-xs text-muted-foreground mt-1">Ask questions about your data</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-background/50 border">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-4 h-4 text-pink-600" />
            </div>
            <h4 className="font-medium text-sm">Auto Recommendations</h4>
            <p className="text-xs text-muted-foreground mt-1">Proactive suggestions</p>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            AI Configuration Needed
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
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            size="lg"
          >
            <Brain className="w-4 h-4 mr-2" />
            Setup AI Insights
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-3">
            Requires OpenAI API key • Enhanced intelligence features
          </p>
        </div>
      </CardContent>
    </Card>
  );
};