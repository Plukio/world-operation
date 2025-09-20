import { useState } from 'react';
import WorkingStoryStructure from './WorkingStoryStructure';
import RichTextEditor from './RichTextEditor';
import { useFirebaseStore } from '../store/useFirebaseStore';

export default function StoryLayout() {
  const { editor, setCurrentScene, setEditorHtml } = useFirebaseStore();
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const handleSceneSelect = (sceneId: string) => {
    console.log('Scene selected:', sceneId);
    setSelectedSceneId(sceneId);
    setCurrentScene(sceneId);
  };

  const handleEditorChange = (html: string) => {
    setEditorHtml(html);
    // Auto-save will be triggered by the store
  };

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
            {editor.autoSaving && (
              <div className="text-sm text-blue-600">Auto-saving...</div>
            )}
            {editor.dirty && !editor.autoSaving && (
              <div className="text-sm text-orange-600">Unsaved changes</div>
            )}
            {!editor.dirty && editor.lastSaved && (
              <div className="text-sm text-green-600">
                Saved {editor.lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6">
          {selectedSceneId ? (
            <div className="h-full">
              <RichTextEditor
                value={editor.html}
                onChange={handleEditorChange}
                placeholder="Start writing your scene..."
              />
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
                    <li>• Add Chapters to your Epic</li>
                    <li>• Create Scenes within Chapters</li>
                    <li>• Click on a Scene to start writing</li>
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
