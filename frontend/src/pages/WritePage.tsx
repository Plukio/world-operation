import { useState, useEffect, useCallback } from "react";
import RichTextEditor from "../components/RichTextEditor";
import BranchBar from "../components/BranchBar";
import MusePanel from "../components/MusePanel";
import PRModal from "../components/PRModal";
import CreateEditModal from "../components/CreateEditModal";
import ContextMenu from "../components/ContextMenu";
import InlineEdit from "../components/InlineEdit";
import { useAppStore } from "../store/useAppStore";
import { api } from "../lib/api";

export default function WritePage() {
  const [activeTab, setActiveTab] = useState<"episode" | "scene">("episode");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  
  // CRUD modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: "epic" | "chapter" | "scene";
    parentId?: string;
    itemId?: string;
    initialValue?: string;
  }>({ type: "epic" });
  
  // Context menu states
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    type: "epic" | "chapter" | "scene";
    itemId: string;
    itemTitle: string;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    type: "epic",
    itemId: "",
    itemTitle: "",
  });

  // Inline editing states
  const [editingItem, setEditingItem] = useState<{
    type: "epic" | "chapter" | "scene";
    itemId: string;
    currentTitle: string;
  } | null>(null);

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
    createNode,
    updateNode,
    deleteNode,
    createScene,
    updateScene,
    deleteScene,
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
    if (structure.nodes.length === 0) {
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
    structure.nodes.length,
  ]);

  const handleSave = useCallback(async () => {
    if (editor.dirty && !saving) {
      setSaving(true);
      try {
        await saveVersion();
      } finally {
        setSaving(false);
      }
    }
  }, [editor.dirty, saving, saveVersion]);

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

  // CRUD handlers
  const handleCreate = (type: "epic" | "chapter" | "scene", parentId?: string) => {
    setModalConfig({ type, parentId });
    setShowCreateModal(true);
  };

  const handleEdit = (type: "epic" | "chapter" | "scene", itemId: string, title: string) => {
    setModalConfig({ type, itemId, initialValue: title });
    setShowEditModal(true);
  };

  const handleDelete = async (type: "epic" | "chapter" | "scene", itemId: string) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === "scene") {
        await deleteScene(itemId);
      } else {
        await deleteNode(itemId);
      }
    }
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    type: "epic" | "chapter" | "scene",
    itemId: string,
    itemTitle: string
  ) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type,
      itemId,
      itemTitle,
    });
  };

  const handleCreateSubmit = async (title: string) => {
    const { type, parentId } = modalConfig;
    if (type === "scene" && parentId) {
      await createScene(parentId, title);
    } else {
      await createNode(type, title, parentId);
    }
  };

  const handleEditSubmit = async (title: string) => {
    const { type, itemId } = modalConfig;
    if (type === "scene" && itemId) {
      await updateScene(itemId, title);
    } else if (itemId) {
      await updateNode(itemId, title);
    }
  };

  // Double-click editing handlers
  const handleDoubleClick = (type: "epic" | "chapter" | "scene", itemId: string, currentTitle: string) => {
    setEditingItem({ type, itemId, currentTitle });
  };

  const handleInlineEditSubmit = async (newTitle: string) => {
    if (!editingItem) return;
    
    const { type, itemId } = editingItem;
    if (type === "scene") {
      await updateScene(itemId, newTitle);
    } else {
      await updateNode(itemId, newTitle);
    }
    setEditingItem(null);
  };

  const handleInlineEditCancel = () => {
    setEditingItem(null);
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
        {/* Story Structure sidebar */}
        <aside className="col-span-3 border rounded p-3 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Story Structure</h3>
            <button
              onClick={() => handleCreate("epic")}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              title="Add Epic"
            >
              + Epic
            </button>
          </div>
          <div className="mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {branch?.name || "No branch"}
            </span>
          </div>
          <ul className="space-y-2">
            {structure.nodes
              .filter((node) => node.kind === "epic")
              .map((epic) => (
                <li key={epic.id}>
                  <div 
                    className="font-medium flex justify-between items-center group"
                    onContextMenu={(e) => handleContextMenu(e, "epic", epic.id, epic.title)}
                  >
                    {editingItem?.type === "epic" && editingItem.itemId === epic.id ? (
                      <InlineEdit
                        value={editingItem.currentTitle}
                        onSave={handleInlineEditSubmit}
                        onCancel={handleInlineEditCancel}
                        className="flex-1"
                      />
                    ) : (
                      <span 
                        onDoubleClick={() => handleDoubleClick("epic", epic.id, epic.title)}
                        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                        title="Double-click to edit"
                      >
                        {epic.title}
                      </span>
                    )}
                    <button
                      onClick={() => handleCreate("chapter", epic.id)}
                      className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-blue-700"
                      title="Add Chapter"
                    >
                      + Ch
                    </button>
                  </div>
                  <ul className="ml-3 list-disc">
                    {structure.nodes
                      .filter((node) => node.parent_id === epic.id && node.kind === "chapter")
                      .map((chapter) => (
                        <li key={chapter.id}>
                          <div 
                            className="font-medium text-sm flex justify-between items-center group"
                            onContextMenu={(e) => handleContextMenu(e, "chapter", chapter.id, chapter.title)}
                          >
                            {editingItem?.type === "chapter" && editingItem.itemId === chapter.id ? (
                              <InlineEdit
                                value={editingItem.currentTitle}
                                onSave={handleInlineEditSubmit}
                                onCancel={handleInlineEditCancel}
                                className="flex-1 text-sm"
                              />
                            ) : (
                              <span 
                                onDoubleClick={() => handleDoubleClick("chapter", chapter.id, chapter.title)}
                                className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                                title="Double-click to edit"
                              >
                                {chapter.title}
                              </span>
                            )}
                            <button
                              onClick={() => handleCreate("scene", chapter.id)}
                              className="text-xs bg-purple-600 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-purple-700"
                              title="Add Scene"
                            >
                              + Sc
                            </button>
                          </div>
                          <ul className="ml-3 list-disc">
                            {structure.scenes
                              .filter((sc) => sc.node_id === chapter.id)
                              .map((sc) => (
                                <li key={sc.id}>
                                  {editingItem?.type === "scene" && editingItem.itemId === sc.id ? (
                                    <InlineEdit
                                      value={editingItem.currentTitle}
                                      onSave={handleInlineEditSubmit}
                                      onCancel={handleInlineEditCancel}
                                      className="w-full text-sm"
                                    />
                                  ) : (
                                    <button
                                      className={`text-left w-full ${
                                        current.sceneId === sc.id ? "font-semibold" : ""
                                      }`}
                                      onClick={() => setCurrentScene(sc.id)}
                                      onContextMenu={(e) => handleContextMenu(e, "scene", sc.id, sc.title)}
                                    >
                                      <span 
                                        onDoubleClick={(e) => {
                                          e.stopPropagation();
                                          handleDoubleClick("scene", sc.id, sc.title);
                                        }}
                                        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded block"
                                        title="Double-click to edit"
                                      >
                                        {sc.title}
                                        {current.sceneId === sc.id && editor.dirty && (
                                          <span className="ml-1 text-orange-500">•</span>
                                        )}
                                      </span>
                                    </button>
                                  )}
                                </li>
                              ))}
                          </ul>
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
              className="px-3 py-2 border rounded disabled:opacity-50"
              onClick={handleSave}
              disabled={!editor.dirty || saving}
            >
              {saving ? "Saving..." : "Save (⌘S)"}
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

      {/* Create Modal */}
      <CreateEditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        title={`Create ${modalConfig.type === "epic" ? "Epic" : modalConfig.type === "chapter" ? "Chapter" : "Scene"}`}
        placeholder={`Enter ${modalConfig.type} title...`}
        submitLabel="Create"
      />

      {/* Edit Modal */}
      <CreateEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        title={`Edit ${modalConfig.type === "epic" ? "Epic" : modalConfig.type === "chapter" ? "Chapter" : "Scene"}`}
        placeholder={`Enter ${modalConfig.type} title...`}
        initialValue={modalConfig.initialValue}
        submitLabel="Update"
      />

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        x={contextMenu.x}
        y={contextMenu.y}
        items={[
          {
            label: "Edit",
            onClick: () => handleEdit(contextMenu.type, contextMenu.itemId, contextMenu.itemTitle),
          },
          {
            label: "Delete",
            onClick: () => handleDelete(contextMenu.type, contextMenu.itemId),
            className: "text-red-600 hover:bg-red-50",
          },
        ]}
      />
    </div>
  );
}
