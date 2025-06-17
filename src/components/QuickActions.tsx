
import { ArrowRight, MessageSquare, Kanban, Target, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QuickActionsProps {
  currentModule: string;
  onNavigate: (module: string) => void;
}

const QuickActions = ({ currentModule, onNavigate }: QuickActionsProps) => {
  const getQuickActions = () => {
    switch (currentModule) {
      case 'customer':
        return [
          { 
            label: 'Create Sprint Task', 
            icon: Kanban, 
            action: () => onNavigate('sprints'),
            description: 'Convert to sprint task'
          },
          { 
            label: 'Link to Strategy', 
            icon: Target, 
            action: () => onNavigate('strategy'),
            description: 'Align with objectives'
          }
        ];
      case 'sprints':
        return [
          { 
            label: 'View Customer Feedback', 
            icon: MessageSquare, 
            action: () => onNavigate('customer'),
            description: 'Check related tickets'
          },
          { 
            label: 'Update Roadmap', 
            icon: Map, 
            action: () => onNavigate('roadmap'),
            description: 'Reflect in timeline'
          }
        ];
      case 'strategy':
        return [
          { 
            label: 'Plan Roadmap', 
            icon: Map, 
            action: () => onNavigate('roadmap'),
            description: 'Create execution plan'
          },
          { 
            label: 'Check Sprint Progress', 
            icon: Kanban, 
            action: () => onNavigate('sprints'),
            description: 'View implementation'
          }
        ];
      case 'roadmap':
        return [
          { 
            label: 'Create Sprint', 
            icon: Kanban, 
            action: () => onNavigate('sprints'),
            description: 'Start execution'
          },
          { 
            label: 'Review Strategy', 
            icon: Target, 
            action: () => onNavigate('strategy'),
            description: 'Align with goals'
          }
        ];
      default:
        return [];
    }
  };

  const actions = getQuickActions();

  if (actions.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 justify-start"
                onClick={action.action}
              >
                <Icon className="w-4 h-4 mr-2 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-slate-500">{action.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
