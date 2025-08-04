import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Zap, 
  Clock, 
  Users, 
  GitBranch,
  Mail,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Activity
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'status_change' | 'time_based' | 'assignment' | 'custom_field';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'status_update' | 'assign_user' | 'send_notification' | 'create_task' | 'update_field';
    config: Record<string, any>;
  }>;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  executionCount: number;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'approval' | 'escalation' | 'notification' | 'progression';
  rules: AutomationRule[];
  isBuiltIn: boolean;
}

export const WorkflowAutomation: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockRules: AutomationRule[] = [
        {
          id: '1',
          name: 'Auto-assign Code Reviews',
          description: 'Automatically assign code reviews to senior developers',
          trigger: {
            type: 'status_change',
            conditions: { fromStatus: 'in_progress', toStatus: 'ready_for_review' }
          },
          actions: [
            {
              type: 'assign_user',
              config: { userPool: ['senior-dev-1', 'senior-dev-2'], strategy: 'round_robin' }
            },
            {
              type: 'send_notification',
              config: { template: 'review_assigned', channels: ['slack', 'email'] }
            }
          ],
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          lastTriggered: '2024-01-20T14:30:00Z',
          executionCount: 24
        },
        {
          id: '2',
          name: 'Sprint Goal Alert',
          description: 'Alert PM when sprint completion is below 60% with 2 days left',
          trigger: {
            type: 'time_based',
            conditions: { sprintDaysRemaining: 2, completionThreshold: 60 }
          },
          actions: [
            {
              type: 'send_notification',
              config: { 
                recipients: ['product-manager'], 
                message: 'Sprint goal at risk - only {completion}% complete with 2 days remaining',
                urgency: 'high'
              }
            }
          ],
          isActive: true,
          createdAt: '2024-01-10T09:00:00Z',
          lastTriggered: '2024-01-18T09:00:00Z',
          executionCount: 3
        },
        {
          id: '3',
          name: 'Blocked Item Escalation',
          description: 'Escalate items blocked for more than 24 hours',
          trigger: {
            type: 'time_based',
            conditions: { status: 'blocked', duration: 24, unit: 'hours' }
          },
          actions: [
            {
              type: 'update_field',
              config: { field: 'priority', value: 'high' }
            },
            {
              type: 'assign_user',
              config: { user: 'scrum-master' }
            },
            {
              type: 'send_notification',
              config: { 
                template: 'blocked_escalation',
                recipients: ['scrum-master', 'tech-lead']
              }
            }
          ],
          isActive: true,
          createdAt: '2024-01-08T11:00:00Z',
          executionCount: 7
        }
      ];

      const mockTemplates: WorkflowTemplate[] = [
        {
          id: 'template-1',
          name: 'Bug Triage Workflow',
          description: 'Automated bug triage and assignment based on severity',
          category: 'escalation',
          isBuiltIn: true,
          rules: []
        },
        {
          id: 'template-2',
          name: 'Feature Approval Process',
          description: 'Multi-stage approval workflow for new features',
          category: 'approval',
          isBuiltIn: true,
          rules: []
        }
      ];

      setRules(mockRules);
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Failed to load automation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
  };

  const deleteRule = async (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const createRule = async (ruleData: Partial<AutomationRule>) => {
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      name: ruleData.name || 'New Rule',
      description: ruleData.description || '',
      trigger: ruleData.trigger || { type: 'status_change', conditions: {} },
      actions: ruleData.actions || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0
    };
    
    setRules(prev => [...prev, newRule]);
    setIsCreateDialogOpen(false);
  };

  const getRuleStatusIcon = (rule: AutomationRule) => {
    if (!rule.isActive) return <Pause className="h-4 w-4 text-muted-foreground" />;
    if (rule.executionCount > 0) return <CheckCircle className="h-4 w-4 text-success" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  const getTriggerDescription = (trigger: AutomationRule['trigger']) => {
    switch (trigger.type) {
      case 'status_change':
        return `When status changes from "${trigger.conditions.fromStatus}" to "${trigger.conditions.toStatus}"`;
      case 'time_based':
        return `Time-based trigger with conditions`;
      case 'assignment':
        return `When item is assigned`;
      case 'custom_field':
        return `When custom field changes`;
      default:
        return 'Unknown trigger';
    }
  };

  const getActionDescription = (action: AutomationRule['actions'][0]) => {
    switch (action.type) {
      case 'status_update':
        return `Update status to "${action.config.status}"`;
      case 'assign_user':
        return `Assign to user/pool`;
      case 'send_notification':
        return `Send notification`;
      case 'create_task':
        return `Create new task`;
      case 'update_field':
        return `Update field "${action.config.field}"`;
      default:
        return 'Unknown action';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading automation rules...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflow Automation</h2>
          <p className="text-muted-foreground">
            Automate repetitive tasks and enforce workflow policies
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <CreateRuleForm onSubmit={createRule} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Active Rules</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {rules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No automation rules yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first automation rule to streamline your workflow
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getRuleStatusIcon(rule)}
                          <h3 className="font-semibold">{rule.name}</h3>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{rule.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getTriggerDescription(rule.trigger)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}: {' '}
                              {rule.actions.map(action => getActionDescription(action)).join(', ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Executed {rule.executionCount} times</span>
                          {rule.lastTriggered && (
                            <span>Last: {new Date(rule.lastTriggered).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRuleStatus(rule.id)}
                        />
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="transition-colors hover:bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    {template.isBuiltIn && (
                      <Badge variant="secondary">Built-in</Badge>
                    )}
                  </div>
                  <Button variant="outline" className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                    <p className="text-2xl font-bold">
                      {rules.reduce((sum, rule) => sum + rule.executionCount, 0)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                    <p className="text-2xl font-bold">
                      {rules.filter(rule => rule.isActive).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                    <p className="text-2xl font-bold">24h</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CreateRuleForm: React.FC<{
  onSubmit: (data: Partial<AutomationRule>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'status_change',
    actionType: 'send_notification'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      trigger: {
        type: formData.triggerType as any,
        conditions: {}
      },
      actions: [{
        type: formData.actionType as any,
        config: {}
      }]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rule-name">Rule Name</Label>
        <Input
          id="rule-name"
          placeholder="Enter rule name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rule-description">Description</Label>
        <Textarea
          id="rule-description"
          placeholder="Describe what this rule does"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trigger-type">Trigger Type</Label>
        <Select 
          value={formData.triggerType} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, triggerType: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status_change">Status Change</SelectItem>
            <SelectItem value="time_based">Time Based</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
            <SelectItem value="custom_field">Custom Field</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="action-type">Action Type</Label>
        <Select 
          value={formData.actionType} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, actionType: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status_update">Update Status</SelectItem>
            <SelectItem value="assign_user">Assign User</SelectItem>
            <SelectItem value="send_notification">Send Notification</SelectItem>
            <SelectItem value="create_task">Create Task</SelectItem>
            <SelectItem value="update_field">Update Field</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.name}>
          Create Rule
        </Button>
      </div>
    </form>
  );
};