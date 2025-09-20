import { useState } from 'react';
import { useFirebaseStore } from '../store/useFirebaseStore';

interface MinimalSidebarProps {
  onSceneSelect: (sceneId: string) => void;
  currentSceneId?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function MinimalSidebar({ 
  onSceneSelect, 
  currentSceneId, 
  collapsed, 
  onToggleCollapse 
}: MinimalSidebarProps) {
  const { structure, createNode, updateNode, deleteNode, createScene, updateScene, deleteScene } = useFirebaseStore();
  const [editingItem, setEditingItem] = useState<{
    type: 'epic' | 'chapter' | 'scene';
    itemId: string;
    currentTitle: string;
  } | null>(null);

  const handleCreate = async (type: 'epic' | 'chapter' | 'scene', parentId?: string) => {
    const title = prompt(`Enter ${type} name:`);
    if (title) {
      try {
        if (type === 'epic') {
          await createNode('epic', title);
        } else if (type === 'chapter' && parentId) {
          await createNode('chapter', title, parentId);
        } else if (type === 'scene' && parentId) {
          await createScene(parentId, title);
        }
      } catch (error) {
        console.error('Failed to create:', error);
      }
    }
  };

  const handleEdit = (type: 'epic' | 'chapter' | 'scene', itemId: string, currentTitle: string) => {
    setEditingItem({ type, itemId, currentTitle });
  };

  const handleInlineEditSubmit = async (newTitle: string) => {
    if (!editingItem) return;
    
    const { type, itemId } = editingItem;
    try {
      if (type === 'scene' && itemId) {
        await updateScene(itemId, newTitle);
      } else if (itemId) {
        await updateNode(itemId, newTitle);
      }
    } catch (error) {
      console.error('Failed to update:', error);
    }
    setEditingItem(null);
  };

  const handleInlineEditCancel = () => {
    setEditingItem(null);
  };

  const handleDelete = async (type: 'epic' | 'chapter' | 'scene', itemId: string) => {
    if (confirm(`Delete ${type}?`)) {
      try {
        if (type === 'scene') {
          await deleteScene(itemId);
        } else {
          await deleteNode(itemId);
        }
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const epics = structure.nodes.filter(node => node.kind === 'epic');

  if (collapsed) {
    return (
      <div className="h-full bg-gray-50 flex flex-col items-center py-4 space-y-2">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-200 rounded"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => handleCreate('epic')}
          className="p-2 hover:bg-gray-200 rounded"
          title="New Epic"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Story</h2>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleCreate('epic')}
            className="p-1 hover:bg-gray-200 rounded"
            title="New Epic"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-200 rounded"
            title="Collapse sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {epics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No epics yet</p>
            <p className="text-xs mt-1">Create your first epic</p>
          </div>
        ) : (
          <div className="space-y-1">
            {epics.map((epic) => (
              <div key={epic.id} className="group">
                {/* Epic */}
                <div className="flex items-center justify-between p-2 rounded hover:bg-gray-100">
                  <div className="flex items-center space-x-2 flex-1">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                    {editingItem?.type === 'epic' && editingItem.itemId === epic.id ? (
                      <input
                        type="text"
                        defaultValue={editingItem.currentTitle}
                        onBlur={(e) => handleInlineEditSubmit(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleInlineEditSubmit(e.currentTarget.value);
                          if (e.key === 'Escape') handleInlineEditCancel();
                        }}
                        className="flex-1 text-sm border-none bg-transparent focus:outline-none focus:bg-white px-1"
                        autoFocus
                      />
                    ) : (
                      <span 
                        onDoubleClick={() => epic.id && handleEdit('epic', epic.id, epic.title)}
                        className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
                      >
                        {epic.title}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => epic.id && handleCreate('chapter', epic.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Add Chapter"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => epic.id && handleDelete('epic', epic.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="Delete Epic"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Chapters */}
                <div className="ml-6 space-y-1">
                  {structure.nodes
                    .filter(node => node.parent_id === epic.id && node.kind === 'chapter')
                    .map((chapter) => (
                      <div key={chapter.id} className="group">
                        <div className="flex items-center justify-between p-2 rounded hover:bg-gray-100">
                          <div className="flex items-center space-x-2 flex-1">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                            </svg>
                            {editingItem?.type === 'chapter' && editingItem.itemId === chapter.id ? (
                              <input
                                type="text"
                                defaultValue={editingItem.currentTitle}
                                onBlur={(e) => handleInlineEditSubmit(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleInlineEditSubmit(e.currentTarget.value);
                                  if (e.key === 'Escape') handleInlineEditCancel();
                                }}
                                className="flex-1 text-xs border-none bg-transparent focus:outline-none focus:bg-white px-1"
                                autoFocus
                              />
                            ) : (
                              <span 
                                onDoubleClick={() => chapter.id && handleEdit('chapter', chapter.id, chapter.title)}
                                className="text-xs text-gray-700 cursor-pointer flex-1"
                              >
                                {chapter.title}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => chapter.id && handleCreate('scene', chapter.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Add Scene"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => chapter.id && handleDelete('chapter', chapter.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Delete Chapter"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Scenes */}
                        <div className="ml-6 space-y-1">
                          {structure.scenes
                            .filter(scene => scene.node_id === chapter.id)
                            .map((scene) => (
                              <div key={scene.id} className="group">
                                <div 
                                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                    currentSceneId === scene.id 
                                      ? 'bg-blue-100 text-blue-900' 
                                      : 'hover:bg-gray-100 text-gray-600'
                                  }`}
                                  onClick={() => scene.id && onSceneSelect(scene.id)}
                                >
                                  <div className="flex items-center space-x-2 flex-1">
                                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                    </svg>
                                    {editingItem?.type === 'scene' && editingItem.itemId === scene.id ? (
                                      <input
                                        type="text"
                                        defaultValue={editingItem.currentTitle}
                                        onBlur={(e) => handleInlineEditSubmit(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleInlineEditSubmit(e.currentTarget.value);
                                          if (e.key === 'Escape') handleInlineEditCancel();
                                        }}
                                        className="flex-1 text-xs border-none bg-transparent focus:outline-none focus:bg-white px-1"
                                        autoFocus
                                      />
                                    ) : (
                                      <span 
                                        onDoubleClick={(e) => {
                                          e.stopPropagation();
                                          scene.id && handleEdit('scene', scene.id, scene.title);
                                        }}
                                        className="text-xs cursor-pointer flex-1"
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
                                      className="p-1 hover:bg-red-100 rounded text-red-600"
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
