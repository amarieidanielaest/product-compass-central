import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Star, Bug, Rocket, Zap, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerBoard, EnhancedFeedbackItem } from '@/services/api/BoardService';

const feedbackSchema = z.object({
  board_id: z.string().min(1, 'Please select a feedback board'),
  title: z.string().min(1, 'Title is required').max(100),
  category: z.enum(['feature', 'bug', 'improvement', 'integration']),
  description: z.string().min(10, 'Please provide a detailed description'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  business_value: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.string().optional(),
  email: z.string().email('Invalid email address'),
  organization: z.string().min(1, 'Organization name is required'),
  effort_estimate: z.number().min(1).max(10).optional(),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

interface EnhancedCreateFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boards: CustomerBoard[];
  selectedBoard?: CustomerBoard;
  onCreateFeedback: (feedback: Partial<EnhancedFeedbackItem>) => Promise<void>;
}

export function EnhancedCreateFeedbackDialog({
  open,
  onOpenChange,
  boards,
  selectedBoard,
  onCreateFeedback,
}: EnhancedCreateFeedbackDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      board_id: selectedBoard?.id || '',
      title: '',
      category: 'feature',
      description: '',
      priority: 'medium',
      business_value: 'medium',
      tags: '',
      email: '',
      organization: '',
      effort_estimate: 1,
    },
  });

  const handleSubmit = async (data: FeedbackForm) => {
    setIsSubmitting(true);
    try {
      const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
      
      await onCreateFeedback({
        board_id: data.board_id,
        title: data.title,
        description: data.description,
        category: data.category,
        status: 'submitted',
        priority: data.priority,
        tags,
        customer_info: {
          email: data.email,
          organization: data.organization,
          business_value: data.business_value,
        },
        effort_estimate: data.effort_estimate || 0,
        impact_score: data.business_value === 'high' ? 8 : data.business_value === 'medium' ? 5 : 3,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    {
      value: 'feature',
      label: 'Feature Request',
      description: 'New functionality or enhancement',
      icon: Star,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    },
    {
      value: 'bug',
      label: 'Bug Report',
      description: 'Something is broken or not working',
      icon: Bug,
      color: 'bg-red-50 border-red-200 text-red-800',
    },
    {
      value: 'improvement',
      label: 'Improvement',
      description: 'Enhance existing functionality',
      icon: Rocket,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
    },
    {
      value: 'integration',
      label: 'Integration',
      description: 'Connect with external services',
      icon: Zap,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
    },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'critical', label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-primary">
              Submit New Feedback
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="board_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Select Board <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-primary text-foreground">
                            <SelectValue placeholder="Choose a feedback board" className="text-foreground" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200">
                          {boards.map((board) => (
                            <SelectItem key={board.id} value={board.id} className="text-foreground">
                              {board.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief, descriptive title for your feedback"
                          className="bg-white border-2 border-gray-300 focus:border-primary text-foreground placeholder:text-muted-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Category <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {categoryOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => field.onChange(option.value)}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                field.value === option.value
                                  ? option.color + ' border-current'
                                  : 'bg-white border-gray-300 hover:border-gray-400 text-foreground'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-sm">{option.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {option.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Description <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed description of your feedback, including: • What you're trying to achieve • Current limitations or issues • Expected behavior or desired outcome • Any relevant context or use cases"
                          className="bg-white border-2 border-gray-300 focus:border-primary min-h-[120px] resize-none text-foreground placeholder:text-muted-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Tags</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Add relevant tags"
                            className="bg-white border-2 border-gray-300 focus:border-primary pr-10 text-foreground placeholder:text-muted-foreground"
                            {...field}
                          />
                          <Plus className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Priority <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="space-y-2">
                        {priorityOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                              field.value === option.value
                                ? option.color + ' border-current'
                                : 'bg-white border-gray-300 hover:border-gray-400 text-foreground'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Business Value</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-primary text-foreground">
                            <SelectValue placeholder="Select impact level" className="text-foreground" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200">
                          <SelectItem value="low" className="text-foreground">Low Impact</SelectItem>
                          <SelectItem value="medium" className="text-foreground">Medium Impact</SelectItem>
                          <SelectItem value="high" className="text-foreground">High Impact</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Contact Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Your Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@company.com"
                            type="email"
                            className="bg-white border-2 border-gray-300 focus:border-primary text-foreground placeholder:text-muted-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Organization</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your company name"
                            className="bg-white border-2 border-gray-300 focus:border-primary text-foreground placeholder:text-muted-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="effort_estimate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Estimated Effort</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-primary text-foreground">
                            <SelectValue placeholder="Select effort level" className="text-foreground" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-gray-200">
                          <SelectItem value="1" className="text-foreground">1 - Very Small</SelectItem>
                          <SelectItem value="2" className="text-foreground">2 - Small</SelectItem>
                          <SelectItem value="3" className="text-foreground">3 - Medium</SelectItem>
                          <SelectItem value="5" className="text-foreground">5 - Large</SelectItem>
                          <SelectItem value="8" className="text-foreground">8 - Very Large</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}