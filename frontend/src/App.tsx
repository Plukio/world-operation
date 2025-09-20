import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WritingCanvas } from './components/WritingCanvas';
import { ComposerModal } from './components/ComposerModal';
import type { ExtractionResult } from './types';

const queryClient = new QueryClient();

function App() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

  const handleExtractionComplete = (result: ExtractionResult) => {
    setExtractionResult(result);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">World Operation</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Scene Composer
                </button>
                {extractionResult && (
                  <div className="text-sm text-gray-600">
                    {extractionResult.characters.length + extractionResult.places.length + 
                     extractionResult.events.length + extractionResult.objects.length} entities found
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <WritingCanvas onExtractionComplete={handleExtractionComplete} />
        </main>

        {/* Composer Modal */}
        <ComposerModal 
          isOpen={isComposerOpen} 
          onClose={() => setIsComposerOpen(false)} 
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
