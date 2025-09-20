import { useState, useEffect } from 'react';
import GitSidebar from './GitSidebar';
import GitStatusBar from './GitStatusBar';
import GitEditor from './GitEditor';
import PRModal from './PRModal';
import { useFirebaseStore } from '../store/useFirebaseStore';

export default function GitLayout() {
  const { structure, branch, setBranch, refreshStructure } = useFirebaseStore();
  const [currentSceneId, setCurrentSceneId] = useState<string>('');
  const [showPRModal, setShowPRModal] = useState(false);
  
  // Mock branches for now
  const [branches] = useState([
    { id: "main", name: "main", repo_id: "default-repo", created_at: new Date().toISOString() },
    { id: "alia-survives", name: "alia-survives-eclipse", repo_id: "default-repo", created_at: new Date().toISOString() },
  ]);

  // Initialize store on mount
  useEffect(() => {
    if (structure.nodes.length === 0) {
      refreshStructure();
    }
  }, [structure.nodes.length, refreshStructure]);

  // Set default branch
  useEffect(() => {
    if (!branch && branches.length > 0) {
      setBranch(branches[0]);
    }
  }, [branch, branches, setBranch]);

  const handleSceneSelect = (sceneId: string) => {
    setCurrentSceneId(sceneId);
  };

  const handleBranchChange = (branchId: string) => {
    const selectedBranch = branches.find((b) => b.id === branchId);
    if (selectedBranch) {
      setBranch(selectedBranch);
    }
  };

  const handleCreateBranch = (name: string) => {
    console.log('Creating branch:', name);
    // TODO: Implement branch creation
  };

  const handleCommit = (message: string) => {
    console.log('Committing with message:', message);
    // TODO: Implement commit
  };

  const currentScene = structure.scenes.find(scene => scene.id === currentSceneId);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Git Status Bar */}
      <GitStatusBar
        currentBranch={branch}
        onBranchChange={handleBranchChange}
        branches={branches}
        onCreateBranch={handleCreateBranch}
        onCommit={handleCommit}
        uncommittedCount={0} // TODO: Calculate from editor state
        onPRClick={() => setShowPRModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Git Sidebar */}
        <GitSidebar
          onSceneSelect={handleSceneSelect}
          currentSceneId={currentSceneId}
        />

        {/* Git Editor */}
        <GitEditor
          currentSceneId={currentSceneId}
          currentSceneTitle={currentScene?.title}
        />
      </div>

      {/* Pull Request Modal */}
      <PRModal
        isOpen={showPRModal}
        onClose={() => setShowPRModal(false)}
        branches={branches}
        onPRCreated={(sourceBranch, targetBranch, title, description) => {
          console.log('PR Created:', { sourceBranch, targetBranch, title, description });
          setShowPRModal(false);
        }}
      />
    </div>
  );
}
