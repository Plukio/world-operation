import { useState } from 'react';
import { useFirebaseStore } from '../store/useFirebaseStore';
import InlineEdit from './InlineEdit';

interface GitSidebarProps {
  onSceneSelect: (sceneId: string) => void;
  currentSceneId?: string;
}

export default function GitSidebar({ onSceneSelect, currentSceneId }: GitSidebarProps) {
  const { structure, createNode, updateNode, deleteNode, createScene, updateScene, deleteScene } = useFirebaseStore();
  const [editingItem, setEditingItem] = useState<{
    type: 'epic' | 'chapter' | 'scene';
    itemId: string;
    currentTitle: string;
  } | null>(null);

  const handleCreate = (type: 'epic' | 'chapter' | 'scene', parentId?: string) => {
    const title = prompt(`Enter ${type} name:`);
    if (title) {
      if (type === 'epic') {
        createNode('epic', title);
      } else if (type === 'chapter' && parentId) {
        createNode('chapter', title, parentId);
      } else if (type === 'scene' && parentId) {
        createScene(parentId, title);
      }
    }
  };

  const handleEdit = (type: 'epic' | 'chapter' | 'scene', itemId: string, currentTitle: string) => {
    setEditingItem({ type, itemId, currentTitle });
  };

  const handleInlineEditSubmit = async (newTitle: string) => {
    if (!editingItem) return;
    
    const { type, itemId } = editingItem;
    if (type === 'scene' && itemId) {
      await updateScene(itemId, newTitle);
    } else if (itemId) {
      await updateNode(itemId, newTitle);
    }
    setEditingItem(null);
  };

  const handleInlineEditCancel = () => {
    setEditingItem(null);
  };

  const handleDelete = async (type: 'epic' | 'chapter' | 'scene', itemId: string) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'scene') {
        await deleteScene(itemId);
      } else {
        await deleteNode(itemId);
      }
    }
  };

  const epics = structure.nodes.filter(node => node.kind === 'epic');

  return (
    <div className="w-80 bg-gray-900 text-gray-100 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Repository
          </h2>
          <button
            onClick={() => handleCreate('epic')}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800"
            title="New Epic"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Repository Structure */}
      <div className="flex-1 overflow-y-auto p-2">
        {epics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm">No epics yet</p>
            <p className="text-xs text-gray-600 mt-1">Create your first epic to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {epics.map((epic) => (
              <div key={epic.id} className="group">
                {/* Epic */}
                <div className="flex items-center justify-between p-2 rounded hover:bg-gray-800">
                  <div className="flex items-center space-x-2 flex-1">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                    {editingItem?.type === 'epic' && editingItem.itemId === epic.id ? (
                      <InlineEdit
                        value={editingItem.currentTitle}
                        onSave={handleInlineEditSubmit}
                        onCancel={handleInlineEditCancel}
                        className="flex-1 text-sm"
                      />
                    ) : (
                      <span 
                        onDoubleClick={() => epic.id && handleEdit('epic', epic.id, epic.title)}
                        className="text-sm font-medium text-gray-200 cursor-pointer hover:text-white flex-1"
                        title="Double-click to edit"
                      >
                        {epic.title}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => epic.id && handleCreate('chapter', epic.id)}
                      className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
                      title="Add Chapter"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => epic.id && handleDelete('epic', epic.id)}
                      className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-700"
                      title="Delete Epic"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Chapters */}
                <div className="ml-4 space-y-1">
                  {structure.nodes
                    .filter(node => node.parent_id === epic.id && node.kind === 'chapter')
                    .map((chapter) => (
                      <div key={chapter.id} className="group">
                        <div className="flex items-center justify-between p-2 rounded hover:bg-gray-800">
                          <div className="flex items-center space-x-2 flex-1">
                            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                            </svg>
                            {editingItem?.type === 'chapter' && editingItem.itemId === chapter.id ? (
                              <InlineEdit
                                value={editingItem.currentTitle}
                                onSave={handleInlineEditSubmit}
                                onCancel={handleInlineEditCancel}
                                className="flex-1 text-xs"
                              />
                            ) : (
                              <span 
                                onDoubleClick={() => chapter.id && handleEdit('chapter', chapter.id, chapter.title)}
                                className="text-xs text-gray-300 cursor-pointer hover:text-white flex-1"
                                title="Double-click to edit"
                              >
                                {chapter.title}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => chapter.id && handleCreate('scene', chapter.id)}
                              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
                              title="Add Scene"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => chapter.id && handleDelete('chapter', chapter.id)}
                              className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-700"
                              title="Delete Chapter"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Scenes */}
                        <div className="ml-4 space-y-1">
                          {structure.scenes
                            .filter(scene => scene.node_id === chapter.id)
                            .map((scene) => (
                              <div key={scene.id} className="group">
                                <div 
                                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                    currentSceneId === scene.id 
                                      ? 'bg-blue-600 text-white' 
                                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                                  }`}
                                  onClick={() => scene.id && onSceneSelect(scene.id)}
                                >
                                  <div className="flex items-center space-x-2 flex-1">
                                    <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                    </svg>
                                    {editingItem?.type === 'scene' && editingItem.itemId === scene.id ? (
                                      <InlineEdit
                                        value={editingItem.currentTitle}
                                        onSave={handleInlineEditSubmit}
                                        onCancel={handleInlineEditCancel}
                                        className="flex-1 text-xs"
                                      />
                                    ) : (
                                      <span 
                                        onDoubleClick={(e) => {
                                          e.stopPropagation();
                                          scene.id && handleEdit('scene', scene.id, scene.title);
                                        }}
                                        className="text-xs cursor-pointer flex-1"
                                        title="Double-click to edit"
                                      >
                                        {scene.title}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        scene.id && handleDelete('scene', scene.id);
                                      }}
                                      className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-700"
                                      title="Delete Scene"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
