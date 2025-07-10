
import { ArrowRight, MessageSquare, Kanban, Target, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';


interface QuickActionsProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  activeTab?: string;
}

const QuickActions = ({ currentModule, onNavigate, activeTab }: QuickActionsProps) => {
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
        // Tab-specific actions for strategy module
        if (activeTab === 'objectives') {
          return [
            { 
              label: 'Define New Objective', 
              icon: Target, 
              action: () => console.log('Create objective'),
              description: 'Set high-level strategic goals'
            },
            { 
              label: 'Link to Initiatives', 
              icon: Map, 
              action: () => onNavigate('roadmap'),
              description: 'Connect to delivery work'
            }
          ];
        } else if (activeTab === 'resources') {
          return [
            { 
              label: 'Allocate Resources', 
              icon: Target, 
              action: () => console.log('Allocate resources'),
              description: 'Assign teams and budgets'
            },
            { 
              label: 'Create Budget', 
              icon: Target, 
              action: () => console.log('Create budget'),
              description: 'Plan financial allocation'
            }
          ];
        } else if (activeTab === 'reporting') {
          return [
            { 
              label: 'Generate Report', 
              icon: Target, 
              action: () => console.log('Generate report'),
              description: 'Create executive summary'
            },
            { 
              label: 'Create Dashboard', 
              icon: Target, 
              action: () => console.log('Create dashboard'),
              description: 'Build real-time view'
            }
          ];
        } else {
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
        }
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
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
          <p className="text-xs text-slate-600">
            {currentModule === 'strategy' && activeTab === 'objectives' && 'Objectives are your company\'s high-level goals. Start by defining what you want to achieve this year.'}
            {currentModule === 'strategy' && activeTab === 'resources' && 'Allocate teams and budgets to your strategic initiatives to see where your money and people are going.'}
            {currentModule === 'strategy' && activeTab === 'reporting' && 'Create shareable, real-time reports for any audience, from your team to the C-suite. Start with a template or build your own.'}
            {(currentModule !== 'strategy' || (!activeTab || (activeTab !== 'objectives' && activeTab !== 'resources' && activeTab !== 'reporting'))) && 'Suggested next steps for this module'}
          </p>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start text-left bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 transition-all duration-200"
              onClick={action.action}
            >
              <div className="flex items-start w-full">
                <div className="flex-shrink-0 mr-3">
                  <Icon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900">{action.label}</div>
                  <div className="text-xs text-slate-600 mt-1">{action.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
