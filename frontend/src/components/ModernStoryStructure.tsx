import { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  BookOpen, 
  FileText, 
  Circle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface StoryNode {
  id: string;
  title: string;
  kind: 'epic' | 'episode';
  parent_id?: string;
  order_idx: number;
  repo_id: string;
  created_at: any;
  updated_at: any;
}

interface Scene {
  id: string;
  title: string;
  node_id: string;
  order_idx: number;
  created_at: any;
  updated_at: any;
}

interface ModernStoryStructureProps {
  onSceneSelect: (sceneId: string) => void;
  onClearSelection: () => void;
  selectedSceneId?: string;
}

export default function ModernStoryStructure({ onSceneSelect, onClearSelection, selectedSceneId }: ModernStoryStructureProps) {
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'node' | 'scene'; title: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: StoryNode | Scene } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load story nodes
      const nodesQuery = query(collection(db, 'storyNodes'), orderBy('order_idx'));
      const nodesSnapshot = await getDocs(nodesQuery);
      const nodesData = nodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoryNode));
      setNodes(nodesData);

      // Load scenes
      const scenesQuery = query(collection(db, 'scenes'), orderBy('order_idx'));
      const scenesSnapshot = await getDocs(scenesQuery);
      const scenesData = scenesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scene));
      setScenes(scenesData);

      // Auto-expand all nodes
      setExpandedNodes(new Set(nodesData.map(node => node.id)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEpic = async () => {
    try {
      const newEpic = {
        title: 'New Epic',
        kind: 'epic' as const,
        order_idx: nodes.filter(n => n.kind === 'epic').length,
        repo_id: 'default-repo',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'storyNodes'), newEpic);
      setNodes(prev => [...prev, { id: docRef.id, ...newEpic }]);
      setExpandedNodes(prev => new Set([...prev, docRef.id]));
    } catch (error) {
      console.error('Error creating epic:', error);
    }
  };

  const handleCreateEpisode = async (epicId: string) => {
    try {
      const newEpisode = {
        title: 'New Episode',
        kind: 'episode' as const,
        parent_id: epicId,
        order_idx: nodes.filter(n => n.parent_id === epicId).length,
        repo_id: 'default-repo',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'storyNodes'), newEpisode);
      setNodes(prev => [...prev, { id: docRef.id, ...newEpisode }]);
      setExpandedNodes(prev => new Set([...prev, docRef.id]));
    } catch (error) {
      console.error('Error creating episode:', error);
    }
  };

  const handleCreateScene = async (episodeId: string) => {
    try {
      const newScene = {
        title: 'New Scene',
        node_id: episodeId,
        order_idx: scenes.filter(s => s.node_id === episodeId).length,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'scenes'), newScene);
      setScenes(prev => [...prev, { id: docRef.id, ...newScene }]);
    } catch (error) {
      console.error('Error creating scene:', error);
    }
  };

  const handleUpdateItem = async (id: string, type: 'node' | 'scene', newTitle: string) => {
    try {
      if (type === 'node') {
        await updateDoc(doc(db, 'storyNodes', id), { 
          title: newTitle, 
          updated_at: new Date() 
        });
        setNodes(prev => prev.map(node => 
          node.id === id ? { ...node, title: newTitle, updated_at: new Date() } : node
        ));
      } else {
        await updateDoc(doc(db, 'scenes', id), { 
          title: newTitle, 
          updated_at: new Date() 
        });
        setScenes(prev => prev.map(scene => 
          scene.id === id ? { ...scene, title: newTitle, updated_at: new Date() } : scene
        ));
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string, type: 'node' | 'scene') => {
    try {
      if (type === 'node') {
        await deleteDoc(doc(db, 'storyNodes', id));
        setNodes(prev => prev.filter(node => node.id !== id));
        // Also delete associated scenes
        const associatedScenes = scenes.filter(scene => scene.node_id === id);
        for (const scene of associatedScenes) {
          await deleteDoc(doc(db, 'scenes', scene.id));
        }
        setScenes(prev => prev.filter(scene => scene.node_id !== id));
      } else {
        await deleteDoc(doc(db, 'scenes', id));
        setScenes(prev => prev.filter(scene => scene.id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, item: StoryNode | Scene) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const getEpisodesForEpic = (epicId: string) => {
    return nodes.filter(node => node.parent_id === epicId && node.kind === 'episode');
  };

  const getScenesForEpisode = (episodeId: string) => {
    return scenes.filter(scene => scene.node_id === episodeId);
  };

  const getSceneStatus = (_sceneId: string) => {
    // TODO: Implement actual status checking
    return 'saved'; // 'saved' | 'unsaved' | 'error'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'saved': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'unsaved': return <Circle className="w-3 h-3 text-orange-500" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Story Structure</h2>
          <button
            onClick={handleCreateEpic}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="New Epic"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {nodes.filter(node => node.kind === 'epic').length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No epics yet</p>
            <button
              onClick={handleCreateEpic}
              className="btn-primary text-sm"
            >
              Create your first Epic
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {nodes
              .filter(node => node.kind === 'epic')
              .sort((a, b) => a.order_idx - b.order_idx)
              .map(epic => (
                <div key={epic.id} className="space-y-1">
                  {/* Epic */}
                  <div className="group">
                    <div 
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                      onClick={onClearSelection}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(epic.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        {expandedNodes.has(epic.id) ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                        {epic.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateEpisode(epic.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-opacity"
                        title="New Episode"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onContextMenu={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, epic);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-opacity"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Episodes */}
                    {expandedNodes.has(epic.id) && (
                      <div className="ml-6 space-y-1">
                        {getEpisodesForEpic(epic.id)
                          .sort((a, b) => a.order_idx - b.order_idx)
                          .map(episode => (
                            <div key={episode.id} className="space-y-1">
                              {/* Episode */}
                              <div className="group">
                                <div 
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                                  onClick={onClearSelection}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpanded(episode.id);
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                  >
                                    {expandedNodes.has(episode.id) ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </button>
                                  <FileText className="w-4 h-4 text-green-500" />
                                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                    {episode.title}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCreateScene(episode.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-opacity"
                                    title="New Scene"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onContextMenu={(e) => {
                                      e.stopPropagation();
                                      handleContextMenu(e, episode);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-opacity"
                                  >
                                    <MoreHorizontal className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Scenes */}
                                {expandedNodes.has(episode.id) && (
                                  <div className="ml-6 space-y-1">
                                    {getScenesForEpisode(episode.id)
                                      .sort((a, b) => a.order_idx - b.order_idx)
                                      .map(scene => (
                                        <div
                                          key={scene.id}
                                          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                            selectedSceneId === scene.id
                                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                          }`}
                                          onClick={() => onSceneSelect(scene.id)}
                                          onContextMenu={(e) => handleContextMenu(e, scene)}
                                        >
                                          {getStatusIcon(getSceneStatus(scene.id))}
                                          <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                                            {scene.title}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            onClick={() => {
              setEditingItem({
                id: contextMenu.item.id,
                type: 'title' in contextMenu.item ? 'node' : 'scene',
                title: contextMenu.item.title
              });
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <Edit3 className="w-3 h-3" />
            <span>Rename</span>
          </button>
          <button
            onClick={() => {
              handleDeleteItem(contextMenu.item.id, 'title' in contextMenu.item ? 'node' : 'scene');
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center space-x-2"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Rename {editingItem.type}</h3>
            <input
              type="text"
              value={editingItem.title}
              onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateItem(editingItem.id, editingItem.type, editingItem.title);
                  setEditingItem(null);
                } else if (e.key === 'Escape') {
                  setEditingItem(null);
                }
              }}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateItem(editingItem.id, editingItem.type, editingItem.title);
                  setEditingItem(null);
                }}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
