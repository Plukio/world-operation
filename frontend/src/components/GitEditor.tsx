import { useState } from 'react';
import RichTextEditor from './RichTextEditor';
import { useFirebaseStore } from '../store/useFirebaseStore';

interface GitEditorProps {
  currentSceneId?: string;
  currentSceneTitle?: string;
}

export default function GitEditor({ currentSceneId, currentSceneTitle }: GitEditorProps) {
  const { editor, setEditorHtml, autoSave, refreshCurrentScene } = useFirebaseStore();
  const [refreshingContent, setRefreshingContent] = useState(false);

  console.log('🔄 GitEditor: Rendering with scene:', { currentSceneId, currentSceneTitle, editorHtml: editor.html });

  const handleSave = async () => {
    console.log('🔧 Manual save triggered');
    await autoSave();
  };

  const handleRefresh = async () => {
    setRefreshingContent(true);
    try {
      await refreshCurrentScene();
    } finally {
      setRefreshingContent(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Editor Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {currentSceneTitle || 'Select a scene to start writing'}
            </h1>
            {currentSceneId && (
              <p className="text-sm text-gray-500 mt-1">
                Scene ID: {currentSceneId}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              {editor.autoSaving && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              
              {editor.dirty && !editor.autoSaving && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}

              {!editor.dirty && editor.lastSaved && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Saved {new Date(editor.lastSaved).toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshingContent}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 flex items-center space-x-1"
              >
                {refreshingContent ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleSave}
                disabled={!editor.dirty || editor.autoSaving}
                className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>{editor.autoSaving ? 'Saving...' : 'Save Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex flex-col">
        {currentSceneId ? (
          <div className="flex-1 flex flex-col">
            {/* Rich Text Editor */}
            <div className="flex-1 p-6">
              <RichTextEditor
                value={editor.html}
                onChange={setEditorHtml}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scene selected</h3>
              <p className="text-gray-500 mb-4">Choose a scene from the sidebar to start writing</p>
              <div className="text-sm text-gray-400">
                <p>• Create an Epic to organize your story</p>
                <p>• Add Chapters to structure your narrative</p>
                <p>• Write Scenes to bring your story to life</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
