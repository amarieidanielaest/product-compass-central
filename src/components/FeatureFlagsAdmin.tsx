
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag, Plus, BarChart3, Users, Target } from 'lucide-react';
import { featureFlagsService, FeatureFlag } from '@/services/api/FeatureFlagsService';
import { useServiceCall } from '@/hooks/useServiceIntegration';

const FeatureFlagsAdmin = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: flagsData, loading, error, refetch } = useServiceCall(
    () => featureFlagsService.getAllFlags(),
    []
  );

  useEffect(() => {
    if (flagsData) {
      setFlags(flagsData);
    }
  }, [flagsData]);

  const handleCreateFlag = () => {
    setSelectedFlag({
      id: '',
      name: '',
      key: '',
      enabled: false,
      description: '',
      type: 'boolean',
      defaultValue: false,
      createdAt: '',
      updatedAt: '',
    });
    setIsCreating(true);
  };

  const handleSaveFlag = async (flag: FeatureFlag) => {
    try {
      if (isCreating) {
        await featureFlagsService.createFlag(flag);
      } else {
        await featureFlagsService.updateFlag(flag.id, flag);
      }
      refetch();
      setSelectedFlag(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to save flag:', error);
    }
  };

  const plgFlags = flags.filter(flag => 
    flag.key.includes('onboarding') || 
    flag.key.includes('activation') || 
    flag.key.includes('pricing') ||
    flag.key.includes('cta')
  );

  const experimentFlags = flags.filter(flag => flag.experiment);

  if (loading) return <div>Loading feature flags...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Flag className="w-8 h-8 mr-3 text-blue-600" />
          Feature Flags & Experiments
        </h1>
        <Button onClick={handleCreateFlag}>
          <Plus className="w-4 h-4 mr-2" />
          Create Flag
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Flags ({flags.length})</TabsTrigger>
          <TabsTrigger value="plg">PLG Experiments ({plgFlags.length})</TabsTrigger>
          <TabsTrigger value="active">Active Experiments ({experimentFlags.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {flags.map((flag) => (
              <Card key={flag.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedFlag(flag)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{flag.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{flag.key}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={flag.enabled ? "default" : "secondary"}>
                        {flag.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      {flag.experiment && (
                        <Badge variant="outline">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Experiment
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{flag.description}</p>
                  {flag.conditions && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {flag.conditions.percentage && `${flag.conditions.percentage}% rollout`}
                      {flag.conditions.userSegment && ` • ${flag.conditions.userSegment.join(', ')}`}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plg" className="space-y-4">
          <div className="grid gap-4">
            {plgFlags.map((flag) => (
              <Card key={flag.id} className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-800">
                    <Target className="w-4 h-4 mr-2" />
                    {flag.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{flag.description}</p>
                  {flag.experiment && (
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="font-medium text-emerald-800">Hypothesis:</p>
                      <p className="text-sm text-emerald-700">{flag.experiment.hypothesis}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {experimentFlags.map((flag) => (
              <Card key={flag.id} className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-800">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {flag.experiment?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Metrics:</strong> {flag.experiment?.metrics.join(', ')}</p>
                    <p className="text-sm"><strong>Started:</strong> {flag.experiment?.startDate}</p>
                    {flag.variants && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Variants:</p>
                        {Object.entries(flag.variants).map(([key, variant]) => (
                          <Badge key={key} variant="outline" className="mr-2">
                            {key}: {variant.weight}%
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedFlag && (
        <FlagEditor
          flag={selectedFlag}
          isCreating={isCreating}
          onSave={handleSaveFlag}
          onCancel={() => {
            setSelectedFlag(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
};

const FlagEditor: React.FC<{
  flag: FeatureFlag;
  isCreating: boolean;
  onSave: (flag: FeatureFlag) => void;
  onCancel: () => void;
}> = ({ flag, isCreating, onSave, onCancel }) => {
  const [editedFlag, setEditedFlag] = useState(flag);

  return (
    <Card className="fixed inset-4 z-50 overflow-auto">
      <CardHeader>
        <CardTitle>{isCreating ? 'Create' : 'Edit'} Feature Flag</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editedFlag.name}
              onChange={(e) => setEditedFlag({ ...editedFlag, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              value={editedFlag.key}
              onChange={(e) => setEditedFlag({ ...editedFlag, key: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={editedFlag.description}
            onChange={(e) => setEditedFlag({ ...editedFlag, description: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={editedFlag.enabled}
            onCheckedChange={(enabled) => setEditedFlag({ ...editedFlag, enabled })}
          />
          <Label>Enabled</Label>
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={editedFlag.type} onValueChange={(type: any) => setEditedFlag({ ...editedFlag, type })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(editedFlag)}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureFlagsAdmin;
