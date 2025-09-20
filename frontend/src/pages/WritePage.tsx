import { useState, useEffect, useCallback } from "react";
import RichTextEditor from "../components/RichTextEditor";
import BranchBar from "../components/BranchBar";
import MusePanel from "../components/MusePanel";
import PRModal from "../components/PRModal";
import { useAppStore } from "../store/useAppStore";
import { api } from "../lib/api";

export default function WritePage() {
  const [activeTab, setActiveTab] = useState<"episode" | "scene">("episode");
  const [extracting, setExtracting] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);

  // Zustand store
  const {
    branch,
    structure,
    current,
    editor,
    setBranch,
    setCurrentScene,
    setEditorHtml,
    refreshStructure,
    saveVersion,
  } = useAppStore();

  // Mock branches for now
  const [branches] = useState([
    { id: "main", name: "main", created_at: new Date().toISOString() },
    {
      id: "alia-survives",
      name: "alia-survives-eclipse",
      created_at: new Date().toISOString(),
    },
  ]);

  // Initialize store on mount
  useEffect(() => {
    if (structure.episodes.length === 0) {
      refreshStructure();
    }
    if (!branch && branches.length > 0) {
      setBranch(branches[0]);
    }
  }, [
    refreshStructure,
    setBranch,
    branch,
    branches,
    structure.episodes.length,
  ]);

  const handleSave = useCallback(async () => {
    if (editor.dirty) {
      await saveVersion();
    }
  }, [editor.dirty, saveVersion]);

  // Handle save with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleExtract = async () => {
    setExtracting(true);
    try {
      // Strip HTML tags for extraction
      const textContent = editor.html.replace(/<[^>]*>/g, "");
      await api.extractEntities(textContent);
    } catch (error) {
      console.error("Extraction failed:", error);
    } finally {
      setExtracting(false);
    }
  };

  const handleBranchChange = (branchId: string) => {
    const selectedBranch = branches.find((b) => b.id === branchId);
    if (selectedBranch) {
      setBranch(selectedBranch);
    }
  };

  const handleCreateBranch = (name: string) => {
    // TODO: Call API to create branch
    console.log("Creating branch:", name);
  };

  const handleCommit = async (message: string) => {
    await saveVersion(message);
  };

  const handleConstraintGenerated = (constraint: string) => {
    // TODO: Apply constraint to editor
    console.log("Constraint:", constraint);
  };

  const handleObstacleEscalated = (options: string[]) => {
    // TODO: Show options to user
    console.log("Obstacle options:", options);
  };

  const handlePOVSwapped = (text: string) => {
    // TODO: Replace current text with POV-swapped version
    console.log("POV swapped:", text);
  };

  const handleSensoryEnhanced = (text: string) => {
    // TODO: Replace current text with enhanced version
    console.log("Sensory enhanced:", text);
  };

  const handleBeatTemplateInserted = (template: string) => {
    // TODO: Insert template into editor
    setEditorHtml(editor.html + template);
  };

  const handleWhatIfForked = (whatIf: string) => {
    // TODO: Create new branch with what-if scenario
    console.log("What-if fork:", whatIf);
  };

  const handlePRCreated = (
    sourceBranch: string,
    targetBranch: string,
    title: string,
    description: string,
  ) => {
    // TODO: Call API to create PR
    console.log("Creating PR:", {
      sourceBranch,
      targetBranch,
      title,
      description,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Branch Bar */}
      <BranchBar
        currentBranch={branch}
        branches={branches}
        onBranchChange={handleBranchChange}
        onCreateBranch={handleCreateBranch}
        onCommit={handleCommit}
        uncommittedCount={editor.dirty ? 1 : 0}
        onPRClick={() => setShowPRModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Episode/Scene sidebar */}
        <aside className="col-span-3 border rounded p-3 overflow-auto">
          <h3 className="font-semibold mb-2">Episodes & Scenes</h3>
          <div className="mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {branch?.name || "No branch"}
            </span>
          </div>
          <ul className="space-y-2">
            {structure.episodes.map((ep) => (
              <li key={ep.id}>
                <div className="font-medium">{ep.title}</div>
                <ul className="ml-3 list-disc">
                  {structure.scenes
                    .filter((sc) => sc.episode_id === ep.id)
                    .map((sc) => (
                      <li key={sc.id}>
                        <button
                          className={`text-left ${
                            current.sceneId === sc.id ? "font-semibold" : ""
                          }`}
                          onClick={() => setCurrentScene(sc.id)}
                        >
                          {sc.title}
                          {current.sceneId === sc.id && editor.dirty && (
                            <span className="ml-1 text-orange-500">•</span>
                          )}
                        </button>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor + actions */}
        <section className="col-span-6">
          {/* Style Locks */}
          <div className="flex gap-2 mb-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              POV: Alia
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Tense: present
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Style: tense
            </span>
          </div>

          <div className="flex gap-2 mb-2">
            <button
              className={`px-3 py-1 rounded ${activeTab === "episode" ? "bg-black text-white" : "border"}`}
              onClick={() => setActiveTab("episode")}
            >
              Episode
            </button>
            <button
              className={`px-3 py-1 rounded ${activeTab === "scene" ? "bg-black text-white" : "border"}`}
              onClick={() => setActiveTab("scene")}
            >
              Scene
            </button>
          </div>

          <RichTextEditor value={editor.html} onChange={setEditorHtml} />

          <div className="mt-3 flex gap-2">
            <button
              className="px-3 py-2 bg-black text-white rounded"
              onClick={handleExtract}
              disabled={extracting}
            >
              {extracting ? "Extracting…" : "Extract Entities"}
            </button>
            <button
              className="px-3 py-2 border rounded"
              onClick={handleSave}
              disabled={!editor.dirty}
            >
              Save (⌘S)
            </button>
            <button className="px-3 py-2 border rounded">Open Composer</button>
          </div>
        </section>

        {/* Muse Panel */}
        <aside className="col-span-3 border rounded overflow-hidden">
          <MusePanel
            onConstraintGenerated={handleConstraintGenerated}
            onObstacleEscalated={handleObstacleEscalated}
            onPOVSwapped={handlePOVSwapped}
            onSensoryEnhanced={handleSensoryEnhanced}
            onBeatTemplateInserted={handleBeatTemplateInserted}
            onWhatIfForked={handleWhatIfForked}
          />
        </aside>
      </div>

      {/* PR Modal */}
      <PRModal
        isOpen={showPRModal}
        onClose={() => setShowPRModal(false)}
        branches={branches}
        onPRCreated={handlePRCreated}
      />
    </div>
  );
}
