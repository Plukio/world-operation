import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseStore } from '../store/useFirebaseStore';
import MinimalSidebar from './MinimalSidebar';
import MinimalEditor from './MinimalEditor';
import MinimalToolbar from './MinimalToolbar';

export default function MinimalLayout() {
  const { user } = useAuth();
  const { 
    structure, 
    branch, 
    refreshStructure, 
    setCurrentScene,
    loadLatestVersion,
    initializeUserRepo
  } = useFirebaseStore();
  const [currentSceneId, setCurrentSceneId] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    console.log('🔄 MinimalLayout useEffect triggered:', { user: user?.email, uid: user?.uid });
    if (user) {
      console.log('👤 User found, initializing repository...');
      initializeUserRepo(user.uid).then((repoId) => {
        console.log('✅ Repository initialized with ID:', repoId);
        refreshStructure().then(() => {
          console.log('✅ Structure refreshed after repo initialization');
        });
      }).catch((error) => {
        console.error('❌ Failed to initialize repository:', error);
      });
    } else {
      console.log('❌ No user found, skipping initialization');
    }
  }, [user, initializeUserRepo, refreshStructure]);

  const handleSceneSelect = async (sceneId: string) => {
    setCurrentSceneId(sceneId);
    if (branch?.id) {
      await setCurrentScene(sceneId);
      await loadLatestVersion(sceneId, branch.id);
    }
  };

  const currentScene = structure.scenes.find(scene => scene.id === currentSceneId);

  return (
    <div className="h-screen flex bg-white">
      {/* Minimal Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} transition-all duration-200 border-r border-gray-200 flex flex-col`}>
        <MinimalSidebar
          onSceneSelect={handleSceneSelect}
          currentSceneId={currentSceneId}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Minimal Toolbar */}
        <MinimalToolbar
          currentScene={currentScene ? {
            id: currentScene.id || '',
            title: currentScene.title,
            node_id: currentScene.node_id,
            order_idx: currentScene.order_idx
          } : undefined}
          currentBranch={branch}
        />

        {/* Minimal Editor */}
        <div className="flex-1">
          <MinimalEditor
            currentSceneId={currentSceneId}
            currentSceneTitle={currentScene?.title}
          />
        </div>
      </div>
    </div>
  );
}
