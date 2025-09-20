import { useState } from 'react';
import { useFirebaseStore } from '../store/useFirebaseStore';

interface GitStatusBarProps {
  currentBranch?: { id: string; name: string; repo_id: string; created_at: string } | null;
  onBranchChange: (branchId: string) => void;
  branches: { id: string; name: string; repo_id: string; created_at: string }[];
  onCreateBranch: (name: string) => void;
  onCommit: (message: string) => void;
  uncommittedCount: number;
  onPRClick: () => void;
}

export default function GitStatusBar({
  currentBranch,
  onBranchChange,
  branches,
  onCreateBranch,
  onCommit,
  uncommittedCount,
  onPRClick
}: GitStatusBarProps) {
  const { editor } = useFirebaseStore();
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [showCommitInput, setShowCommitInput] = useState(false);

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      onCreateBranch(newBranchName.trim());
      setNewBranchName('');
      setShowCreateBranch(false);
    }
  };

  const handleCommit = () => {
    if (commitMessage.trim()) {
      onCommit(commitMessage.trim());
      setCommitMessage('');
      setShowCommitInput(false);
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between text-sm">
      {/* Left side - Branch info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-300">Branch:</span>
          <select
            value={currentBranch?.id || ''}
            onChange={(e) => onBranchChange(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowCreateBranch(true)}
          className="text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Branch</span>
        </button>
      </div>

      {/* Center - Status */}
      <div className="flex items-center space-x-4">
        {editor.autoSaving && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Auto-saving...</span>
          </div>
        )}
        
        {editor.dirty && !editor.autoSaving && (
          <div className="flex items-center space-x-2 text-orange-400">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Unsaved changes</span>
          </div>
        )}

        {!editor.dirty && editor.lastSaved && (
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Saved {new Date(editor.lastSaved).toLocaleTimeString()}</span>
          </div>
        )}

        {uncommittedCount > 0 && (
          <div className="flex items-center space-x-2 text-blue-400">
            <span>{uncommittedCount} uncommitted change{uncommittedCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowCommitInput(true)}
          disabled={!editor.dirty}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Commit</span>
        </button>

        <button
          onClick={onPRClick}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>Pull Request</span>
        </button>
      </div>

      {/* Create Branch Modal */}
      {showCreateBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Branch</h3>
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Branch name"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateBranch(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBranch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commit Modal */}
      {showCommitInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Commit Changes</h3>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mb-4 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCommitInput(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCommit}
                disabled={!commitMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded"
              >
                Commit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
