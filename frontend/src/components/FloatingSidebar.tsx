import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface FloatingSidebarProps {
  side: 'left' | 'right';
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export default function FloatingSidebar({
  side,
  isOpen,
  onToggle,
  title,
  children,
  width = 320,
  minWidth = 250,
  maxWidth = 500
}: FloatingSidebarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);

  const sidebarClasses = `
    fixed top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl z-30
    transition-all duration-300 ease-in-out
    ${side === 'left' ? 'left-0' : 'right-0'}
    ${isOpen ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'}
    ${isMinimized ? 'w-12' : ''}
  `;

  const contentClasses = `
    h-full flex flex-col
    ${isMinimized ? 'w-12' : ''}
  `;

  const handleResize = (e: React.MouseEvent) => {
    if (isMinimized) return;
    
    const startX = e.clientX;
    const startWidth = currentWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = side === 'left' ? e.clientX - startX : startX - e.clientX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
      setCurrentWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {/* Sidebar */}
      <div 
        className={sidebarClasses}
        style={{ width: isMinimized ? '48px' : `${currentWidth}px` }}
      >
        <div className={contentClasses}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            {!isMinimized && (
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h3>
            )}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  side === 'left' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
                ) : (
                  side === 'left' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          )}

          {/* Resize Handle */}
          {!isMinimized && (
            <div
              className={`absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors ${
                side === 'left' ? 'right-0' : 'left-0'
              }`}
              onMouseDown={handleResize}
            />
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={onToggle}
        />
      )}
    </>
  );
}
