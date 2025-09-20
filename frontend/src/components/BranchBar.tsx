import { useState } from "react";

interface Branch {
  id: string;
  name: string;
  created_at: string;
}

interface BranchBarProps {
  currentBranch: Branch | null;
  branches: Branch[];
  onBranchChange: (branchId: string) => void;
  onCreateBranch: (name: string) => void;
  onCommit: (message: string) => void;
  uncommittedCount: number;
  onPRClick: () => void;
}

export default function BranchBar({
  currentBranch,
  branches,
  onBranchChange,
  onCreateBranch,
  onCommit,
  uncommittedCount,
  onPRClick,
}: BranchBarProps) {
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [showCommitInput, setShowCommitInput] = useState(false);

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      onCreateBranch(newBranchName.trim());
      setNewBranchName("");
      setShowCreateBranch(false);
    }
  };

  const handleCommit = () => {
    if (commitMessage.trim()) {
      onCommit(commitMessage.trim());
      setCommitMessage("");
      setShowCommitInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    } else if (e.key === "Escape") {
      setShowCreateBranch(false);
      setShowCommitInput(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border-b bg-gray-50">
      {/* Branch Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Branch:</span>
        <select
          value={currentBranch?.id || ""}
          onChange={(e) => onBranchChange(e.target.value)}
          className="px-2 py-1 border rounded text-sm bg-white"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCreateBranch(true)}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Create new branch (⌘B)"
        >
          + Branch
        </button>
      </div>

      {/* Create Branch Input */}
      {showCreateBranch && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Branch name (e.g., alia-survives-eclipse)"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleCreateBranch)}
            className="px-2 py-1 border rounded text-sm"
            autoFocus
          />
          <button
            onClick={handleCreateBranch}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create
          </button>
          <button
            onClick={() => setShowCreateBranch(false)}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Commit Section */}
      <div className="flex items-center gap-2 ml-auto">
        {uncommittedCount > 0 && (
          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
            {uncommittedCount} uncommitted
          </span>
        )}

        {!showCommitInput ? (
          <button
            onClick={() => setShowCommitInput(true)}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            title="Commit changes (⌘S)"
          >
            Commit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Commit message (e.g., 'Alia refuses the call; tone: bitter')"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleCommit)}
              className="px-2 py-1 border rounded text-sm w-80"
              autoFocus
            />
            <button
              onClick={handleCommit}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              Commit
            </button>
            <button
              onClick={() => setShowCommitInput(false)}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* PR Button */}
      <button
        onClick={onPRClick}
        className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
        title="Create Pull Request"
      >
        PR
      </button>
    </div>
  );
}
