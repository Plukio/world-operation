import { useState } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';

interface FloatingBottomButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
}

export default function FloatingBottomButton({
  isOpen,
  onToggle,
  title,
  children,
  height = 400,
  minHeight = 300,
  maxHeight = 600
}: FloatingBottomButtonProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(height);

  const panelClasses = `
    fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-xl z-30
    transition-all duration-300 ease-in-out
    ${isOpen ? 'translate-y-0' : 'translate-y-full'}
    ${isMinimized ? 'h-12' : ''}
  `;

  const contentClasses = `
    w-full flex flex-col
    ${isMinimized ? 'h-12' : ''}
  `;

  const handleResize = (e: React.MouseEvent) => {
    if (isMinimized) return;
    
    const startY = e.clientY;
    const startHeight = currentHeight;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY; // Inverted because we're resizing from bottom
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
      setCurrentHeight(newHeight);
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
      {/* Floating Bottom Panel */}
      <div 
        className={panelClasses}
        style={{ 
          height: isMinimized ? '48px' : `${currentHeight}px`,
          width: '80%',
          maxWidth: '800px'
        }}
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
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
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
              className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-500 transition-colors"
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
