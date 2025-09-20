import { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Crown,
  BookMarked,
  ScrollText
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
  onStructureChange?: () => void;
}

export default function ModernStoryStructure({ onSceneSelect, onClearSelection, selectedSceneId, onStructureChange }: ModernStoryStructureProps) {
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'node' | 'scene'; title: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: StoryNode | Scene } | null>(null);
  const [floatingActions, setFloatingActions] = useState<{ id: string; type: 'node' | 'scene'; x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Close floating actions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (floatingActions) {
        closeFloatingActions();
      }
    };

    if (floatingActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [floatingActions]);

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
      
      // Notify parent component to refresh breadcrumbs
      if (onStructureChange) {
        onStructureChange();
      }
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
      
      // Notify parent component to refresh breadcrumbs
      if (onStructureChange) {
        onStructureChange();
      }
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
      
      // Notify parent component to refresh breadcrumbs
      if (onStructureChange) {
        onStructureChange();
      }
    } catch (error) {
      console.error('Error creating scene:', error);
    }
  };

  const handleUpdateItem = async (id: string, type: 'node' | 'scene', newTitle: string) => {
    try {
      console.log('🔄 Updating item:', { id, type, newTitle });
      if (type === 'node') {
        console.log('📝 Updating node in Firebase...');
        await updateDoc(doc(db, 'storyNodes', id), { 
          title: newTitle, 
          updated_at: new Date() 
        });
        console.log('📝 Updating local state...');
        setNodes(prev => prev.map(node => 
          node.id === id ? { ...node, title: newTitle, updated_at: new Date() } : node
        ));
        console.log('✅ Node updated successfully');
      } else {
        console.log('📝 Updating scene in Firebase...');
        await updateDoc(doc(db, 'scenes', id), { 
          title: newTitle, 
          updated_at: new Date() 
        });
        console.log('📝 Updating local state...');
        setScenes(prev => prev.map(scene => 
          scene.id === id ? { ...scene, title: newTitle, updated_at: new Date() } : scene
        ));
        console.log('✅ Scene updated successfully');
      }
      
      // Notify parent component to refresh breadcrumbs
      if (onStructureChange) {
        onStructureChange();
      }
    } catch (error) {
      console.error('❌ Error updating item:', error);
      alert(`Failed to update ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteItem = async (id: string, type: 'node' | 'scene') => {
    try {
      console.log('🗑️ Deleting item:', { id, type });
      
      // Confirm deletion
      const itemName = type === 'node' 
        ? nodes.find(n => n.id === id)?.title || 'item'
        : scenes.find(s => s.id === id)?.title || 'item';
      
      if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
        return;
      }
      
      if (type === 'node') {
        console.log('🗑️ Deleting node from Firebase...');
        await deleteDoc(doc(db, 'storyNodes', id));
        console.log('🗑️ Updating local nodes state...');
        setNodes(prev => prev.filter(node => node.id !== id));
        
        // Also delete associated scenes
        const associatedScenes = scenes.filter(scene => scene.node_id === id);
        console.log('🗑️ Deleting associated scenes:', associatedScenes.length);
        for (const scene of associatedScenes) {
          await deleteDoc(doc(db, 'scenes', scene.id));
        }
        console.log('🗑️ Updating local scenes state...');
        setScenes(prev => prev.filter(scene => scene.node_id !== id));
        console.log('✅ Node and associated scenes deleted successfully');
      } else {
        console.log('🗑️ Deleting scene from Firebase...');
        await deleteDoc(doc(db, 'scenes', id));
        console.log('🗑️ Updating local scenes state...');
        setScenes(prev => prev.filter(scene => scene.id !== id));
        console.log('✅ Scene deleted successfully');
      }
      
      // Notify parent component to refresh breadcrumbs
      if (onStructureChange) {
        onStructureChange();
      }
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      alert(`Failed to delete ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleFloatingActions = (e: React.MouseEvent, item: StoryNode | Scene) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    console.log('🎯 Floating actions triggered for:', item.title, item.id);
    
    // Position the floating actions to the left of the button to avoid going off-screen
    const x = Math.max(10, rect.left - 200); // 200px width of floating actions
    const y = rect.top;
    
    setFloatingActions({ 
      id: item.id, 
      type: 'title' in item ? 'node' : 'scene', 
      x, 
      y 
    });
  };

  const closeFloatingActions = () => {
    setFloatingActions(null);
  };

  // Close floating actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (floatingActions) {
        const target = event.target as Element;
        if (!target.closest('.floating-actions') && !target.closest('[data-floating-trigger]')) {
          closeFloatingActions();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [floatingActions]);

  const getEpisodesForEpic = (epicId: string) => {
    return nodes.filter(node => node.parent_id === epicId && node.kind === 'episode');
  };

  const getScenesForEpisode = (episodeId: string) => {
    return scenes.filter(scene => scene.node_id === episodeId);
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
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 transition-colors duration-200">
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
            <Crown className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
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
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleContextMenu(e, epic);
                      }}
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
                      <Crown className="w-4 h-4 text-yellow-500" />
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
                        onClick={(e) => handleFloatingActions(e, epic)}
                        data-floating-trigger
                        className="opacity-60 hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-opacity"
                        title="More actions"
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
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    handleContextMenu(e, episode);
                                  }}
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
                                  <BookMarked className="w-4 h-4 text-blue-500" />
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
                                    onClick={(e) => handleFloatingActions(e, episode)}
                                    data-floating-trigger
                                    className="opacity-60 hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-opacity"
                                    title="More actions"
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
                                          className={`group flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                            selectedSceneId === scene.id
                                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                          }`}
                                          onClick={() => onSceneSelect(scene.id)}
                                          onContextMenu={(e) => {
                                            e.preventDefault();
                                            handleContextMenu(e, scene);
                                          }}
                                        >
                                          <ScrollText className="w-3 h-3 text-purple-500" />
                                          <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                                            {scene.title}
                                          </span>
                                          <button
                                            onClick={(e) => handleFloatingActions(e, scene)}
                                            data-floating-trigger
                                            className="opacity-60 hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-opacity"
                                            title="More actions"
                                          >
                                            <MoreHorizontal className="w-3 h-3" />
                                          </button>
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

      {/* Floating Actions */}
      {floatingActions && (
        <div
          className="floating-actions fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 flex"
          style={{ left: floatingActions.x, top: floatingActions.y }}
          onMouseLeave={closeFloatingActions}
        >
          <button
            onClick={() => {
              console.log('✏️ Rename button clicked for:', floatingActions);
              const item = floatingActions.type === 'node' 
                ? nodes.find(n => n.id === floatingActions.id)
                : scenes.find(s => s.id === floatingActions.id);
              if (item) {
                console.log('📝 Setting editing item:', item);
                setEditingItem({
                  id: item.id,
                  type: floatingActions.type,
                  title: item.title
                });
              }
              closeFloatingActions();
            }}
            className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-2 border-r border-gray-200 dark:border-gray-700"
          >
            <Edit3 className="w-3 h-3" />
            <span>Rename</span>
          </button>
          <button
            onClick={() => {
              console.log('🗑️ Delete button clicked for:', floatingActions);
              handleDeleteItem(floatingActions.id, floatingActions.type);
              closeFloatingActions();
            }}
            className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center space-x-2"
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
