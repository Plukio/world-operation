import { useFirebaseStore } from '../store/useFirebaseStore';

interface MinimalToolbarProps {
  currentScene?: { id: string; title: string; node_id: string; order_idx: number };
  currentBranch?: { id: string; name: string; repo_id: string; created_at: string } | null;
}

export default function MinimalToolbar({ currentScene, currentBranch }: MinimalToolbarProps) {
  const { editor, autoSave, saveVersion } = useFirebaseStore();

  const handleSave = async () => {
    await saveVersion('Manual save');
  };

  const handleAutoSave = async () => {
    await autoSave();
  };

  return (
    <div className="border-b border-gray-200 px-4 py-2 bg-white flex items-center justify-between">
      {/* Left side - Scene info */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          {currentScene ? (
            <span className="font-medium">{currentScene.title}</span>
          ) : (
            <span className="text-gray-400">No scene selected</span>
          )}
        </div>
        {currentBranch && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {currentBranch.name}
          </div>
        )}
      </div>

      {/* Center - Status */}
      <div className="flex items-center space-x-4">
        {editor.autoSaving && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm">Saving...</span>
          </div>
        )}
        
        {editor.dirty && !editor.autoSaving && (
          <div className="flex items-center space-x-2 text-orange-600">
            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
            <span className="text-sm">Unsaved</span>
          </div>
        )}

        {!editor.dirty && editor.lastSaved && (
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm">Saved</span>
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleAutoSave}
          disabled={!editor.dirty || editor.autoSaving}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Auto Save
        </button>
        
        <button
          onClick={handleSave}
          disabled={!editor.dirty || editor.autoSaving}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </div>
  );
}
