import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  Sparkles,
  Filter,
  X
} from 'lucide-react';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'article' | 'category' | 'tag' | 'recent';
  description?: string;
}

interface SmartSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
}

export const SmartSearch = ({ onSearch, placeholder = "Search...", suggestions = [] }: SmartSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'Getting started',
    'API integration',
    'User management',
    'Roadmap planning',
    'Feedback collection'
  ]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSearches = localStorage.getItem('kb-recent-searches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('kb-recent-searches', JSON.stringify(updated));
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      onSearch(searchQuery);
      setQuery(searchQuery);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allSuggestions = [
      ...suggestions.slice(0, 3),
      ...recentSearches.map(search => ({ id: search, title: search, type: 'recent' as const })),
      ...popularSearches.map(search => ({ id: search, title: search, type: 'tag' as const }))
    ].slice(0, 8);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allSuggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? allSuggestions.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSearch(allSuggestions[selectedIndex].title);
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('kb-recent-searches');
  };

  const allSuggestions = [
    ...suggestions.slice(0, 3),
    ...recentSearches.map(search => ({ id: search, title: search, type: 'recent' as const })),
    ...popularSearches.map(search => ({ id: search, title: search, type: 'tag' as const }))
  ].slice(0, 8);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4" />;
      case 'tag':
        return <TrendingUp className="h-4 w-4" />;
      case 'category':
        return <Filter className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'recent':
        return 'outline';
      case 'tag':
        return 'secondary';
      case 'category':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20 py-3 text-lg"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              onSearch('');
              inputRef.current?.focus();
            }}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          onClick={() => handleSearch(query)}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
          size="sm"
        >
          Search
        </Button>
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-auto">
          <CardContent className="p-0">
            {query.trim() && (
              <div className="p-3 border-b">
                <div 
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted ${
                    selectedIndex === -1 ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSearch(query)}
                >
                  <Search className="h-4 w-4" />
                  <span>Search for "{query}"</span>
                </div>
              </div>
            )}

            {allSuggestions.length > 0 && (
              <div className="p-2">
                {allSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted ${
                      selectedIndex === index ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSearch(suggestion.title)}
                  >
                    {getIconForType(suggestion.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{suggestion.title}</span>
                        <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs">
                          {suggestion.type}
                        </Badge>
                      </div>
                      {suggestion.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {suggestion.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recentSearches.length > 0 && (
              <div className="border-t p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {recentSearches.slice(0, 3).map((search) => (
                    <Badge
                      key={search}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted text-xs"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!query.trim() && allSuggestions.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2" />
                <p>Start typing to search our knowledge base</p>
                <p className="text-sm mt-1">Try: "getting started", "API", or "roadmap"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};