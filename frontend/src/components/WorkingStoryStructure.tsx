import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
      <div key={node.id} className="mb-3">
        <div className="flex items-center space-x-3 group">
          {/* Expand/Collapse Button */}
          {(episodes.length > 0 || nodeScenes.length > 0) && (
            <button
              onClick={() => toggleNode(node.id)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          
          {/* Modern Node Icon */}
          <div className={`w-4 h-4 rounded-full shadow-sm ${node.kind === 'epic' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}></div>
          
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
              className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <span 
              className="flex-1 text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onDoubleClick={() => startEdit('node', node.id, node.title)}
              onClick={() => onSceneSelect && onSceneSelect(node.id)}
            >
              {node.title}
            </span>
          )}
          
          {/* Modern Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
            {node.kind === 'epic' && (
              <button
                onClick={() => handleCreateEpisode(node.id)}
                className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                title="Add Episode"
              >
                +E
              </button>
            )}
            {node.kind === 'episode' && (
              <button
                onClick={() => handleCreateScene(node.id)}
                className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors"
                title="Add Scene"
              >
                +S
              </button>
            )}
            <button
              onClick={() => startEdit('node', node.id, node.title)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDelete('node', node.id, node.title)}
              className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
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
    <div className="w-80 h-full bg-white/60 backdrop-blur-sm border-r border-white/20 flex flex-col shadow-xl">
      {/* Modern Header */}
      <div className="p-6 border-b border-white/20 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">📚 Story Universe</h2>
          <p className="text-xs text-gray-500 mt-1">Build your creative world</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? '⏳' : '🔄'}
          </button>
          <button
            onClick={handleCreateEpic}
            disabled={loading}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? '✨' : '🚀 Epic'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && nodes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your creative universe...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌟</span>
            </div>
            <p className="text-gray-700 font-medium mb-2">Your story universe is empty</p>
            <p className="text-sm text-gray-500">Create your first epic to begin your creative journey</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nodes
              .filter(node => node.kind === 'epic')
              .sort((a, b) => a.order_idx - b.order_idx)
              .map(epic => renderNode(epic))}
          </div>
        )}
      </div>

      {/* Modern Debug Info */}
      <div className="p-4 text-xs text-gray-500 border-t border-white/20 bg-white/30">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Epics: {nodes.filter(n => n.kind === 'epic').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Episodes: {nodes.filter(n => n.kind === 'episode').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Scenes: {scenes.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Total: {nodes.length + scenes.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
