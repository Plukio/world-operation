import { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizablePaneProps {
  children: ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side: 'left' | 'right';
  className?: string;
}

export default function ResizablePane({ 
  children, 
  initialWidth = 300, 
  minWidth = 200, 
  maxWidth = 600,
  side,
  className = ''
}: ResizablePaneProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = side === 'left' ? e.clientX - startXRef.current : startXRef.current - e.clientX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minWidth, maxWidth, side]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  return (
    <div
      ref={paneRef}
      className={`relative bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}
      
      {/* Resize Handle */}
      <div
        className={`absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors ${
          side === 'left' ? 'right-0' : 'left-0'
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-8 bg-gray-300 dark:bg-gray-600 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
