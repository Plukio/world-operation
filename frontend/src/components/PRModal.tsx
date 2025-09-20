import { useState } from "react";

interface Branch {
  id: string;
  name: string;
  created_at: string;
}

interface PRModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  onPRCreated: (
    sourceBranch: string,
    targetBranch: string,
    title: string,
    description: string,
  ) => void;
}

export default function PRModal({
  isOpen,
  onClose,
  branches,
  onPRCreated,
}: PRModalProps) {
  const [sourceBranch, setSourceBranch] = useState("");
  const [targetBranch, setTargetBranch] = useState("main");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDiff, setShowDiff] = useState(false);

  if (!isOpen) return null;

  const handleCreatePR = () => {
    if (sourceBranch && targetBranch && title) {
      onPRCreated(sourceBranch, targetBranch, title, description);
      onClose();
      // Reset form
      setSourceBranch("");
      setTargetBranch("main");
      setTitle("");
      setDescription("");
      setShowDiff(false);
    }
  };

  const handleShowDiff = () => {
    if (sourceBranch && targetBranch) {
      setShowDiff(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Pull Request</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {!showDiff ? (
          <div className="space-y-4">
            {/* Branch Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Branch
                </label>
                <select
                  value={sourceBranch}
                  onChange={(e) => setSourceBranch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select source branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Branch
                </label>
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PR Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PR Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Alia survives the eclipse ceremony"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the changes and their impact on the story..."
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={handleShowDiff}
                disabled={!sourceBranch || !targetBranch}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Preview Diff
              </button>
              <div className="space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePR}
                  disabled={!sourceBranch || !targetBranch || !title}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                >
                  Create PR
                </button>
              </div>
            </div>
          </div>
        ) : (
          <DiffViewer
            sourceBranch={sourceBranch}
            targetBranch={targetBranch}
            onBack={() => setShowDiff(false)}
            onCreatePR={handleCreatePR}
          />
        )}
      </div>
    </div>
  );
}

interface DiffViewerProps {
  sourceBranch: string;
  targetBranch: string;
  onBack: () => void;
  onCreatePR: () => void;
}

function DiffViewer({ onBack }: DiffViewerProps) {
  const [activeTab, setActiveTab] = useState<"semantic" | "raw">("semantic");

  // Mock diff data
  const semanticSummary = `
    This PR explores an alternative timeline where Alia survives the eclipse ceremony.
    The changes significantly alter the story's emotional arc, shifting from tragedy to
    triumph. The character development becomes more complex as Alia must deal with the
    consequences of her survival rather than her death.
  `;

  const risks = [
    "May undermine the emotional impact of the original ending",
    "Requires significant rewrites of subsequent scenes",
    "Could create plot inconsistencies with established character arcs",
  ];

  const entityChanges = {
    added: ["Alia (survived)", "New character: Healer"],
    removed: ["Alia (deceased)"],
    modified: ["General Tal's motivation", "Eclipse ceremony outcome"],
  };

  return (
    <div className="space-y-4">
      {/* Tab Headers */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm ${
            activeTab === "semantic"
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("semantic")}
        >
          Semantic Diff
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            activeTab === "raw"
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("raw")}
        >
          Raw Diff
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "semantic" ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Story Impact Summary</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {semanticSummary.trim()}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Potential Risks</h3>
            <ul className="text-sm space-y-1">
              {risks.map((risk, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">⚠</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Entity Changes</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-600 mb-1">Added</h4>
                <ul className="space-y-1">
                  {entityChanges.added.map((item, index) => (
                    <li key={index} className="text-green-700">
                      + {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-600 mb-1">Removed</h4>
                <ul className="space-y-1">
                  {entityChanges.removed.map((item, index) => (
                    <li key={index} className="text-red-700">
                      - {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-600 mb-1">Modified</h4>
                <ul className="space-y-1">
                  {entityChanges.modified.map((item, index) => (
                    <li key={index} className="text-blue-700">
                      ~ {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Raw text diff would be displayed here, showing line-by-line changes.
          </div>
          <div className="bg-gray-50 p-4 rounded font-mono text-xs">
            <div className="text-green-600">
              + Alia opened her eyes, gasping for breath.
            </div>
            <div className="text-red-600">
              - Alia's body lay still on the altar.
            </div>
            <div className="text-blue-600">
              ~ General Tal's expression changed from triumph to shock.
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Back to Form
        </button>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Merge (Accept Theirs)
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Merge (Accept Mine)
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Blend (AI Reconciliation)
          </button>
        </div>
      </div>
    </div>
  );
}
