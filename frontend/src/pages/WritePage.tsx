import { useState, useEffect } from "react";
import RichTextEditor from "../components/RichTextEditor";
import BranchBar from "../components/BranchBar";
import MusePanel from "../components/MusePanel";
import PRModal from "../components/PRModal";
import { api } from "../lib/api";

// Mock data for episodes and scenes
const MOCK_EPISODES = [
  { id: "ep1", title: "Episode 1: The Awakening" },
  { id: "ep2", title: "Episode 2: The Journey" },
];

const MOCK_SCENES = {
  ep1: [
    { id: "sc1", title: "Opening Scene" },
    { id: "sc2", title: "The Discovery" },
  ],
  ep2: [
    { id: "sc3", title: "The Departure" },
    { id: "sc4", title: "First Encounter" },
  ],
};

export default function WritePage() {
  const [activeTab, setActiveTab] = useState<"episode" | "scene">("episode");
  const [current, setCurrent] = useState({ episodeId: "ep1", sceneId: "sc1" });
  const [content, setContent] = useState(
    "<p>Start writing your story here...</p>",
  );
  const [extracting, setExtracting] = useState(false);

  // Git-like state
  const [currentBranch, setCurrentBranch] = useState({
    id: "main",
    name: "main",
    created_at: new Date().toISOString(),
  });
  const [branches] = useState([
    { id: "main", name: "main", created_at: new Date().toISOString() },
    {
      id: "alia-survives",
      name: "alia-survives-eclipse",
      created_at: new Date().toISOString(),
    },
  ]);
  const [uncommittedCount, setUncommittedCount] = useState(0);
  const [styleLocks] = useState({
    pov: "Alia",
    tense: "present",
    style: "tense",
  });
  const [showPRModal, setShowPRModal] = useState(false);

  // Track content changes for uncommitted count
  useEffect(() => {
    const hasChanges = content !== "<p>Start writing your story here...</p>";
    setUncommittedCount(hasChanges ? 1 : 0);
  }, [content]);

  const handleExtract = async () => {
    setExtracting(true);
    try {
      // Strip HTML tags for extraction
      const textContent = content.replace(/<[^>]*>/g, "");
      await api.extractEntities(textContent);
    } catch (error) {
      console.error("Extraction failed:", error);
    } finally {
      setExtracting(false);
    }
  };

  const handleBranchChange = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      setCurrentBranch(branch);
    }
  };

  const handleCreateBranch = (name: string) => {
    // TODO: Call API to create branch
    console.log("Creating branch:", name);
  };

  const handleCommit = (message: string) => {
    // TODO: Call API to commit changes
    console.log("Committing:", message);
    setUncommittedCount(0);
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
    setContent(content + template);
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
        currentBranch={currentBranch}
        branches={branches}
        onBranchChange={handleBranchChange}
        onCreateBranch={handleCreateBranch}
        onCommit={handleCommit}
        uncommittedCount={uncommittedCount}
        onPRClick={() => setShowPRModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Episode/Scene sidebar */}
        <aside className="col-span-3 border rounded p-3 overflow-auto">
          <h3 className="font-semibold mb-2">Episodes & Scenes</h3>
          <div className="mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {currentBranch.name}
            </span>
          </div>
          <ul className="space-y-2">
            {MOCK_EPISODES.map((ep) => (
              <li key={ep.id}>
                <div className="font-medium">{ep.title}</div>
                <ul className="ml-3 list-disc">
                  {MOCK_SCENES[ep.id as keyof typeof MOCK_SCENES]?.map((sc) => (
                    <li key={sc.id}>
                      <button
                        className={`text-left ${current.sceneId === sc.id ? "font-semibold" : ""}`}
                        onClick={() =>
                          setCurrent({ episodeId: ep.id, sceneId: sc.id })
                        }
                      >
                        {sc.title}
                        {current.sceneId === sc.id && uncommittedCount > 0 && (
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
              POV: {styleLocks.pov}
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Tense: {styleLocks.tense}
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Style: {styleLocks.style}
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

          <RichTextEditor value={content} onChange={setContent} />

          <div className="mt-3 flex gap-2">
            <button
              className="px-3 py-2 bg-black text-white rounded"
              onClick={handleExtract}
              disabled={extracting}
            >
              {extracting ? "Extracting…" : "Extract Entities"}
            </button>
            <button className="px-3 py-2 border rounded">Save</button>
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
