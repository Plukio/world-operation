import { useState, useEffect } from "react";
import { useFirebaseStore } from "../store/useFirebaseStore";
import { api } from "../lib/api";

interface SceneVersion {
  id: string;
  scene_id: string;
  branch_id: string;
  parent_version_id?: string;
  content_html: string;
  meta: Record<string, any>;
  created_at: string;
}

interface SentimentPoint {
  version_id: string;
  score: number;
  created_at: string;
}

export default function CommitsPage() {
  const { branch, structure } = useFirebaseStore();
  const [selectedEpic, setSelectedEpic] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [versions, setVersions] = useState<SceneVersion[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentPoint[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<{
    left?: string;
    right?: string;
  }>({});
  const [diffData, setDiffData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load versions when scene changes
  useEffect(() => {
    if (selectedScene && branch) {
      loadVersions(selectedScene, branch.id);
      loadSentimentData(selectedScene, branch.id);
    }
  }, [selectedScene, branch]);

  const loadVersions = async (sceneId: string, branchId: string) => {
    try {
      const response = await api.get(
        `/scenes/${sceneId}/versions?branch_id=${branchId}`
      );
      setVersions(response.data);
    } catch (error) {
      console.error("Failed to load versions:", error);
    }
  };

  const loadSentimentData = async (sceneId: string, branchId: string) => {
    try {
      const response = await api.get(
        `/sentiment/series?scene_id=${sceneId}&branch_id=${branchId}`
      );
      setSentimentData(response.data);
    } catch (error) {
      console.error("Failed to load sentiment data:", error);
    }
  };

  const loadDiff = async (leftVersionId: string, rightVersionId: string) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/diff?left_version=${leftVersionId}&right_version=${rightVersionId}`
      );
      setDiffData(response.data);
    } catch (error) {
      console.error("Failed to load diff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionId: string, side: "left" | "right") => {
    const newSelection = { ...selectedVersions, [side]: versionId };
    setSelectedVersions(newSelection);

    // Auto-load diff if both versions are selected
    if (newSelection.left && newSelection.right) {
      loadDiff(newSelection.left, newSelection.right);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "text-green-600";
    if (score < -0.3) return "text-red-600";
    return "text-gray-600";
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return "Positive";
    if (score < -0.3) return "Negative";
    return "Neutral";
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">Commit Management</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Branch</label>
          <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded">
            {branch?.name || "No branch selected"}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Epic</label>
          <select
            value={selectedEpic}
            onChange={(e) => {
              setSelectedEpic(e.target.value);
              setSelectedChapter("");
              setSelectedScene("");
            }}
            className="px-3 py-2 border rounded"
          >
            <option value="">Select epic</option>
            {structure.nodes
              .filter((node) => node.kind === "epic")
              .map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.title}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Chapter</label>
          <select
            value={selectedChapter}
            onChange={(e) => {
              setSelectedChapter(e.target.value);
              setSelectedScene("");
            }}
            className="px-3 py-2 border rounded"
            disabled={!selectedEpic}
          >
            <option value="">Select chapter</option>
            {structure.nodes
              .filter((node) => node.parent_id === selectedEpic && node.kind === "chapter")
              .map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Scene</label>
          <select
            value={selectedScene}
            onChange={(e) => setSelectedScene(e.target.value)}
            className="px-3 py-2 border rounded"
            disabled={!selectedChapter}
          >
            <option value="">Select scene</option>
            {structure.scenes
              .filter((sc) => sc.node_id === selectedChapter)
              .map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.title}
                </option>
              ))}
          </select>
        </div>
      </div>

      {selectedScene && (
        <div className="flex-1 grid grid-cols-2 gap-6">
          {/* Versions List */}
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">Versions Timeline</h2>
            <div className="space-y-3 max-h-96 overflow-auto">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedVersions.left === version.id ||
                    selectedVersions.right === version.id
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    const side = selectedVersions.left ? "right" : "left";
                    handleVersionSelect(version.id, side);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        v{versions.length - index} - {formatDate(version.created_at)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {version.content_html
                          .replace(/<[^>]*>/g, "")
                          .substring(0, 100)}
                        ...
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${getSentimentColor(
                          version.meta?.sentiment || 0
                        )}`}
                      >
                        {getSentimentLabel(version.meta?.sentiment || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(version.meta?.sentiment || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diff Viewer */}
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">Diff Viewer</h2>
            {selectedVersions.left && selectedVersions.right ? (
              <div>
                {loading ? (
                  <div className="text-center py-8">Loading diff...</div>
                ) : diffData ? (
                  <div className="space-y-4">
                    {/* Semantic Summary */}
                    <div>
                      <h3 className="font-medium mb-2">Story Impact</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {diffData.semantic_summary}
                      </div>
                    </div>

                    {/* Risks */}
                    {diffData.risks && diffData.risks.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">Potential Risks</h3>
                        <ul className="space-y-1">
                          {diffData.risks.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start text-sm">
                              <span className="text-red-500 mr-2">⚠</span>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Raw Diff */}
                    <div>
                      <h3 className="font-medium mb-2">Raw Changes</h3>
                      <div
                        className="bg-gray-50 p-3 rounded text-xs font-mono max-h-64 overflow-auto"
                        dangerouslySetInnerHTML={{
                          __html: diffData.raw_diff_html,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select two versions to compare
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select two versions to compare
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sentiment Chart */}
      {sentimentData.length > 0 && (
        <div className="mt-6 border rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Sentiment Over Time</h2>
          <div className="flex items-end space-x-2 h-32">
            {sentimentData.map((point, index) => (
              <div key={point.version_id} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t ${
                    point.score > 0 ? "bg-green-400" : "bg-red-400"
                  }`}
                  style={{
                    height: `${Math.abs(point.score) * 100 + 20}px`,
                  }}
                  title={`v${sentimentData.length - index}: ${point.score.toFixed(2)}`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  v{sentimentData.length - index}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
