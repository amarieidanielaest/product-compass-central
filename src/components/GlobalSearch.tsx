import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Calendar, User, FileText, Map, MessageSquare, Building, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'feedback' | 'article' | 'roadmap' | 'changelog' | 'board' | 'organization';
  url: string;
  createdAt: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

interface GlobalSearchProps {
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
}

const typeIcons = {
  feedback: MessageSquare,
  article: FileText,
  roadmap: Map,
  changelog: Calendar,
  board: User,
  organization: Building,
};

const typeLabels = {
  feedback: 'Feedback',
  article: 'Article',
  roadmap: 'Roadmap',
  changelog: 'Changelog',
  board: 'Board',
  organization: 'Organization',
};

const typeColors = {
  feedback: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  article: 'bg-green-500/10 text-green-500 border-green-500/20',
  roadmap: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  changelog: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  board: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  organization: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};

const GlobalSearch = ({ className, onResultSelect }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, selectedTypes]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setIsOpen(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('search', {
        body: {
          query: searchQuery,
          types: selectedTypes.length > 0 ? selectedTypes : undefined,
          limit: 20
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

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation
      window.location.href = result.url;
    }
    setIsOpen(false);
    setQuery('');
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
      
      // Escape to close
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary font-medium">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search across all content... (⌘K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-20 h-10"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {selectedTypes.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedTypes.length} filters
            </Badge>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Filter className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Filter by type</h4>
                  {selectedTypes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-1 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {Object.entries(typeLabels).map(([type, label]) => {
                    const Icon = typeIcons[type as keyof typeof typeIcons];
                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => handleTypeToggle(type)}
                        />
                        <label
                          htmlFor={type}
                          className="flex items-center space-x-2 text-sm font-medium cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-hidden z-50 border border-border/30">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((result, index) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <div key={`${result.type}-${result.id}`}>
                      <button
                        className="w-full text-left p-4 hover:bg-muted/50 transition-colors focus:bg-muted/50 focus:outline-none"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            "p-2 rounded-lg border",
                            typeColors[result.type]
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {highlightText(result.title, debouncedQuery)}
                              </h4>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {typeLabels[result.type]}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {highlightText(result.description, debouncedQuery)}
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
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      {index < results.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            ) : debouncedQuery.length >= 2 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No results found for "{debouncedQuery}"</p>
                <p className="text-xs text-muted-foreground mt-1">Try different keywords or remove filters</p>
              </div>
            ) : null}
            
            {!loading && results.length > 0 && (
              <div className="border-t border-border/30 p-2 bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  Found {results.length} results • Use ↑↓ to navigate • Enter to select
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;