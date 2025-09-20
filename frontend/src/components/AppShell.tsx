import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Save, 
  GitBranch, 
  Sun, 
  Moon, 
  Command, 
  Search,
  User
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
  id?: string;
}

export default function AppShell({ children }: AppShellProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'syncing' | 'error'>('saved');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

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

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleSave = () => {
    setSaveStatus('syncing');
    // TODO: Implement actual save logic
    setTimeout(() => {
      setSaveStatus('saved');
    }, 1000);
  };

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saved': return 'text-green-600 bg-green-50 border-green-200';
      case 'unsaved': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'syncing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saved': return 'Saved';
      case 'unsaved': return 'Unsaved';
      case 'syncing': return 'Syncing...';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

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
              {/* Save Status */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                {getStatusText()}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saveStatus === 'syncing'}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>

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
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-4 border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent border-none outline-none text-lg placeholder-gray-400"
                  autoFocus
                />
                <button
                  onClick={() => setIsCommandPaletteOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ESC
                </button>
              </div>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Navigation</div>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <div className="font-medium">Go to Write</div>
                  <div className="text-sm text-gray-500">⌘W</div>
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <div className="font-medium">Go to Entities</div>
                  <div className="text-sm text-gray-500">⌘E</div>
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <div className="font-medium">Go to Commits</div>
                  <div className="text-sm text-gray-500">⌘C</div>
                </button>
                
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide mt-4">Create</div>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <div className="font-medium">New Epic</div>
                  <div className="text-sm text-gray-500">⌘⇧E</div>
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <div className="font-medium">New Chapter</div>
                  <div className="text-sm text-gray-500">⌘⇧K</div>
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <div className="font-medium">New Scene</div>
                  <div className="text-sm text-gray-500">⌘⇧N</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isCommandPaletteOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsCommandPaletteOpen(false)}
        />
      )}
    </div>
  );
}
