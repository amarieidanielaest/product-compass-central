
import { useState } from 'react';
import { X, Upload, Tag, Building2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateTicketDialogProps {
  onClose: () => void;
  boardId?: string | null;
  boards: Array<{
    id: string;
    name: string;
    type: 'public' | 'enterprise';
    customerId?: string;
  }>;
}

const CreateTicketDialog = ({ onClose, boardId, boards }: CreateTicketDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    boardId: boardId || '',
    tags: [] as string[],
    businessValue: '',
    estimatedEffort: '',
    submitterEmail: '',
    customerName: ''
  });
  const [currentTag, setCurrentTag] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const categories = [
    { value: 'feature', label: '✨ Feature Request', description: 'New functionality or enhancement' },
    { value: 'bug', label: '🐛 Bug Report', description: 'Something is broken or not working' },
    { value: 'improvement', label: '🚀 Improvement', description: 'Enhance existing functionality' },
    { value: 'integration', label: '🔌 Integration', description: 'Connect with external services' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const businessValues = [
    { value: 'low', label: 'Low Impact' },
    { value: 'medium', label: 'Medium Impact' },
    { value: 'high', label: 'High Impact' }
  ];

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating ticket:', formData);
    console.log('Attachments:', attachments);
    onClose();
  };

  const selectedBoard = boards.find(board => board.id === formData.boardId);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Submit New Feedback
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Board Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Select Board <span className="text-red-500">*</span>
                </label>
                <Select value={formData.boardId} onValueChange={(value) => setFormData(prev => ({ ...prev, boardId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a feedback board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id}>
                        <div className="flex items-center space-x-2">
                          {board.type === 'public' ? 
                            <Globe className="w-4 h-4 text-blue-500" /> : 
                            <Building2 className="w-4 h-4 text-orange-500" />
                          }
                          <span>{board.name}</span>
                          <Badge variant={board.type === 'public' ? 'default' : 'secondary'} className="text-xs">
                            {board.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBoard && (
                  <p className="text-xs text-slate-500">
                    {selectedBoard.type === 'public' 
                      ? 'This feedback will be visible to all users' 
                      : 'This feedback will only be visible to your organization'
                    }
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Brief, descriptive title for your feedback"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Card 
                      key={category.value}
                      className={`cursor-pointer transition-colors ${
                        formData.category === category.value 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                    >
                      <CardContent className="p-4">
                        <div className="font-medium text-sm mb-1">{category.label}</div>
                        <div className="text-xs text-slate-600">{category.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Provide detailed description of your feedback, including:&#10;• What you're trying to achieve&#10;• Current limitations or issues&#10;• Expected behavior or desired outcome&#10;• Any relevant context or use cases"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[120px]"
                  required
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tags</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add relevant tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Tag className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* File Attachments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Attachments</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      Drop files here or <span className="text-purple-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Images, PDFs, and documents up to 10MB
                    </p>
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-700">{file.name}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {priorities.map((priority) => (
                    <Card 
                      key={priority.value}
                      className={`cursor-pointer transition-colors ${
                        formData.priority === priority.value 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                    >
                      <CardContent className="p-3">
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Business Value */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Business Value</label>
                <Select value={formData.businessValue} onValueChange={(value) => setFormData(prev => ({ ...prev, businessValue: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact level" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessValues.map((value) => (
                      <SelectItem key={value.value} value={value.value}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">Contact Information</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Your Email</label>
                  <Input
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, submitterEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Organization</label>
                  <Input
                    placeholder="Your company name"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Estimated Effort */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Estimated Effort</label>
                <Select value={formData.estimatedEffort} onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedEffort: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="How complex is this?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick Fix (&lt; 1 week)</SelectItem>
                    <SelectItem value="1-sprint">Small (1 sprint)</SelectItem>
                    <SelectItem value="2-3-sprints">Medium (2-3 sprints)</SelectItem>
                    <SelectItem value="epic">Large (Epic/Multiple sprints)</SelectItem>
                    <SelectItem value="unknown">Not sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              {selectedBoard?.type === 'public' 
                ? 'This feedback will be publicly visible and can be voted on by the community'
                : 'This feedback will only be visible to your organization and the product team'
              }
            </p>
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.title || !formData.description || !formData.category || !formData.priority || !formData.boardId}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketDialog;
