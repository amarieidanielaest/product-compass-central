import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Minus, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CapacityManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CapacityManager = ({ open, onOpenChange }: CapacityManagerProps) => {
  const [teams, setTeams] = useState([
    {
      id: 'frontend',
      name: 'Frontend Team',
      members: 4,
      capacity: 85,
      allocated: 85,
      initiatives: ['Self-Service Onboarding v2', 'Cross-Product Navigation', 'UI Refresh'],
      skills: ['React', 'TypeScript', 'CSS'],
      color: 'green'
    },
    {
      id: 'platform',
      name: 'Platform Team',
      members: 3,
      capacity: 65,
      allocated: 65,
      initiatives: ['Cross-Product Navigation', 'Infrastructure Scaling'],
      skills: ['Node.js', 'AWS', 'Docker'],
      color: 'blue'
    },
    {
      id: 'ai-ml',
      name: 'AI/ML Team',
      members: 2,
      capacity: 90,
      allocated: 100,
      initiatives: ['AI-Powered Feedback Analysis'],
      skills: ['Python', 'TensorFlow', 'NLP'],
      color: 'orange'
    }
  ]);

  const [newTeam, setNewTeam] = useState({
    name: '',
    members: 1,
    capacity: 80
  });

  const addTeam = () => {
    if (newTeam.name.trim()) {
      const team = {
        id: newTeam.name.toLowerCase().replace(/\s+/g, '-'),
        name: newTeam.name,
        members: newTeam.members,
        capacity: newTeam.capacity,
        allocated: 0,
        initiatives: [],
        skills: [],
        color: 'gray'
      };
      setTeams(prev => [...prev, team]);
      setNewTeam({ name: '', members: 1, capacity: 80 });
    }
  };

  const updateTeamCapacity = (teamId: string, capacity: number) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId ? { ...team, capacity } : team
    ));
  };

  const getCapacityStatus = (allocated: number, capacity: number) => {
    const utilization = (allocated / capacity) * 100;
    if (utilization > 95) return 'over-allocated';
    if (utilization > 85) return 'high-utilization';
    if (utilization < 60) return 'under-utilized';
    return 'optimal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over-allocated': return 'text-red-700 bg-red-50 border-red-200';
      case 'high-utilization': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'under-utilized': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-green-700 bg-green-50 border-green-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Team Capacity Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Teams</p>
                    <p className="text-2xl font-bold">{teams.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.members, 0)}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Utilization</p>
                    <p className="text-2xl font-bold">
                      {Math.round(teams.reduce((sum, team) => sum + (team.allocated / team.capacity), 0) / teams.length * 100)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Team Capacity Overview</h3>
            </div>
            
            {teams.map((team) => {
              const status = getCapacityStatus(team.allocated, team.capacity);
              const utilization = (team.allocated / team.capacity) * 100;
              
              return (
                <div key={team.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{team.name}</h4>
                      <p className="text-sm text-gray-600">{team.members} members</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(status)}>
                      {status.replace('-', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <Label className="text-xs">Capacity %</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={team.capacity}
                          onChange={(e) => updateTeamCapacity(team.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-8"
                          min="0"
                          max="150"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTeamCapacity(team.id, Math.max(0, team.capacity - 10))}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTeamCapacity(team.id, Math.min(150, team.capacity + 10))}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Allocated</Label>
                      <p className="text-lg font-bold">{team.allocated}%</p>
                    </div>
                    <div>
                      <Label className="text-xs">Utilization</Label>
                      <p className="text-lg font-bold">{Math.round(utilization)}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          utilization > 95 ? 'bg-red-500' :
                          utilization > 85 ? 'bg-orange-500' :
                          utilization < 60 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, utilization)}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Initiatives */}
                  <div className="mb-3">
                    <Label className="text-xs">Active Initiatives</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {team.initiatives.map((initiative, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {initiative}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label className="text-xs">Key Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {team.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Team */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Add New Team</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Backend Team"
                />
              </div>
              <div>
                <Label htmlFor="team-members">Members</Label>
                <Input
                  id="team-members"
                  type="number"
                  value={newTeam.members}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, members: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="team-capacity">Initial Capacity %</Label>
                <Input
                  id="team-capacity"
                  type="number"
                  value={newTeam.capacity}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, capacity: parseInt(e.target.value) || 80 }))}
                  min="0"
                  max="150"
                />
              </div>
            </div>
            <Button onClick={addTeam} className="mt-3" disabled={!newTeam.name.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Team
            </Button>
          </div>

          {/* Capacity Alerts */}
          {teams.some(team => getCapacityStatus(team.allocated, team.capacity) === 'over-allocated') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Capacity Alerts</h4>
                  <div className="text-sm text-red-700 mt-1">
                    {teams
                      .filter(team => getCapacityStatus(team.allocated, team.capacity) === 'over-allocated')
                      .map(team => (
                        <p key={team.id}>
                          {team.name} is over-allocated by {Math.round((team.allocated / team.capacity - 1) * 100)}%
                        </p>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CapacityManager;