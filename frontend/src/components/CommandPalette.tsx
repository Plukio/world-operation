import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEpic?: () => void;
  onCreateEpisode?: () => void;
  onCreateScene?: () => void;
}

interface Command {
  id: string;
  title: string;
  description: string;
  shortcut: string;
  action: () => void;
  category: 'navigation' | 'create';
}

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onCreateEpic, 
  onCreateEpisode, 
  onCreateScene 
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: Command[] = [
    {
      id: 'nav-write',
      title: 'Go to Write',
      description: 'Navigate to the writing interface',
      shortcut: '⌘W',
      action: () => navigate('/'),
      category: 'navigation'
    },
    {
      id: 'nav-entities',
      title: 'Go to Entities',
      description: 'Navigate to the entities page',
      shortcut: '⌘E',
      action: () => navigate('/entities'),
      category: 'navigation'
    },
    {
      id: 'nav-commits',
      title: 'Go to Commits',
      description: 'Navigate to the commits page',
      shortcut: '⌘C',
      action: () => navigate('/commits'),
      category: 'navigation'
    },
    {
      id: 'create-epic',
      title: 'New Epic',
      description: 'Create a new epic',
      shortcut: '⌘⇧E',
      action: () => {
        onCreateEpic?.();
        onClose();
      },
      category: 'create'
    },
    {
      id: 'create-episode',
      title: 'New Episode',
      description: 'Create a new episode',
      shortcut: '⌘⇧K',
      action: () => {
        onCreateEpisode?.();
        onClose();
      },
      category: 'create'
    },
    {
      id: 'create-scene',
      title: 'New Scene',
      description: 'Create a new scene',
      shortcut: '⌘⇧N',
      action: () => {
        onCreateScene?.();
        onClose();
      },
      category: 'create'
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigationCommands = filteredCommands.filter(cmd => cmd.category === 'navigation');
  const createCommands = filteredCommands.filter(cmd => cmd.category === 'create');

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Command palette toggle
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // This would be handled by the parent component
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
            />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ESC
            </button>
          </div>
        </div>

        {/* Commands */}
        <div className="p-2 max-h-96 overflow-y-auto">
          {navigationCommands.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Navigation</div>
              {navigationCommands.map((command) => {
                const globalIndex = filteredCommands.indexOf(command);
                return (
                  <button
                    key={command.id}
                    onClick={command.action}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      globalIndex === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{command.title}</div>
                    <div className="text-sm text-gray-500">{command.shortcut}</div>
                  </button>
                );
              })}
            </div>
          )}

          {createCommands.length > 0 && (
            <div className="space-y-1 mt-4">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Create</div>
              {createCommands.map((command) => {
                const globalIndex = filteredCommands.indexOf(command);
                return (
                  <button
                    key={command.id}
                    onClick={command.action}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      globalIndex === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{command.title}</div>
                    <div className="text-sm text-gray-500">{command.shortcut}</div>
                  </button>
                );
              })}
            </div>
          )}

          {filteredCommands.length === 0 && (
            <div className="px-3 py-8 text-center text-gray-500">
              No commands found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
    </div>
  );
}
