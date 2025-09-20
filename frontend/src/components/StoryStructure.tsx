import { useState, useEffect } from 'react';
import { useFirebaseStore } from '../store/useFirebaseStore';
import { useAuth } from '../contexts/AuthContext';

interface StoryStructureProps {
  onSceneSelect?: (sceneId: string) => void;
}

export default function StoryStructure({ onSceneSelect }: StoryStructureProps) {
  const { user } = useAuth();
  const {
    structure,
    loading,
    repoId,
    initializeUserRepo,
    createNode,
    createScene,
    updateNode,
    updateScene,
    deleteNode,
    deleteScene,
    refreshStructure
  } = useFirebaseStore();

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{ type: 'node' | 'scene'; id: string } | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Initialize user repo when user is available
  useEffect(() => {
    if (user && !repoId) {
      console.log('Initializing user repo for:', user.uid);
      initializeUserRepo(user.uid);
    }
  }, [user, repoId, initializeUserRepo]);

  // Load structure when repoId is available
  useEffect(() => {
    if (repoId) {
      console.log('Loading structure for repo:', repoId);
      refreshStructure();
    }
  }, [repoId, refreshStructure]);

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Create new epic
  const handleCreateEpic = async () => {
    const title = prompt('Enter epic name:');
    if (!title?.trim()) return;

    try {
      console.log('Creating epic:', title);
      await createNode('epic', title.trim());
      console.log('Epic created successfully');
    } catch (error) {
      console.error('Error creating epic:', error);
      alert('Failed to create epic: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Create new chapter
  const handleCreateChapter = async (parentId: string) => {
    const title = prompt('Enter chapter name:');
    if (!title?.trim()) return;

    try {
      console.log('Creating chapter:', title);
      await createNode('chapter', title.trim(), parentId);
      console.log('Chapter created successfully');
    } catch (error) {
      console.error('Error creating chapter:', error);
      alert('Failed to create chapter: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Create new scene
  const handleCreateScene = async (nodeId: string) => {
    const title = prompt('Enter scene name:');
    if (!title?.trim()) return;

    try {
      console.log('Creating scene:', title);
      await createScene(nodeId, title.trim());
      console.log('Scene created successfully');
    } catch (error) {
      console.error('Error creating scene:', error);
      alert('Failed to create scene: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Start editing
  const startEdit = (type: 'node' | 'scene', id: string, currentTitle: string) => {
    setEditingItem({ type, id });
    setEditingTitle(currentTitle);
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingItem || !editingTitle.trim()) return;

    try {
      if (editingItem.type === 'node') {
        await updateNode(editingItem.id, editingTitle.trim());
      } else {
        await updateScene(editingItem.id, editingTitle.trim());
      }
      setEditingItem(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingItem(null);
    setEditingTitle('');
  };

  // Delete item
  const handleDelete = async (type: 'node' | 'scene', id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      if (type === 'node') {
        await deleteNode(id);
      } else {
        await deleteScene(id);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Get scenes for a node
  const getScenesForNode = (nodeId: string) => {
    return structure.scenes.filter(scene => scene.node_id === nodeId);
  };

  // Get chapters for an epic
  const getChaptersForEpic = (epicId: string) => {
    return structure.nodes.filter(node => node.kind === 'chapter' && node.parent_id === epicId);
  };

  // Render a story node (epic or chapter)
  const renderNode = (node: any) => {
    const isExpanded = expandedNodes.has(node.id);
    const chapters = node.kind === 'epic' ? getChaptersForEpic(node.id) : [];
    const scenes = getScenesForNode(node.id);

    return (
      <div key={node.id} className="mb-2">
        <div className="flex items-center space-x-2 group">
          {/* Expand/Collapse Button */}
          {(chapters.length > 0 || scenes.length > 0) && (
            <button
              onClick={() => toggleNode(node.id)}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          
          {/* Node Icon */}
          <div className={`w-3 h-3 rounded-full ${node.kind === 'epic' ? 'bg-blue-600' : 'bg-green-600'}`}></div>
          
          {/* Node Title */}
          {editingItem?.type === 'node' && editingItem.id === node.id ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              onBlur={saveEdit}
              className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded"
              autoFocus
            />
          ) : (
            <span 
              className="flex-1 text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onDoubleClick={() => startEdit('node', node.id, node.title)}
              onClick={() => onSceneSelect && onSceneSelect(node.id)}
            >
              {node.title}
            </span>
          )}
          
          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
            {node.kind === 'epic' && node.id && (
              <button
                onClick={() => handleCreateChapter(node.id)}
                className="text-xs text-green-600 hover:text-green-700"
                title="Add Chapter"
              >
                +C
              </button>
            )}
            {node.id && (
              <button
                onClick={() => handleCreateScene(node.id)}
                className="text-xs text-blue-600 hover:text-blue-700"
                title="Add Scene"
              >
                +S
              </button>
            )}
            {node.id && (
              <button
                onClick={() => startEdit('node', node.id, node.title)}
                className="text-xs text-gray-600 hover:text-gray-700"
                title="Edit"
              >
                ✏️
              </button>
            )}
            {node.id && (
              <button
                onClick={() => handleDelete('node', node.id, node.title)}
                className="text-xs text-red-600 hover:text-red-700"
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="ml-6 mt-2 space-y-1">
            {/* Chapters (for epics) */}
            {chapters.map(chapter => renderNode(chapter))}
            
            {/* Scenes */}
            {scenes.map(scene => (
              <div key={scene.id} className="flex items-center space-x-2 group">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                
                {editingItem?.type === 'scene' && editingItem.id === scene.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    onBlur={saveEdit}
                    className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="flex-1 text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                    onDoubleClick={() => scene.id && startEdit('scene', scene.id, scene.title)}
                    onClick={() => scene.id && onSceneSelect && onSceneSelect(scene.id)}
                  >
                    {scene.title}
                  </span>
                )}
                
                <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                  {scene.id && (
                    <button
                      onClick={() => scene.id && startEdit('scene', scene.id, scene.title)}
                      className="text-xs text-gray-600 hover:text-gray-700"
                      title="Edit"
                    >
                      ✏️
                    </button>
                  )}
                  {scene.id && (
                    <button
                      onClick={() => scene.id && handleDelete('scene', scene.id, scene.title)}
                      className="text-xs text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Story Structure</h2>
        <button
          onClick={handleCreateEpic}
          disabled={loading.structure}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
        >
          {loading.structure ? 'Creating...' : '+ Epic'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading.structure ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading story structure...</p>
          </div>
        ) : structure.nodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No story structure yet</p>
            <p className="text-xs mt-1">Create your first epic to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {structure.nodes
              .filter(node => node.kind === 'epic')
              .sort((a, b) => a.order_idx - b.order_idx)
              .map(epic => renderNode(epic))}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="p-2 text-xs text-gray-400 border-t border-gray-200">
        <div>Repo: {repoId || 'Not set'}</div>
        <div>Nodes: {structure.nodes.length}</div>
        <div>Scenes: {structure.scenes.length}</div>
      </div>
    </div>
  );
}
