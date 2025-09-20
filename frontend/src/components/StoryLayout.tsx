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
    <div className="h-screen flex bg-white">
      {/* Story Structure Sidebar */}
      <WorkingStoryStructure onSceneSelect={handleSceneSelect} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {selectedSceneId ? 'Scene Editor' : 'World Operation'}
            </h1>
            {selectedSceneId && (
              <div className="text-sm text-gray-500">
                Scene ID: {selectedSceneId}
              </div>
            )}
          </div>
          
          {/* Status Indicators */}
          <div className="ml-auto flex items-center space-x-4">
            {isLoading && (
              <div className="text-sm text-blue-600">Loading...</div>
            )}
            {isSaving && (
              <div className="text-sm text-blue-600">Auto-saving...</div>
            )}
            {!isSaving && !isLoading && lastSaved && (
              <div className="text-sm text-green-600">
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6">
          {selectedSceneId ? (
            <div className="h-full">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-gray-500">Loading scene content...</div>
                </div>
              ) : (
                <RichTextEditor
                  value={sceneContent}
                  onChange={handleEditorChange}
                  placeholder="Start writing your scene..."
                />
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Welcome to World Operation
                </h2>
                <p className="text-gray-600 mb-6">
                  Select a scene from the sidebar to start writing
                </p>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-md">
                  <h3 className="font-medium text-gray-900 mb-2">Getting Started:</h3>
                  <ul className="text-sm text-gray-600 space-y-1 text-left">
                    <li>• Create an Epic using the "+ Epic" button</li>
                    <li>• Add Episodes to your Epic</li>
                    <li>• Create Scenes within Episodes</li>
                    <li>• Click on a Scene to start writing</li>
                    <li>• Content auto-saves as you type</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
