import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Clock, Settings, Zap, Target, GitBranch } from 'lucide-react';
import { MethodologyTemplate } from '@/services/api/SprintService';

interface MethodologyTemplatesProps {
  onSelectTemplate: (template: MethodologyTemplate) => void;
  selectedTemplate?: MethodologyTemplate;
}

const MethodologyTemplates: React.FC<MethodologyTemplatesProps> = ({
  onSelectTemplate,
  selectedTemplate
}) => {
  const [templates] = useState<MethodologyTemplate[]>([
    {
      id: 'scrum-template',
      name: 'Scrum',
      methodology_type: 'scrum',
      description: 'Iterative development with time-boxed sprints, daily standups, and regular retrospectives.',
      default_columns: [
        { name: 'Product Backlog', position: 0, color: '#6b7280', column_type: 'start' },
        { name: 'Sprint Backlog', position: 1, color: '#3b82f6', column_type: 'standard' },
        { name: 'In Progress', position: 2, color: '#f59e0b', column_type: 'standard', wip_limit: 3 },
        { name: 'Review', position: 3, color: '#8b5cf6', column_type: 'standard' },
        { name: 'Done', position: 4, color: '#10b981', column_type: 'end' }
      ],
      default_statuses: ['todo', 'in_progress', 'review', 'done'],
      default_config: {
        sprint_length: 14,
        ceremonies: ['daily_standup', 'sprint_planning', 'sprint_review', 'retrospective'],
        metrics: ['velocity', 'burndown', 'sprint_goal_achievement'],
        roles: ['product_owner', 'scrum_master', 'development_team']
      },
      is_system_template: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'kanban-template',
      name: 'Kanban',
      methodology_type: 'kanban',
      description: 'Continuous flow with WIP limits, focusing on lead time and throughput optimization.',
      default_columns: [
        { name: 'Backlog', position: 0, color: '#6b7280', column_type: 'start' },
        { name: 'Ready', position: 1, color: '#3b82f6', column_type: 'standard', wip_limit: 5 },
        { name: 'In Progress', position: 2, color: '#f59e0b', column_type: 'standard', wip_limit: 3 },
        { name: 'Testing', position: 3, color: '#8b5cf6', column_type: 'standard', wip_limit: 2 },
        { name: 'Done', position: 4, color: '#10b981', column_type: 'end' }
      ],
      default_statuses: ['backlog', 'ready', 'in_progress', 'testing', 'done'],
      default_config: {
        wip_limits: true,
        metrics: ['lead_time', 'cycle_time', 'throughput', 'cumulative_flow'],
        policies: ['definition_of_ready', 'definition_of_done'],
        cadences: ['weekly_review', 'monthly_metrics_review']
      },
      is_system_template: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'waterfall-template',
      name: 'Waterfall',
      methodology_type: 'waterfall',
      description: 'Sequential phases with gate reviews, detailed planning, and comprehensive documentation.',
      default_columns: [
        { name: 'Requirements', position: 0, color: '#6b7280', column_type: 'start' },
        { name: 'Design', position: 1, color: '#3b82f6', column_type: 'standard' },
        { name: 'Development', position: 2, color: '#f59e0b', column_type: 'standard' },
        { name: 'Testing', position: 3, color: '#8b5cf6', column_type: 'standard' },
        { name: 'Deployment', position: 4, color: '#10b981', column_type: 'end' }
      ],
      default_statuses: ['requirements', 'design', 'development', 'testing', 'deployment'],
      default_config: {
        phases: ['initiation', 'planning', 'execution', 'monitoring', 'closure'],
        gates: ['requirements_review', 'design_review', 'code_review', 'user_acceptance'],
        deliverables: ['requirements_doc', 'design_doc', 'test_plan', 'deployment_guide'],
        metrics: ['schedule_adherence', 'budget_variance', 'scope_change']
      },
      is_system_template: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'hybrid-template',
      name: 'Hybrid (Agile + Waterfall)',
      methodology_type: 'hybrid',
      description: 'Combines iterative development with structured phases for complex enterprise projects.',
      default_columns: [
        { name: 'Planning Phase', position: 0, color: '#6b7280', column_type: 'start' },
        { name: 'Sprint Backlog', position: 1, color: '#3b82f6', column_type: 'standard' },
        { name: 'Development', position: 2, color: '#f59e0b', column_type: 'standard', wip_limit: 4 },
        { name: 'Review & Test', position: 3, color: '#8b5cf6', column_type: 'standard' },
        { name: 'Integration', position: 4, color: '#06b6d4', column_type: 'standard' },
        { name: 'Deployment', position: 5, color: '#10b981', column_type: 'end' }
      ],
      default_statuses: ['planning', 'ready', 'in_progress', 'review', 'integration', 'deployed'],
      default_config: {
        phases: ['planning', 'iterative_development', 'integration', 'deployment'],
        sprint_length: 10,
        ceremonies: ['sprint_planning', 'daily_standup', 'sprint_review', 'phase_gate_review'],
        metrics: ['velocity', 'lead_time', 'phase_completion', 'integration_success_rate']
      },
      is_system_template: true,
      created_at: new Date().toISOString()
    }
  ]);

  const getMethodologyIcon = (type: string) => {
    switch (type) {
      case 'scrum': return Zap;
      case 'kanban': return GitBranch;
      case 'waterfall': return Target;
      case 'hybrid': return Settings;
      default: return Check;
    }
  };

  const getMethodologyColor = (type: string) => {
    switch (type) {
      case 'scrum': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'kanban': return 'text-green-700 bg-green-50 border-green-200';
      case 'waterfall': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'hybrid': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Methodology</h3>
        <p className="text-sm text-muted-foreground">
          Select a methodology template to configure your sprint board and workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const Icon = getMethodologyIcon(template.methodology_type);
          const isSelected = selectedTemplate?.id === template.id;

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="w-5 h-5" />
                    {template.name}
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </CardTitle>
                  <Badge variant="outline" className={getMethodologyColor(template.methodology_type)}>
                    {template.methodology_type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>

                <div>
                  <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                    Default Workflow
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {template.default_columns.map((column, index) => (
                      <React.Fragment key={column.name}>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${column.color}20`,
                            borderColor: column.color,
                            color: column.color
                          }}
                        >
                          {column.name}
                          {column.wip_limit && ` (${column.wip_limit})`}
                        </Badge>
                        {index < template.default_columns.length - 1 && (
                          <span className="text-muted-foreground">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                    Key Features
                  </h4>
                  <div className="space-y-1">
                    {template.methodology_type === 'scrum' && (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Time-boxed sprints ({template.default_config.sprint_length} days)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Target className="w-3 h-3" />
                          <span>Velocity tracking & burndown charts</span>
                        </div>
                      </>
                    )}
                    {template.methodology_type === 'kanban' && (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <GitBranch className="w-3 h-3" />
                          <span>WIP limits & continuous flow</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Target className="w-3 h-3" />
                          <span>Lead time & throughput metrics</span>
                        </div>
                      </>
                    )}
                    {template.methodology_type === 'waterfall' && (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <Target className="w-3 h-3" />
                          <span>Sequential phases with gate reviews</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Comprehensive documentation</span>
                        </div>
                      </>
                    )}
                    {template.methodology_type === 'hybrid' && (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <Zap className="w-3 h-3" />
                          <span>Agile sprints + waterfall phases</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Target className="w-3 h-3" />
                          <span>Flexible integration points</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTemplate && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Selected: {selectedTemplate.name}</h4>
          <p className="text-sm text-muted-foreground mb-3">
            This will create a sprint board with {selectedTemplate.default_columns.length} columns 
            and configure it for {selectedTemplate.methodology_type} workflows.
          </p>
          <Button onClick={() => console.log('Create sprint with template:', selectedTemplate)}>
            Create Sprint with {selectedTemplate.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MethodologyTemplates;