import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Eye,
  EyeOff,
  Type,
  Save,
  Sparkles,
  Edit3,
  Trash2,
  PanelLeft,
  PanelRight
} from 'lucide-react';
import ModernStoryStructure from './ModernStoryStructure';
import ModernEditor from './ModernEditor';
import FloatingSidebar from './FloatingSidebar';
import { sceneContentService } from '../lib/sceneContentService';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { openaiService } from '../lib/openaiService';
import { firebaseService, type SceneEntity, type SceneExtraction } from '../lib/firebaseService';

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

interface ModernWritePageProps {
  className?: string;
}

export default function ModernWritePage({ className = '' }: ModernWritePageProps) {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [sceneContent, setSceneContent] = useState<string>('');
  const [sceneMetadata, setSceneMetadata] = useState<{ pov?: string; tense?: string; style?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isTypewriterMode, setIsTypewriterMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showLeftPane, setShowLeftPane] = useState(true);
  const [showRightPane, setShowRightPane] = useState(false);
  const [isExtractingEntities, setIsExtractingEntities] = useState(false);
  const [sceneEntities, setSceneEntities] = useState<SceneEntity[]>([]);
  const [sceneExtraction, setSceneExtraction] = useState<SceneExtraction | null>(null);
  const [editingEntity, setEditingEntity] = useState<SceneEntity | null>(null);
  const [newEntity, setNewEntity] = useState<Partial<SceneEntity>>({});
  
  // Story structure data for breadcrumbs
  const [nodes, setNodes] = useState<StoryNode[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  
  // POV/Tense/Style state - these will be synced with sceneMetadata
  const pov = sceneMetadata.pov || 'Third Person';
  const tense = sceneMetadata.tense || 'Past';
  const style = sceneMetadata.style || 'Narrative';

  useEffect(() => {
    // Load preferences from localStorage
    const savedTypewriter = localStorage.getItem('typewriterMode') === 'true';
    const savedFocus = localStorage.getItem('focusMode') === 'true';
    const savedRightPane = localStorage.getItem('showRightPane') !== 'false';
    
    setIsTypewriterMode(savedTypewriter);
    setIsFocusMode(savedFocus);
    setShowRightPane(savedRightPane);
    
    // Load story structure data
    loadStoryStructure();
  }, []);

  const loadStoryStructure = async () => {
    try {
      // Load nodes (epics and episodes)
      const nodesQuery = query(collection(db, 'storyNodes'), orderBy('order_idx'));
      const nodesSnapshot = await getDocs(nodesQuery);
      const nodesData = nodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoryNode));
      setNodes(nodesData);

      // Load scenes
      const scenesQuery = query(collection(db, 'scenes'), orderBy('order_idx'));
      const scenesSnapshot = await getDocs(scenesQuery);
      const scenesData = scenesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scene));
      setScenes(scenesData);
    } catch (error) {
      console.error('Error loading story structure:', error);
    }
  };

  // Save when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && selectedSceneId) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        // Try to save before leaving
        handleSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, selectedSceneId]);

  // Debug: Log when selectedSceneId changes
  useEffect(() => {
    console.log('🔍 selectedSceneId changed to:', selectedSceneId);
  }, [selectedSceneId]);

  // Close right pane when no scene is selected
  useEffect(() => {
    if (!selectedSceneId) {
      setShowRightPane(false);
    }
  }, [selectedSceneId]);

  // Debug entities state
  useEffect(() => {
    console.log('🎭 Entities state changed - sceneEntities:', sceneEntities, 'sceneExtraction:', sceneExtraction);
  }, [sceneEntities, sceneExtraction]);

  const handleSceneSelect = async (sceneId: string) => {
    // Save current scene before switching
    if (selectedSceneId && hasUnsavedChanges) {
      await handleSave();
    }
    
    console.log('🎬 Scene selected:', sceneId);
    setSelectedSceneId(sceneId);
    setIsLoadingContent(true);
    setHasUnsavedChanges(false);
    
    try {
      const { content, metadata } = await sceneContentService.loadSceneContent(sceneId);
      setSceneContent(content);
      setSceneMetadata(metadata || {});
      console.log('Scene content loaded:', content.substring(0, 100) + '...');
      console.log('Scene metadata loaded:', metadata);
      
      // Load scene entities and extraction
      await loadSceneEntities(sceneId);
    } catch (error) {
      console.error('Error loading scene content:', error);
      setSceneContent('');
      setSceneMetadata({});
    } finally {
      setIsLoadingContent(false);
    }
  };

  const loadSceneEntities = async (sceneId: string) => {
    try {
      console.log('🔄 Loading scene entities for scene:', sceneId);
      const entities = await firebaseService.getSceneEntities(sceneId);
      const extraction = await firebaseService.getSceneExtraction(sceneId);
      console.log('📊 Loaded entities:', entities);
      console.log('📊 Loaded extraction:', extraction);
      console.log('📊 Entities count:', entities.length);
      console.log('📊 Extraction exists:', !!extraction);
      setSceneEntities(entities);
      setSceneExtraction(extraction);
    } catch (error) {
      console.error('❌ Error loading scene entities:', error);
      setSceneEntities([]);
      setSceneExtraction(null);
    }
  };

  const handleClearSelection = () => {
    // Save current scene before clearing
    if (selectedSceneId && hasUnsavedChanges) {
      handleSave();
    }
    
    console.log('🧹 Clearing scene selection');
    setSelectedSceneId(null);
    setSceneContent('');
    setHasUnsavedChanges(false);
  };

  const handleEditorChange = (html: string) => {
    setSceneContent(html);
    setHasUnsavedChanges(true);
    // No auto-save - user will save manually or when leaving editor
  };

  const handleMetadataChange = (key: 'pov' | 'tense' | 'style', value: string) => {
    setSceneMetadata(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleExtractEntities = async () => {
    if (!selectedSceneId || !sceneContent.trim()) {
      alert('Please select a scene with content to extract entities from.');
      return;
    }

    setIsExtractingEntities(true);
    try {
      console.log('🤖 Extracting entities from scene:', selectedSceneId);
      
      // Use OpenAI API to extract entities
      const result = await openaiService.extractEntitiesWithFallback(sceneContent);
      
      console.log('✅ Entities extracted:', result);
      
      // Save entities to database
      const sceneEntities: SceneEntity[] = result.entities.map(entity => ({
        scene_id: selectedSceneId,
        entity_name: entity.name,
        entity_type: entity.type,
        description: entity.description,
        confidence: entity.confidence || 0.8,
        actions: entity.actions || [],
        extracted_at: new Date()
      }));

      // Save each entity
      for (const entity of sceneEntities) {
        await firebaseService.createSceneEntity(entity);
      }

      // Save extraction summary
      await firebaseService.createSceneExtraction({
        scene_id: selectedSceneId,
        summary: result.summary,
        entities: sceneEntities,
        extracted_at: new Date()
      });

      // Reload entities to show updated data
      await loadSceneEntities(selectedSceneId);
      
      // Show success message
      alert(`Successfully extracted and saved ${result.entities.length} entities from the scene!`);
      
    } catch (error) {
      console.error('❌ Error extracting entities:', error);
      alert(`Failed to extract entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExtractingEntities(false);
    }
  };

  const handleEditEntity = (entity: SceneEntity) => {
    setEditingEntity(entity);
  };

  const handleDeleteEntity = async (entityId: string) => {
    if (confirm('Are you sure you want to delete this entity?')) {
      try {
        await firebaseService.deleteSceneEntity(entityId);
        if (selectedSceneId) {
          await loadSceneEntities(selectedSceneId);
        }
      } catch (error) {
        console.error('Error deleting entity:', error);
        alert('Failed to delete entity');
      }
    }
  };

  const handleSaveEntity = async () => {
    if (!editingEntity || !selectedSceneId) return;
    
    try {
      await firebaseService.updateSceneEntity(editingEntity.id!, {
        entity_name: editingEntity.entity_name,
        entity_type: editingEntity.entity_type,
        description: editingEntity.description,
        actions: editingEntity.actions
      });
      setEditingEntity(null);
      await loadSceneEntities(selectedSceneId);
    } catch (error) {
      console.error('Error saving entity:', error);
      alert('Failed to save entity');
    }
  };

  const handleAddEntity = async () => {
    if (!selectedSceneId || !newEntity.entity_name) return;
    
    try {
      await firebaseService.createSceneEntity({
        scene_id: selectedSceneId,
        entity_name: newEntity.entity_name,
        entity_type: newEntity.entity_type || 'other',
        description: newEntity.description || '',
        confidence: 0.8, // Default confidence for manually added entities
        actions: newEntity.actions || [],
        extracted_at: new Date()
      });
      setNewEntity({});
      await loadSceneEntities(selectedSceneId);
    } catch (error) {
      console.error('Error adding entity:', error);
      alert('Failed to add entity');
    }
  };

  const handleSave = async () => {
    if (!selectedSceneId) return;
    
    setIsSaving(true);
    try {
      await sceneContentService.saveSceneContent(selectedSceneId, sceneContent, sceneMetadata);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTypewriterMode = () => {
    const newMode = !isTypewriterMode;
    setIsTypewriterMode(newMode);
    localStorage.setItem('typewriterMode', newMode.toString());
  };

  const toggleFocusMode = () => {
    const newMode = !isFocusMode;
    setIsFocusMode(newMode);
    setShowRightPane(!newMode);
    localStorage.setItem('focusMode', newMode.toString());
    localStorage.setItem('showRightPane', (!newMode).toString());
  };


  const getBreadcrumbs = () => {
    if (!selectedSceneId) return ['No Scene Selected'];
    
    const scene = scenes.find(s => s.id === selectedSceneId);
    if (!scene) return ['Scene Not Found'];
    
    const episode = nodes.find(n => n.id === scene.node_id);
    if (!episode) return [scene.title];
    
    const epic = nodes.find(n => n.id === episode.parent_id);
    if (!epic) return [episode.title, scene.title];
    
    return [epic.title, episode.title, scene.title];
  };

  return (
    <div className={`h-full ${className}`}>
      {/* Floating Left Sidebar - Story Structure */}
      <FloatingSidebar
        side="left"
        isOpen={!isFocusMode && showLeftPane}
        onToggle={() => setShowLeftPane(!showLeftPane)}
        title="Story Structure"
        width={320}
        minWidth={250}
        maxWidth={500}
      >
        <ModernStoryStructure
          onSceneSelect={handleSceneSelect}
          onClearSelection={handleClearSelection}
          selectedSceneId={selectedSceneId || undefined}
          onStructureChange={loadStoryStructure}
        />
      </FloatingSidebar>

      {/* Floating Right Sidebar - Entities */}
      <FloatingSidebar
        side="right"
        isOpen={!isFocusMode && showRightPane && !!selectedSceneId}
        onToggle={() => setShowRightPane(!showRightPane)}
        title="Entities"
        width={300}
        minWidth={250}
        maxWidth={400}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">Entities</h3>
              <button
                onClick={handleExtractEntities}
                disabled={isExtractingEntities || !selectedSceneId || !sceneContent.trim()}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isExtractingEntities || !selectedSceneId || !sceneContent.trim()
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
                title="Extract entities from current scene using AI"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isExtractingEntities ? 'Extracting...' : 'Extract'}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Debug Info */}
            <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              <div>Debug: sceneEntities.length = {sceneEntities.length}</div>
              <div>Debug: sceneExtraction = {sceneExtraction ? 'exists' : 'null'}</div>
              <div>Debug: selectedSceneId = {selectedSceneId || 'none'}</div>
            </div>
            
            {sceneEntities.length > 0 || sceneExtraction ? (
              <div className="space-y-4">
                {/* Summary */}
                {sceneExtraction?.summary && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Scene Summary</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{sceneExtraction.summary}</p>
                  </div>
                )}

                {/* Add New Entity */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add Entity</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Entity name"
                      value={newEntity.entity_name || ''}
                      onChange={(e) => setNewEntity(prev => ({ ...prev, entity_name: e.target.value }))}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <select
                      value={newEntity.entity_type || 'other'}
                      onChange={(e) => setNewEntity(prev => ({ ...prev, entity_type: e.target.value as any }))}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="character">Character</option>
                      <option value="place">Place</option>
                      <option value="event">Event</option>
                      <option value="object">Object</option>
                      <option value="relationship">Relationship</option>
                      <option value="other">Other</option>
                    </select>
                    <textarea
                      placeholder="Description"
                      value={newEntity.description || ''}
                      onChange={(e) => setNewEntity(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      rows={2}
                    />
                    <button
                      onClick={handleAddEntity}
                      disabled={!newEntity.entity_name}
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Add Entity
                    </button>
                  </div>
                </div>

                {/* Debug: Show all entities if no grouped entities */}
                {sceneEntities.length > 0 && sceneEntities.every(entity => !['character', 'place', 'event', 'object', 'relationship'].includes(entity.entity_type)) && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">All Entities</h4>
                    <div className="space-y-2">
                      {sceneEntities.map((entity) => (
                        <div key={entity.id} className="flex items-start space-x-2 p-2 bg-white dark:bg-gray-800 rounded border">
                          <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">?</div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {entity.entity_name} ({entity.entity_type})
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {entity.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group entities by type */}
                {['character', 'place', 'event', 'object', 'relationship'].map(type => {
                  const entitiesOfType = sceneEntities.filter(entity => entity.entity_type === type);
                  if (entitiesOfType.length === 0) return null;

                  const getIcon = (entityType: string) => {
                    switch (entityType) {
                      case 'character': return <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">C</div>;
                      case 'place': return <MapPin className="w-4 h-4 text-red-500" />;
                      case 'event': return <Calendar className="w-4 h-4 text-orange-500" />;
                      case 'object': return <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">O</div>;
                      case 'relationship': return <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">R</div>;
                      default: return <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium">?</div>;
                    }
                  };

                  return (
                    <div key={type}>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                        {type}s ({entitiesOfType.length})
                      </h4>
                      <div className="space-y-2">
                        {entitiesOfType.map((entity) => (
                          <div key={entity.id} className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {getIcon(entity.entity_type)}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {entity.entity_name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {entity.description}
                              </div>
                              {entity.actions && entity.actions.length > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Actions: {entity.actions.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEditEntity(entity)}
                                className="p-1 text-gray-400 hover:text-blue-500"
                                title="Edit entity"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntity(entity.id!)}
                                className="p-1 text-gray-400 hover:text-red-500"
                                title="Delete entity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">No Entities Extracted</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select a scene with content and click 'Extract' to analyze it with AI.
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  AI will identify characters, places, events, objects, and relationships.
                </div>
              </div>
            )}
          </div>
        </div>
      </FloatingSidebar>

      {/* Main Editor Area */}
      <div className="h-full flex flex-col">
        {/* Header Row */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm flex-shrink-0">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="text-gray-400 mx-2">›</span>}
                <span className={`${index === getBreadcrumbs().length - 1 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>

          {/* Center: Toolbar Controls */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-3">
              {/* POV/Tense/Style Chips */}
              <div className="flex items-center space-x-2">
                <select
                  value={pov}
                  onChange={(e) => handleMetadataChange('pov', e.target.value)}
                  className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="First Person">1st</option>
                  <option value="Second Person">2nd</option>
                  <option value="Third Person">3rd</option>
                </select>
                <select
                  value={tense}
                  onChange={(e) => handleMetadataChange('tense', e.target.value)}
                  className="text-xs px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="Present">Present</option>
                  <option value="Past">Past</option>
                  <option value="Future">Future</option>
                </select>
                <select
                  value={style}
                  onChange={(e) => handleMetadataChange('style', e.target.value)}
                  className="text-xs px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="Narrative">Narrative</option>
                  <option value="Dialogue">Dialogue</option>
                  <option value="Action">Action</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">

            {/* Mode Toggles */}
            <button
              onClick={toggleTypewriterMode}
              className={`p-2 rounded-lg transition-colors ${
                isTypewriterMode
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Typewriter Mode"
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFocusMode}
              className={`p-2 rounded-lg transition-colors ${
                isFocusMode
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Focus Mode"
            >
              {isFocusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedSceneId || !hasUnsavedChanges}
              className={`flex items-center space-x-2 ${
                hasUnsavedChanges 
                  ? 'btn-primary' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed px-4 py-2 rounded-lg'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
              </span>
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          {selectedSceneId ? (
            isLoadingContent ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">Loading scene content...</div>
                </div>
              </div>
            ) : (
              <ModernEditor
                key={selectedSceneId}
                value={sceneContent}
                onChange={handleEditorChange}
                placeholder="Start writing your scene..."
                onSave={handleSave}
                isTypewriterMode={isTypewriterMode}
                onTypewriterToggle={toggleTypewriterMode}
                isFocusMode={isFocusMode}
                onFocusToggle={toggleFocusMode}
              />
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">✍️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Write
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a scene from the sidebar to start writing, or create a new one to begin your story.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <span>⌘S</span>
                    <span>Save</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>⌘/</span>
                    <span>Command Palette</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Edit Entity Modal */}
      {editingEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Edit Entity</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingEntity.entity_name}
                  onChange={(e) => setEditingEntity(prev => prev ? { ...prev, entity_name: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={editingEntity.entity_type}
                  onChange={(e) => setEditingEntity(prev => prev ? { ...prev, entity_type: e.target.value as any } : null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="character">Character</option>
                  <option value="place">Place</option>
                  <option value="event">Event</option>
                  <option value="object">Object</option>
                  <option value="relationship">Relationship</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editingEntity.description}
                  onChange={(e) => setEditingEntity(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Actions (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingEntity.actions?.join(', ') || ''}
                  onChange={(e) => setEditingEntity(prev => prev ? { ...prev, actions: e.target.value.split(',').map(a => a.trim()).filter(a => a) } : null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="walks, speaks, fights"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingEntity(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntity}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Buttons */}
      {!showLeftPane && (
        <button
          onClick={() => setShowLeftPane(true)}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          title="Show Story Structure"
        >
          <PanelLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
        </button>
      )}

      {!showRightPane && selectedSceneId && (
        <button
          onClick={() => setShowRightPane(true)}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          title="Show Entities Panel"
        >
          <PanelRight className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
        </button>
      )}
    </div>
  );
}
