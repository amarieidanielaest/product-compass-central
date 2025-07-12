import React, { useState } from 'react';
import { Plus, Target, GitBranch, Layers, Calendar, User, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StrategicQuickCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateItem?: (item: any) => void;
}

const StrategicQuickCreate = ({ isOpen, onClose, onCreateItem }: StrategicQuickCreateProps) => {
  const [selectedType, setSelectedType] = useState<'objective' | 'okr' | 'initiative'>('objective');
  
  // Form states
  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    pillar: 'market-expansion',
    timeframe: '',
    owner: '',
    status: 'planning'
  });

  const [okrForm, setOkrForm] = useState({
    title: '',
    description: '',
    type: 'objective',
    quarter: 'Q1',
    year: 2024,
    owner: '',
    target: '',
    unit: '',
    parentId: ''
  });

  const [initiativeForm, setInitiativeForm] = useState({
    name: '',
    description: '',
    businessValue: 'medium',
    effort: '',
    startDate: '',
    endDate: '',
    owner: '',
    status: 'planning'
  });

  const quickCreateOptions = [
    {
      id: 'objective',
      title: 'Strategic Objective',
      description: 'Long-term strategic goal',
      icon: Target,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'okr',
      title: 'OKR',
      description: 'Objective & Key Result',
      icon: GitBranch,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'initiative',
      title: 'Strategic Initiative',
      description: 'Major project or program',
      icon: Layers,
      color: 'bg-green-100 text-green-700'
    }
  ];

  const handleCreate = () => {
    let item;
    switch (selectedType) {
      case 'objective':
        item = {
          type: 'objective',
          data: objectiveForm
        };
        break;
      case 'okr':
        item = {
          type: 'okr',
          data: okrForm
        };
        break;
      case 'initiative':
        item = {
          type: 'initiative',
          data: initiativeForm
        };
        break;
    }
    
    onCreateItem?.(item);
    onClose();
    
    // Reset forms
    setObjectiveForm({
      title: '',
      description: '',
      pillar: 'market-expansion',
      timeframe: '',
      owner: '',
      status: 'planning'
    });
    setOkrForm({
      title: '',
      description: '',
      type: 'objective',
      quarter: 'Q1',
      year: 2024,
      owner: '',
      target: '',
      unit: '',
      parentId: ''
    });
    setInitiativeForm({
      name: '',
      description: '',
      businessValue: 'medium',
      effort: '',
      startDate: '',
      endDate: '',
      owner: '',
      status: 'planning'
    });
  };

  const isFormValid = () => {
    switch (selectedType) {
      case 'objective':
        return objectiveForm.title && objectiveForm.description;
      case 'okr':
        return okrForm.title && okrForm.description;
      case 'initiative':
        return initiativeForm.name && initiativeForm.description;
      default:
        return false;
    }
  };

  const renderObjectiveForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Objective Title</label>
        <Input
          value={objectiveForm.title}
          onChange={(e) => setObjectiveForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter strategic objective..."
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={objectiveForm.description}
          onChange={(e) => setObjectiveForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the strategic objective..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Strategic Pillar</label>
          <Select value={objectiveForm.pillar} onValueChange={(value) => setObjectiveForm(prev => ({ ...prev, pillar: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market-expansion">Market Expansion</SelectItem>
              <SelectItem value="operational-excellence">Operational Excellence</SelectItem>
              <SelectItem value="customer-delight">Customer Delight</SelectItem>
              <SelectItem value="innovation">Innovation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Timeframe</label>
          <Input
            value={objectiveForm.timeframe}
            onChange={(e) => setObjectiveForm(prev => ({ ...prev, timeframe: e.target.value }))}
            placeholder="2024-2026"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Owner</label>
          <Input
            value={objectiveForm.owner}
            onChange={(e) => setObjectiveForm(prev => ({ ...prev, owner: e.target.value }))}
            placeholder="CEO, CTO, etc."
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={objectiveForm.status} onValueChange={(value) => setObjectiveForm(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderOKRForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">OKR Title</label>
        <Input
          value={okrForm.title}
          onChange={(e) => setOkrForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter OKR title..."
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={okrForm.description}
          onChange={(e) => setOkrForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the OKR..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Type</label>
          <Select value={okrForm.type} onValueChange={(value) => setOkrForm(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="objective">Objective</SelectItem>
              <SelectItem value="key-result">Key Result</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Quarter</label>
          <Select value={okrForm.quarter} onValueChange={(value) => setOkrForm(prev => ({ ...prev, quarter: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1">Q1 2024</SelectItem>
              <SelectItem value="Q2">Q2 2024</SelectItem>
              <SelectItem value="Q3">Q3 2024</SelectItem>
              <SelectItem value="Q4">Q4 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Owner</label>
          <Input
            value={okrForm.owner}
            onChange={(e) => setOkrForm(prev => ({ ...prev, owner: e.target.value }))}
            placeholder="Team/Person"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Target</label>
          <Input
            value={okrForm.target}
            onChange={(e) => setOkrForm(prev => ({ ...prev, target: e.target.value }))}
            placeholder="100"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Unit</label>
          <Input
            value={okrForm.unit}
            onChange={(e) => setOkrForm(prev => ({ ...prev, unit: e.target.value }))}
            placeholder="%, users, $M"
          />
        </div>
      </div>
    </div>
  );

  const renderInitiativeForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Initiative Name</label>
        <Input
          value={initiativeForm.name}
          onChange={(e) => setInitiativeForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter initiative name..."
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={initiativeForm.description}
          onChange={(e) => setInitiativeForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the initiative..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Business Value</label>
          <Select value={initiativeForm.businessValue} onValueChange={(value) => setInitiativeForm(prev => ({ ...prev, businessValue: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Effort (weeks)</label>
          <Input
            value={initiativeForm.effort}
            onChange={(e) => setInitiativeForm(prev => ({ ...prev, effort: e.target.value }))}
            placeholder="12"
            type="number"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Start Date</label>
          <Input
            value={initiativeForm.startDate}
            onChange={(e) => setInitiativeForm(prev => ({ ...prev, startDate: e.target.value }))}
            type="date"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">End Date</label>
          <Input
            value={initiativeForm.endDate}
            onChange={(e) => setInitiativeForm(prev => ({ ...prev, endDate: e.target.value }))}
            type="date"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Owner</label>
          <Input
            value={initiativeForm.owner}
            onChange={(e) => setInitiativeForm(prev => ({ ...prev, owner: e.target.value }))}
            placeholder="Team/Person"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={initiativeForm.status} onValueChange={(value) => setInitiativeForm(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Quick Create Strategic Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-3 gap-4">
            {quickCreateOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedType(option.id as any)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${option.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{option.title}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Forms */}
          <div className="border-t pt-6">
            {selectedType === 'objective' && renderObjectiveForm()}
            {selectedType === 'okr' && renderOKRForm()}
            {selectedType === 'initiative' && renderInitiativeForm()}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!isFormValid()}>
              <Plus className="w-4 h-4 mr-2" />
              Create {quickCreateOptions.find(o => o.id === selectedType)?.title}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrategicQuickCreate;