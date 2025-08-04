import React, { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WorkItem } from '@/services/api/SprintService';

interface KeyboardShortcutsProps {
  selectedWorkItems: string[];
  workItems: WorkItem[];
  onCreateWorkItem?: () => void;
  onEditWorkItem?: (item: WorkItem) => void;
  onDeleteWorkItem?: (id: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onToggleView?: () => void;
  onFocusSearch?: () => void;
  onShowHelp?: () => void;
  onRefresh?: () => void;
  onNavigateToColumn?: (direction: 'left' | 'right') => void;
  onNavigateToItem?: (direction: 'up' | 'down') => void;
  isEnabled?: boolean;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  selectedWorkItems,
  workItems,
  onCreateWorkItem,
  onEditWorkItem,
  onDeleteWorkItem,
  onSelectAll,
  onClearSelection,
  onToggleView,
  onFocusSearch,
  onShowHelp,
  onRefresh,
  onNavigateToColumn,
  onNavigateToItem,
  isEnabled = true
}) => {
  const { toast } = useToast();

  const showShortcutToast = (shortcut: string, action: string) => {
    toast({
      title: "Keyboard Shortcut",
      description: `${shortcut}: ${action}`,
      duration: 2000,
    });
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEnabled) return;

    // Ignore shortcuts when typing in input fields
    const activeElement = document.activeElement as HTMLElement;
    const isTyping = activeElement?.tagName === 'INPUT' || 
                     activeElement?.tagName === 'TEXTAREA' || 
                     activeElement?.contentEditable === 'true';

    if (isTyping && !e.metaKey && !e.ctrlKey) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // Global shortcuts
    if (cmdOrCtrl) {
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          onCreateWorkItem?.();
          showShortcutToast('Cmd/Ctrl + N', 'Create new work item');
          break;
        case 'a':
          e.preventDefault();
          onSelectAll?.();
          showShortcutToast('Cmd/Ctrl + A', 'Select all items');
          break;
        case 'r':
          e.preventDefault();
          onRefresh?.();
          showShortcutToast('Cmd/Ctrl + R', 'Refresh board');
          break;
        case 'k':
          e.preventDefault();
          onFocusSearch?.();
          showShortcutToast('Cmd/Ctrl + K', 'Focus search');
          break;
        case 'e':
          e.preventDefault();
          if (selectedWorkItems.length === 1) {
            const selectedItem = workItems.find(item => item.id === selectedWorkItems[0]);
            if (selectedItem) {
              onEditWorkItem?.(selectedItem);
              showShortcutToast('Cmd/Ctrl + E', 'Edit selected item');
            }
          }
          break;
        case '/':
          e.preventDefault();
          onShowHelp?.();
          showShortcutToast('Cmd/Ctrl + /', 'Show help');
          break;
      }
      return;
    }

    // Navigation shortcuts (without modifiers)
    if (!cmdOrCtrl && !e.shiftKey && !e.altKey) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClearSelection?.();
          showShortcutToast('Esc', 'Clear selection');
          break;
        case 'v':
          e.preventDefault();
          onToggleView?.();
          showShortcutToast('V', 'Toggle view');
          break;
        case 'ArrowLeft':
        case 'h':
          e.preventDefault();
          onNavigateToColumn?.('left');
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          onNavigateToColumn?.('right');
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          onNavigateToItem?.('up');
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          onNavigateToItem?.('down');
          break;
        case 'Delete':
        case 'Backspace':
          if (e.shiftKey && selectedWorkItems.length > 0) {
            e.preventDefault();
            selectedWorkItems.forEach(id => onDeleteWorkItem?.(id));
            showShortcutToast('Shift + Delete', 'Delete selected items');
          }
          break;
        case '?':
          e.preventDefault();
          onShowHelp?.();
          showShortcutToast('?', 'Show help');
          break;
      }
    }

    // Number shortcuts for quick column navigation
    const numberKey = parseInt(e.key);
    if (!isNaN(numberKey) && numberKey >= 1 && numberKey <= 9 && !cmdOrCtrl && !e.shiftKey) {
      e.preventDefault();
      // Navigate to column by number (implementation depends on column order)
      showShortcutToast(`${numberKey}`, `Navigate to column ${numberKey}`);
    }
  }, [
    isEnabled,
    selectedWorkItems,
    workItems,
    onCreateWorkItem,
    onEditWorkItem,
    onDeleteWorkItem,
    onSelectAll,
    onClearSelection,
    onToggleView,
    onFocusSearch,
    onShowHelp,
    onRefresh,
    onNavigateToColumn,
    onNavigateToItem,
    toast
  ]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isEnabled]);

  return null; // This is a behavior-only component
};

// Helper component for displaying keyboard shortcuts help
export const KeyboardShortcutsHelp: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const shortcuts = [
    { key: 'Cmd/Ctrl + N', action: 'Create new work item' },
    { key: 'Cmd/Ctrl + A', action: 'Select all items' },
    { key: 'Cmd/Ctrl + E', action: 'Edit selected item' },
    { key: 'Cmd/Ctrl + R', action: 'Refresh board' },
    { key: 'Cmd/Ctrl + K', action: 'Focus search' },
    { key: 'Cmd/Ctrl + /', action: 'Show this help' },
    { key: 'Esc', action: 'Clear selection' },
    { key: 'V', action: 'Toggle board/list view' },
    { key: '←/H', action: 'Navigate left' },
    { key: '→/L', action: 'Navigate right' },
    { key: '↑/K', action: 'Navigate up' },
    { key: '↓/J', action: 'Navigate down' },
    { key: 'Shift + Delete', action: 'Delete selected items' },
    { key: '1-9', action: 'Jump to column' },
    { key: '?', action: 'Show help' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <span className="text-sm">{shortcut.action}</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          Press <kbd className="px-1 bg-muted rounded">Esc</kbd> or click outside to close
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;