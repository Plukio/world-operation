import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface StoryNode {
  id: string;
  repo_id: string;
  kind: string;
  title: string;
  parent_id?: string;
  order_idx: number;
  createdAt?: any;
  updatedAt?: any;
}

interface Scene {
  id: string;
  node_id: string;
  title: string;
  order_idx: number;
  createdAt?: any;
  updatedAt?: any;
}

interface StoryStructureProps {
  onSceneSelect?: (sceneId: string) => void;
}

export default function WorkingStoryStructure({ onSceneSelect }: StoryStructureProps) {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{ type: 'node' | 'scene'; id: string } | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Load all data from Firebase
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading story data from Firebase...');
      
      // Load story nodes
      const nodesQuery = query(
        collection(db, 'storyNodes'),
        orderBy('order_idx')
      );
      const nodesSnapshot = await getDocs(nodesQuery);
      const nodesData = nodesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoryNode[];
      
      console.log('Loaded nodes:', nodesData);
      setNodes(nodesData);

      // Load scenes
      const scenesQuery = query(
        collection(db, 'scenes'),
        orderBy('order_idx')
      );
      const scenesSnapshot = await getDocs(scenesQuery);
      const scenesData = scenesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Scene[];
      
      console.log('Loaded scenes:', scenesData);
      setScenes(scenesData);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new epic
  const handleCreateEpic = async () => {
    const title = prompt('Enter epic name:');
    if (!title?.trim()) return;

    setLoading(true);
    try {
      console.log('Creating epic:', title);
      const docRef = await addDoc(collection(db, 'storyNodes'), {
        repo_id: 'default-repo',
        kind: 'epic',
        title: title.trim(),
        order_idx: nodes.filter(n => n.kind === 'epic').length,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Epic created with ID:', docRef.id);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error creating epic:', error);
      alert('Failed to create epic: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Create a new episode
  const handleCreateEpisode = async (parentId: string) => {
    const title = prompt('Enter episode name:');
    if (!title?.trim()) return;

    setLoading(true);
    try {
      console.log('Creating episode:', title);
      const docRef = await addDoc(collection(db, 'storyNodes'), {
        repo_id: 'default-repo',
        kind: 'episode',
        title: title.trim(),
        parent_id: parentId,
        order_idx: nodes.filter(n => n.parent_id === parentId).length,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Episode created with ID:', docRef.id);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error creating episode:', error);
      alert('Failed to create episode: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Create a new scene
  const handleCreateScene = async (nodeId: string) => {
    const title = prompt('Enter scene name:');
    if (!title?.trim()) return;

    setLoading(true);
    try {
      console.log('Creating scene:', title);
      const docRef = await addDoc(collection(db, 'scenes'), {
        node_id: nodeId,
        title: title.trim(),
        order_idx: scenes.filter(s => s.node_id === nodeId).length,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Scene created with ID:', docRef.id);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error creating scene:', error);
      alert('Failed to create scene: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
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

    setLoading(true);
    try {
      if (editingItem.type === 'node') {
        await updateDoc(doc(db, 'storyNodes', editingItem.id), {
          title: editingTitle.trim(),
          updatedAt: new Date()
        });
      } else {
        await updateDoc(doc(db, 'scenes', editingItem.id), {
          title: editingTitle.trim(),
          updatedAt: new Date()
        });
      }
      setEditingItem(null);
      setEditingTitle('');
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
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

    setLoading(true);
    try {
      if (type === 'node') {
        await deleteDoc(doc(db, 'storyNodes', id));
      } else {
        await deleteDoc(doc(db, 'scenes', id));
      }
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

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

  // Get scenes for a node
  const getScenesForNode = (nodeId: string) => {
    return scenes.filter(scene => scene.node_id === nodeId);
  };

  // Get episodes for an epic
  const getEpisodesForEpic = (epicId: string) => {
    return nodes.filter(node => node.kind === 'episode' && node.parent_id === epicId);
  };

  // Render a story node (epic or episode)
  const renderNode = (node: StoryNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const episodes = node.kind === 'epic' ? getEpisodesForEpic(node.id) : [];
    const nodeScenes = getScenesForNode(node.id);

    return (
      <div key={node.id} className="mb-2">
        <div className="flex items-center space-x-2 group">
          {/* Expand/Collapse Button */}
          {(episodes.length > 0 || nodeScenes.length > 0) && (
            <button
              onClick={() => toggleNode(node.id)}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          
          {/* Node Icon */}
          <div className={`w-3 h-3 rounded-full ${node.kind === 'epic' ? 'bg-blue-600' : 'bg-purple-600'}`}></div>
          
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
            {node.kind === 'epic' && (
              <button
                onClick={() => handleCreateEpisode(node.id)}
                className="text-xs text-purple-600 hover:text-purple-700"
                title="Add Episode"
              >
                +E
              </button>
            )}
            <button
              onClick={() => handleCreateScene(node.id)}
              className="text-xs text-orange-600 hover:text-orange-700"
              title="Add Scene"
            >
              +S
            </button>
            <button
              onClick={() => startEdit('node', node.id, node.title)}
              className="text-xs text-gray-600 hover:text-gray-700"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDelete('node', node.id, node.title)}
              className="text-xs text-red-600 hover:text-red-700"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="ml-6 mt-2 space-y-1">
            {/* Episodes (for epics) */}
            {episodes.map(episode => renderNode(episode))}
            
            {/* Scenes */}
            {nodeScenes.map(scene => (
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
                    onDoubleClick={() => startEdit('scene', scene.id, scene.title)}
                    onClick={() => onSceneSelect && onSceneSelect(scene.id)}
                  >
                    {scene.title}
                  </span>
                )}
                
                <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                  <button
                    onClick={() => startEdit('scene', scene.id, scene.title)}
                    className="text-xs text-gray-600 hover:text-gray-700"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete('scene', scene.id, scene.title)}
                    className="text-xs text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Story Structure</h2>
        <div className="flex space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={handleCreateEpic}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
          >
            {loading ? 'Creating...' : '+ Epic'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && nodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading story structure...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No story structure yet</p>
            <p className="text-xs mt-1">Create your first epic to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {nodes
              .filter(node => node.kind === 'epic')
              .sort((a, b) => a.order_idx - b.order_idx)
              .map(epic => renderNode(epic))}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="p-2 text-xs text-gray-400 border-t border-gray-200">
        <div>User: {user?.email || 'Not logged in'}</div>
        <div>Nodes: {nodes.length}</div>
        <div>Scenes: {scenes.length}</div>
        <div>Epics: {nodes.filter(n => n.kind === 'epic').length}</div>
        <div>Episodes: {nodes.filter(n => n.kind === 'episode').length}</div>
      </div>
    </div>
  );
}
