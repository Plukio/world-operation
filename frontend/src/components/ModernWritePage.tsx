import { useState, useEffect } from 'react';
import { 
  Zap, 
  Users, 
  MapPin, 
  Calendar, 
  Eye,
  EyeOff,
  Type,
  Save
} from 'lucide-react';
import ModernStoryStructure from './ModernStoryStructure';
import ModernEditor from './ModernEditor';
import ResizablePane from './ResizablePane';
import { sceneContentService } from '../lib/sceneContentService';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
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
  const [showRightPane, setShowRightPane] = useState(true);
  const [activeTab, setActiveTab] = useState<'entities' | 'muse'>('entities');
  
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
    } catch (error) {
      console.error('Error loading scene content:', error);
      setSceneContent('');
      setSceneMetadata({});
    } finally {
      setIsLoadingContent(false);
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
    <div className={`h-full flex ${className}`}>
      {/* Left Pane - Story Structure */}
      {!isFocusMode && (
        <ResizablePane side="left" initialWidth={320} minWidth={250} maxWidth={500}>
          <ModernStoryStructure
            onSceneSelect={handleSceneSelect}
            onClearSelection={handleClearSelection}
            selectedSceneId={selectedSceneId || undefined}
            onStructureChange={loadStoryStructure}
          />
        </ResizablePane>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Row */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="text-gray-400 mx-2">›</span>}
                <span className={`${index === getBreadcrumbs().length - 1 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-3">
            {/* POV/Tense/Style Chips */}
            <div className="flex items-center space-x-2">
              <select
                value={pov}
                onChange={(e) => handleMetadataChange('pov', e.target.value)}
                className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded border-none focus:outline-none"
              >
                <option value="First Person">1st</option>
                <option value="Second Person">2nd</option>
                <option value="Third Person">3rd</option>
              </select>
              <select
                value={tense}
                onChange={(e) => handleMetadataChange('tense', e.target.value)}
                className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded border-none focus:outline-none"
              >
                <option value="Present">Present</option>
                <option value="Past">Past</option>
                <option value="Future">Future</option>
              </select>
              <select
                value={style}
                onChange={(e) => handleMetadataChange('style', e.target.value)}
                className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded border-none focus:outline-none"
              >
                <option value="Narrative">Narrative</option>
                <option value="Dialogue">Dialogue</option>
                <option value="Action">Action</option>
              </select>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
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

      {/* Right Pane - Inspector */}
      {showRightPane && !isFocusMode && (
        <ResizablePane side="right" initialWidth={300} minWidth={250} maxWidth={400}>
          <div className="h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('entities')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'entities'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Entities
              </button>
              <button
                onClick={() => setActiveTab('muse')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'muse'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Muse
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'entities' ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Characters</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          J
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">John Doe</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          S
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sarah Smith</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Places</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Central Park</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Events</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">The Meeting</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Quick Tools</h3>
                    <div className="space-y-2">
                      <button className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span className="font-medium">Muse Dice</span>
                        </div>
                        <p className="text-xs opacity-90 mt-1">Generate random inspiration</p>
                      </button>
                      <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">POV Swap</span>
                        </div>
                        <p className="text-xs opacity-90 mt-1">Switch perspective</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ResizablePane>
      )}
    </div>
  );
}
