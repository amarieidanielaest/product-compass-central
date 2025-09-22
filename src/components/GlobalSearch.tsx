import { JiraLikeSearch } from './search/JiraLikeSearch';

interface GlobalSearchProps {
  className?: string;
  onResultSelect?: (result: any) => void;
}

const GlobalSearch = ({ className, onResultSelect }: GlobalSearchProps) => {
  return <JiraLikeSearch />;
};

export default GlobalSearch;