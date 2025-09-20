import { useState } from 'react';
import { sceneContentService } from '../lib/sceneContentService';

interface SceneContentTestProps {
  sceneId: string;
  sceneTitle: string;
}

export default function SceneContentTest({ sceneId, sceneTitle }: SceneContentTestProps) {
  const [testContent, setTestContent] = useState('');
  const [loadedContent, setLoadedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLoadContent = async () => {
    setIsLoading(true);
    try {
      const { content } = await sceneContentService.loadSceneContent(sceneId);
      setLoadedContent(content);
      console.log(`Loaded content for scene ${sceneId}:`, content);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      await sceneContentService.saveSceneContent(sceneId, testContent);
      console.log(`Saved content for scene ${sceneId}:`, testContent);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <h3 className="font-bold text-gray-900 mb-3">Scene Content Test: {sceneTitle}</h3>
      <div className="text-xs text-gray-500 mb-3">Scene ID: {sceneId}</div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Content:
          </label>
          <textarea
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Enter test content for this scene..."
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSaveContent}
            disabled={isSaving || !testContent.trim()}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Content'}
          </button>
          
          <button
            onClick={handleLoadContent}
            disabled={isLoading}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load Content'}
          </button>
        </div>
        
        {loadedContent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loaded Content:
            </label>
            <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm">
              {loadedContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
