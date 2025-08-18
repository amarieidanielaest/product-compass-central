import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Tag, Calendar, User, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface SearchFilters {
  status: string[];
  priority: string[];
  category: string[];
  dateRange: string;
  assignee: string[];
  tags: string[];
}

interface SmartSearchProps {
  onSearchChange: (query: string, filters: SearchFilters) => void;
  availableCategories: string[];
  availableAssignees: { id: string; name: string }[];
  availableTags: string[];
  totalResults?: number;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  onSearchChange,
  availableCategories,
  availableAssignees,
  availableTags,
  totalResults
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    status: [],
    priority: [],
    category: [],
    dateRange: 'all',
    assignee: [],
    tags: []
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const statusOptions = ['submitted', 'in-review', 'planned', 'in-progress', 'completed', 'closed'];
  const priorityOptions = ['low', 'medium', 'high', 'critical'];
  const dateRangeOptions = [
    { value: 'all', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'quarter', label: 'This quarter' }
  ];

  useEffect(() => {
    onSearchChange(searchQuery, filters);
  }, [searchQuery, filters, onSearchChange]);

  const handleFilterChange = (filterType: keyof SearchFilters, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleArrayFilter = (filterType: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: (prev[filterType] as string[]).includes(value)
        ? (prev[filterType] as string[]).filter(item => item !== value)
        : [...(prev[filterType] as string[]), value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      category: [],
      dateRange: 'all',
      assignee: [],
      tags: []
    });
    setSearchQuery('');
  };

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).reduce((count, filter) => {
      if (Array.isArray(filter)) {
        return count + filter.length;
      }
      return filter !== 'all' && filter ? count + 1 : count;
    }, 0);
  }, [filters]);

  const getSearchSuggestions = () => {
    const suggestions = [
      'user authentication issues',
      'mobile app crashes',
      'dashboard improvements',
      'API integration',
      'performance optimization'
    ];
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search feedback, features, and discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
        {searchQuery && getSearchSuggestions().length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-lg z-50 mt-1">
            {getSearchSuggestions().slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                className="p-2 hover:bg-muted cursor-pointer text-sm"
                onClick={() => setSearchQuery(suggestion)}
              >
                <TrendingUp className="inline h-3 w-3 mr-2 text-muted-foreground" />
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status.includes(status)}
                        onCheckedChange={() => toggleArrayFilter('status', status)}
                      />
                      <Label
                        htmlFor={`status-${status}`}
                        className="text-sm capitalize cursor-pointer"
                      >
                        {status.replace('-', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Priority Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Priority</Label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map(priority => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={filters.priority.includes(priority)}
                        onCheckedChange={() => toggleArrayFilter('priority', priority)}
                      />
                      <Label
                        htmlFor={`priority-${priority}`}
                        className="text-sm capitalize cursor-pointer"
                      >
                        {priority}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Date Range</Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => handleFilterChange('dateRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRangeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              {availableCategories.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Categories</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={filters.category.includes(category)}
                            onCheckedChange={() => toggleArrayFilter('category', category)}
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="text-sm cursor-pointer"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick Filters */}
        <Select
          value={filters.dateRange}
          onValueChange={(value) => handleFilterChange('dateRange', value)}
        >
          <SelectTrigger className="w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Active Filter Badges */}
        {filters.status.map(status => (
          <Badge key={`status-${status}`} variant="secondary" className="gap-1">
            Status: {status.replace('-', ' ')}
            <button
              onClick={() => toggleArrayFilter('status', status)}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              ×
            </button>
          </Badge>
        ))}

        {filters.priority.map(priority => (
          <Badge key={`priority-${priority}`} variant="secondary" className="gap-1">
            Priority: {priority}
            <button
              onClick={() => toggleArrayFilter('priority', priority)}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              ×
            </button>
          </Badge>
        ))}

        {filters.category.map(category => (
          <Badge key={`category-${category}`} variant="secondary" className="gap-1">
            <Tag className="h-3 w-3" />
            {category}
            <button
              onClick={() => toggleArrayFilter('category', category)}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>

      {/* Results Summary */}
      {totalResults !== undefined && (
        <div className="text-sm text-muted-foreground">
          {totalResults} {totalResults === 1 ? 'result' : 'results'} found
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}
    </div>
  );
};