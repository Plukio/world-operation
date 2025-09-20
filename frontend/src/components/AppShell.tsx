import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  GitBranch, 
  Sun, 
  Moon, 
  Command, 
  User
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import CommandPalette from './CommandPalette';

interface AppShellProps {
  children: React.ReactNode;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
  id?: string;
}

export default function AppShell({ children }: AppShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize dark mode from localStorage
  // Update breadcrumbs based on current route
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const newBreadcrumbs: BreadcrumbItem[] = [
      { label: 'World Operation', path: '/' }
    ];

    if (pathSegments.length > 0) {
      newBreadcrumbs.push({ label: pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1) });
    }

    setBreadcrumbs(newBreadcrumbs);
  }, [location.pathname]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette toggle
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      
      // Navigation shortcuts
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        switch (e.key) {
          case 'w':
            e.preventDefault();
            navigate('/');
            break;
          case 'e':
            e.preventDefault();
            navigate('/entities');
            break;
          case 'c':
            e.preventDefault();
            navigate('/commits');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);


  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Product Name + Breadcrumbs */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">WO</span>
                </div>
                <h1 className="font-semibold text-gray-900 dark:text-white">World Operation</h1>
              </div>
              
              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-1 text-sm">
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <span className="text-gray-400 mx-2">›</span>}
                    {item.path ? (
                      <button
                        onClick={() => navigate(item.path!)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Center: Branch Selector */}
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-gray-500" />
              <select
                value={currentBranch}
                onChange={(e) => setCurrentBranch(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="main">main</option>
                <option value="draft">draft</option>
                <option value="feature">feature</option>
              </select>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {/* Command Palette */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Command Palette (⌘/)"
              >
                <Command className="w-4 h-4" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User Menu */}
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCreateEpic={() => {
          // TODO: Implement create epic functionality
          console.log('Create epic from command palette');
        }}
        onCreateEpisode={() => {
          // TODO: Implement create episode functionality
          console.log('Create episode from command palette');
        }}
        onCreateScene={() => {
          // TODO: Implement create scene functionality
          console.log('Create scene from command palette');
        }}
      />
    </div>
  );
}
