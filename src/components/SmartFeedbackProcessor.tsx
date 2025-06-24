
import { useState } from 'react';
import { Zap, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProcessedFeedback {
  id: string;
  originalText: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  themes: string[];
  priorityScore: number;
  suggestedActions: string[];
  customerSegment: 'enterprise' | 'professional' | 'starter';
}

interface SmartFeedbackProcessorProps {
  rawFeedback: string;
  onProcessComplete: (processed: ProcessedFeedback) => void;
  customerInfo?: {
    tier: string;
    value: number;
  };
}

const SmartFeedbackProcessor = ({ rawFeedback, onProcessComplete, customerInfo }: SmartFeedbackProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState<ProcessedFeedback | null>(null);

  const processFeedback = async () => {
    setIsProcessing(true);
    
    // Mock AI processing - replace with actual AI service
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate AI analysis results
    const mockProcessed: ProcessedFeedback = {
      id: Date.now().toString(),
      originalText: rawFeedback,
      sentiment: rawFeedback.toLowerCase().includes('great') || rawFeedback.toLowerCase().includes('love') ? 'positive' :
                rawFeedback.toLowerCase().includes('bad') || rawFeedback.toLowerCase().includes('terrible') ? 'negative' : 'neutral',
      themes: ['export', 'performance', 'user-experience'],
      priorityScore: customerInfo?.tier === 'enterprise' ? 85 : 
                     customerInfo?.tier === 'professional' ? 65 : 45,
      suggestedActions: [
        'Create feature request ticket',
        'Notify product team',
        'Schedule customer interview',
        'Add to roadmap consideration'
      ],
      customerSegment: (customerInfo?.tier as any) || 'starter'
    };
    
    setProcessed(mockProcessed);
    setIsProcessing(false);
  };

  const handleAcceptProcessing = () => {
    if (processed) {
      onProcessComplete(processed);
      setProcessed(null);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-600" />
          Smart Feedback Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-medium text-slate-900 mb-2">Original Feedback</h4>
          <p className="text-sm text-slate-700">{rawFeedback}</p>
        </div>

        {!processed && !isProcessing && (
          <Button onClick={processFeedback} className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Process with AI
          </Button>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-slate-600">Analyzing feedback...</span>
            </div>
          </div>
        )}

        {processed && (
          <div className="space-y-4">
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600">Sentiment</label>
                <Badge className={getSentimentColor(processed.sentiment)}>
                  {processed.sentiment}
                </Badge>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Priority Score</label>
                <Badge className={getPriorityColor(processed.priorityScore)}>
                  {processed.priorityScore}/100
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Detected Themes</label>
              <div className="flex flex-wrap gap-1">
                {processed.themes.map(theme => (
                  <Badge key={theme} variant="outline" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Suggested Actions</label>
              <div className="space-y-1">
                {processed.suggestedActions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-slate-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAcceptProcessing} className="flex-1">
                <ArrowRight className="w-4 h-4 mr-2" />
                Accept & Create Ticket
              </Button>
              <Button variant="outline" onClick={() => setProcessed(null)}>
                Edit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartFeedbackProcessor;
