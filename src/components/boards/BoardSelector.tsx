import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Building, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { CustomerBoard } from '@/services/api/BoardService';

interface BoardSelectorProps {
  boards: CustomerBoard[];
  selectedBoard: CustomerBoard | null;
  onSelectBoard: (board: CustomerBoard) => void;
  onCreateBoard: () => void;
}

export function BoardSelector({ boards, selectedBoard, onSelectBoard, onCreateBoard }: BoardSelectorProps) {
  const getBoardIcon = (board: CustomerBoard) => {
    switch (board.board_type) {
      case 'customer_specific':
        return <Building className="h-4 w-4" />;
      case 'internal':
        return <Users className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getBoardTypeLabel = (type: string) => {
    switch (type) {
      case 'customer_specific':
        return 'Customer';
      case 'internal':
        return 'Internal';
      default:
        return 'General';
    }
  };

  const getAccessTypeColor = (accessType: string) => {
    switch (accessType) {
      case 'private':
        return 'destructive';
      case 'invite_only':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const groupedBoards = boards.reduce((acc, board) => {
    if (!acc[board.board_type]) {
      acc[board.board_type] = [];
    }
    acc[board.board_type].push(board);
    return acc;
  }, {} as Record<string, CustomerBoard[]>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-between">
          <div className="flex items-center gap-2">
            {selectedBoard ? getBoardIcon(selectedBoard) : <Globe className="h-4 w-4" />}
            <span className="truncate">
              {selectedBoard ? selectedBoard.name : 'Select Board'}
            </span>
            {selectedBoard && (
              <Badge variant={getAccessTypeColor(selectedBoard.access_type)} className="text-xs">
                {getBoardTypeLabel(selectedBoard.board_type)}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px]" align="start">
        {Object.entries(groupedBoards).map(([type, boardList]) => (
          <div key={type}>
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
              {getBoardTypeLabel(type)} Boards
            </DropdownMenuLabel>
            {boardList.map((board) => (
              <DropdownMenuItem
                key={board.id}
                onClick={() => onSelectBoard(board)}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getBoardIcon(board)}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{board.name}</div>
                    {board.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {board.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={getAccessTypeColor(board.access_type)} className="text-xs">
                    {board.access_type}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </div>
        ))}
        <DropdownMenuItem onClick={onCreateBoard} className="p-3">
          <Plus className="h-4 w-4 mr-2" />
          Create New Board
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}