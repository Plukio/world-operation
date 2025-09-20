import { useState, useEffect } from 'react';
import WorkingStoryStructure from './WorkingStoryStructure';
import RichTextEditor from './RichTextEditor';
import { sceneContentService } from '../lib/sceneContentService';

export default function StoryLayout() {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [sceneContent, setSceneContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSceneSelect = async (sceneId: string) => {
    console.log('Scene selected:', sceneId);
    setSelectedSceneId(sceneId);
    
    // Load scene content
    setIsLoading(true);
    try {
      const content = await sceneContentService.loadSceneContent(sceneId);
      setSceneContent(content);
      console.log('Scene content loaded:', content.substring(0, 100) + '...');
    } catch (error) {
      console.error('Error loading scene content:', error);
      setSceneContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorChange = (html: string) => {
    setSceneContent(html);
    
    // Auto-save with debouncing
    if (selectedSceneId) {
      setIsSaving(true);
      sceneContentService.autoSaveSceneContent(selectedSceneId, html)
        .then(() => {
          setLastSaved(new Date());
          setIsSaving(false);
        })
        .catch((error) => {
          console.error('Auto-save error:', error);
          setIsSaving(false);
        });
    }
  };

  // Subscribe to scene content changes when scene is selected
  useEffect(() => {
    if (!selectedSceneId) return;

    console.log('Setting up scene content subscription for:', selectedSceneId);
    
    const unsubscribe = sceneContentService.subscribeToSceneContent(
      selectedSceneId,
      (content) => {
        // Only update if content is different (avoid infinite loops)
        if (content !== sceneContent) {
          setSceneContent(content);
        }
      }
    );

    return () => {
      console.log('Cleaning up scene content subscription');
      unsubscribe();
    };
  }, [selectedSceneId, sceneContent]);

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Story Structure Sidebar */}
      <WorkingStoryStructure onSceneSelect={handleSceneSelect} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Modern Header */}
        <div className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 flex items-center px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WO</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {selectedSceneId ? 'Writing Canvas' : 'World Operation'}
                </h1>
                {selectedSceneId && (
                  <div className="text-xs text-gray-500 font-mono">
                    Scene: {selectedSceneId.substring(0, 8)}...
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Modern Status Indicators */}
          <div className="ml-auto flex items-center space-x-3">
            {isLoading && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Loading...</span>
              </div>
            )}
            {isSaving && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span>Auto-saving...</span>
              </div>
            )}
            {!isSaving && !isLoading && lastSaved && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modern Editor Area */}
        <div className="flex-1 p-8">
          {selectedSceneId ? (
            <div className="h-full flex flex-col space-y-4">
              {/* Scene Content Test Panel */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Scene Content Test</h3>
                  <div className="text-xs text-gray-500 font-mono">ID: {selectedSceneId}</div>
                </div>
                <div className="text-sm text-gray-600">
                  Content Length: {sceneContent.length} characters | 
                  Last Saved: {lastSaved ? lastSaved.toLocaleTimeString() : 'Never'}
                </div>
              </div>
              
              {/* Main Editor */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="text-gray-600 font-medium">Loading your creative space...</div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    <RichTextEditor
                      value={sceneContent}
                      onChange={handleEditorChange}
                      placeholder="✨ Begin your story here... Let your imagination flow freely..."
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <span className="text-white text-2xl font-bold">✍️</span>
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                    Welcome to World Operation
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    Your creative universe awaits. Build epic stories, one scene at a time.
                  </p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 max-w-lg mx-auto">
                  <h3 className="font-bold text-gray-900 mb-6 text-lg">🚀 Getting Started</h3>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                      <div>
                        <div className="font-medium text-gray-900">Create an Epic</div>
                        <div className="text-sm text-gray-600">Start your grand story with the "+ Epic" button</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                      <div>
                        <div className="font-medium text-gray-900">Add Episodes</div>
                        <div className="text-sm text-gray-600">Break your epic into episodes using "+E"</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                      <div>
                        <div className="font-medium text-gray-900">Create Scenes</div>
                        <div className="text-sm text-gray-600">Add scenes to episodes with "+S"</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</div>
                      <div>
                        <div className="font-medium text-gray-900">Start Writing</div>
                        <div className="text-sm text-gray-600">Click any scene to begin your creative journey</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <span className="text-lg">💾</span>
                      <span className="font-medium">Auto-save enabled</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">Your words are automatically saved as you type</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
