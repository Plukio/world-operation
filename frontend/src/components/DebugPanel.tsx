import { useAuth } from '../contexts/AuthContext';
import { useFirebaseStore } from '../store/useFirebaseStore';

export default function DebugPanel() {
  const { user } = useAuth();
  const { 
    repoId, 
    branch, 
    structure, 
    createNode, 
    initializeUserRepo,
    refreshStructure 
  } = useFirebaseStore();

  const handleTestCreateEpic = async () => {
    console.log('🧪 Testing epic creation...');
    console.log('User:', user);
    console.log('RepoId:', repoId);
    console.log('Branch:', branch);
    
    try {
      await createNode('epic', 'Test Epic');
      console.log('✅ Epic creation completed');
    } catch (error) {
      console.error('❌ Epic creation failed:', error);
    }
  };

  const handleInitializeRepo = async () => {
    if (user) {
      console.log('🧪 Initializing user repo...');
      try {
        const newRepoId = await initializeUserRepo(user.uid);
        console.log('✅ Repo initialized:', newRepoId);
      } catch (error) {
        console.error('❌ Repo initialization failed:', error);
      }
    }
  };

  const handleRefreshStructure = async () => {
    console.log('🧪 Refreshing structure...');
    try {
      await refreshStructure();
      console.log('✅ Structure refreshed');
    } catch (error) {
      console.error('❌ Structure refresh failed:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div><strong>User:</strong> {user ? user.email : 'Not logged in'}</div>
        <div><strong>Repo ID:</strong> {repoId || 'Not set'}</div>
        <div><strong>Branch:</strong> {branch?.name || 'Not set'}</div>
        <div><strong>Epics:</strong> {structure.nodes.filter(n => n.kind === 'epic').length}</div>
        <div><strong>Chapters:</strong> {structure.nodes.filter(n => n.kind === 'chapter').length}</div>
        <div><strong>Scenes:</strong> {structure.scenes.length}</div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={handleInitializeRepo}
          className="w-full px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
        >
          Initialize Repo
        </button>
        
        <button
          onClick={handleRefreshStructure}
          className="w-full px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
        >
          Refresh Structure
        </button>
        
        <button
          onClick={handleTestCreateEpic}
          className="w-full px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded"
        >
          Test Create Epic
        </button>
      </div>
    </div>
  );
}
