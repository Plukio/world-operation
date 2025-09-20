import { useAuth } from '../contexts/AuthContext';
import { useFirebaseStore } from '../store/useFirebaseStore';

export default function DataDebug() {
  const { user } = useAuth();
  const { 
    repoId, 
    branch, 
    structure, 
    commits,
    entities,
    relationships,
    repositories
  } = useFirebaseStore();

  const handleRefreshData = async () => {
    const { refreshStructure, getEntities, getRelationships, getRepositories } = useFirebaseStore.getState();
    console.log('🔄 Manually refreshing all data...');
    
    try {
      await Promise.all([
        refreshStructure(),
        getEntities(),
        getRelationships(),
        getRepositories()
      ]);
      console.log('✅ All data refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    }
  };

  const handleTestCreateEpic = async () => {
    const { createNode } = useFirebaseStore.getState();
    console.log('🧪 Testing epic creation...');
    
    try {
      await createNode('epic', 'Test Epic ' + new Date().toLocaleTimeString());
      console.log('✅ Test epic created successfully');
    } catch (error) {
      console.error('❌ Test epic creation failed:', error);
      alert(`Test epic creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-semibold text-gray-900 mb-3">Data Debug</h3>
      
      <div className="space-y-2 text-xs mb-4">
        <div><strong>User:</strong> {user ? user.email : 'Not signed in'}</div>
        <div><strong>Repo ID:</strong> {repoId || 'Not set'}</div>
        <div><strong>Branch:</strong> {branch?.name || 'Not set'}</div>
        <div><strong>Epics:</strong> {structure.nodes.filter(n => n.kind === 'epic').length}</div>
        <div><strong>Chapters:</strong> {structure.nodes.filter(n => n.kind === 'chapter').length}</div>
        <div><strong>Scenes:</strong> {structure.scenes.length}</div>
        <div><strong>Entities:</strong> {entities.length}</div>
        <div><strong>Relationships:</strong> {relationships.length}</div>
        <div><strong>Repositories:</strong> {repositories.length}</div>
        <div><strong>Commits:</strong> {commits.length}</div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleRefreshData}
          className="w-full px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
        >
          Refresh All Data
        </button>
        
        <button
          onClick={handleTestCreateEpic}
          className="w-full px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
        >
          Test Create Epic
        </button>
        
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600">Show Raw Data</summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
            <div><strong>Structure:</strong></div>
            <pre>{JSON.stringify(structure, null, 2)}</pre>
          </div>
        </details>
      </div>
    </div>
  );
}
