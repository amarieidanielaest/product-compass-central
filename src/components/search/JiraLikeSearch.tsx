import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Clock, 
  User, 
  Calendar, 
  Filter, 
  ArrowRight,
  FileText,
  Map,
  MessageSquare,
  Building,
  CheckSquare,
  X,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'feedback' | 'article' | 'roadmap' | 'changelog' | 'board' | 'organization' | 'work_item' | 'user';
  url: string;
  createdAt: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

interface SearchFilters {
  assignee: string[];
  reporter: string[];
  status: string[];
  priority: string[];
  dateRange: string;
  project: string[];
  sprint: string[];
}

interface RecentItem {
  id: string;
  title: string;
  type: string;
  url: string;
  timestamp: number;
}

const typeIcons = {
  feedback: MessageSquare,
  article: FileText,
  roadmap: Map,
  changelog: Calendar,
  board: User,
  organization: Building,
  work_item: CheckSquare,
  user: User,
};

const typeLabels = {
  feedback: 'Feedback',
  article: 'Article',
  roadmap: 'Roadmap',
  changelog: 'Changelog',
  board: 'Board',
  organization: 'Organization',
  work_item: 'Work Item',
  user: 'User',
};

const statusOptions = ['todo', 'in-progress', 'in-review', 'done', 'blocked'];
const priorityOptions = ['low', 'medium', 'high', 'critical'];
const dateRangeOptions = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Past 7 days' },
  { value: 'month', label: 'Past 30 days' },
  { value: 'quarter', label: 'Past 3 months' },
];

export const JiraLikeSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    assignee: [],
    reporter: [],
    status: [],
    priority: [],
    dateRange: 'all',
    project: [],
    sprint: []
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  // Load recent items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jira-search-recent');
    if (saved) {
      setRecentItems(JSON.parse(saved));
    }
  }, []);

  // Load users for assignee/reporter filters
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .limit(50);
      
      if (data) {
        setUsers(data);
      }
    };
    loadUsers();
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search', {
        body: {
          query: searchQuery,
          filters,
          limit: 50
        }
      });

      if (error) throw error;
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters]);

  const addToRecent = (item: SearchResult) => {
    const recentItem: RecentItem = {
      id: item.id,
      title: item.title,
      type: item.type,
      url: item.url,
      timestamp: Date.now()
    };

    const newRecent = [recentItem, ...recentItems.filter(r => r.id !== item.id)].slice(0, 10);
    setRecentItems(newRecent);
    localStorage.setItem('jira-search-recent', JSON.stringify(newRecent));
  };

  const handleSelect = (item: SearchResult) => {
    addToRecent(item);
    navigate(item.url);
    setOpen(false);
    setQuery('');
  };

  const clearFilters = () => {
    setFilters({
      assignee: [],
      reporter: [],
      status: [],
      priority: [],
      dateRange: 'all',
      project: [],
      sprint: []
    });
  };

  const toggleArrayFilter = (filterType: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: (prev[filterType] as string[]).includes(value)
        ? (prev[filterType] as string[]).filter(item => item !== value)
        : [...(prev[filterType] as string[]), value]
    }));
  };

  const activeFiltersCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + filter.length;
    }
    return filter !== 'all' && filter ? count + 1 : count;
  }, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Unknown';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        >
          <Search className="h-4 w-4 xl:mr-2" />
          <span className="hidden xl:inline-flex">Search...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[32rem] p-0" align="start" side="bottom" sideOffset={8}>
        <Command className="rounded-lg border-0 shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search issues, projects, people..."
              value={query}
              onValueChange={setQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeFiltersCount} filters
              </Badge>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              {/* Date Range Filter */}
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger className="w-auto h-8 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Assignee Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <User className="h-3 w-3 mr-1" />
                    Assignee
                    {filters.assignee.length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 text-xs">
                        {filters.assignee.length}
                      </Badge>
                    )}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Assignee</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {users.map(user => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`assignee-${user.id}`}
                            checked={filters.assignee.includes(user.id)}
                            onCheckedChange={() => toggleArrayFilter('assignee', user.id)}
                          />
                          <div className="flex items-center space-x-2 flex-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <label
                              htmlFor={`assignee-${user.id}`}
                              className="text-sm cursor-pointer truncate"
                            >
                              {getUserName(user.id)}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Status Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Status
                    {filters.status.length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 text-xs">
                        {filters.status.length}
                      </Badge>
                    )}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Status</h4>
                    {statusOptions.map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status.includes(status)}
                          onCheckedChange={() => toggleArrayFilter('status', status)}
                        />
                        <label
                          htmlFor={`status-${status}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {status.replace('-', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Priority Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Priority
                    {filters.priority.length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 text-xs">
                        {filters.priority.length}
                      </Badge>
                    )}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Priority</h4>
                    {priorityOptions.map(priority => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={filters.priority.includes(priority)}
                          onCheckedChange={() => toggleArrayFilter('priority', priority)}
                        />
                        <label
                          htmlFor={`priority-${priority}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {priority}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                Clear
              </Button>
            )}
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            )}

            {!loading && query.length === 0 && (
              <>
                {recentItems.length > 0 && (
                  <CommandGroup heading="Recent">
                    {recentItems.slice(0, 5).map((item) => {
                      const Icon = typeIcons[item.type as keyof typeof typeIcons] || FileText;
                      return (
                        <CommandItem
                          key={`recent-${item.id}`}
                          value={item.title}
                          onSelect={() => {
                            navigate(item.url);
                            setOpen(false);
                          }}
                          className="flex items-center space-x-3 py-2"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 truncate">{item.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[item.type as keyof typeof typeLabels]}
                          </Badge>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}

                <CommandGroup heading="Quick Actions">
                  <CommandItem onSelect={() => navigate('/feedback')}>
                    <MessageSquare className="h-4 w-4 mr-3" />
                    <span>View All Feedback</span>
                  </CommandItem>
                  <CommandItem onSelect={() => navigate('/roadmap')}>
                    <Map className="h-4 w-4 mr-3" />
                    <span>View Roadmap</span>
                  </CommandItem>
                  <CommandItem onSelect={() => navigate('/sprint')}>
                    <CheckSquare className="h-4 w-4 mr-3" />
                    <span>Sprint Board</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <CommandEmpty>No results found for "{query}"</CommandEmpty>
            )}

            {!loading && results.length > 0 && (
              <CommandGroup>
                {results.map((result) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-start space-x-3 py-3"
                    >
                      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate">{result.title}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {typeLabels[result.type]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(result.createdAt)}</span>
                          {result.metadata && (
                            <div className="flex items-center space-x-2">
                              {result.metadata.status && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.metadata.status}
                                </Badge>
                              )}
                              {result.metadata.priority && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.metadata.priority}
                                </Badge>
                              )}
                              {result.metadata.assignee && result.metadata.assignee !== 'Unassigned' && (
                                <span className="text-xs">
                                  → {result.metadata.assignee}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};