import { create } from "zustand";
import { api } from "../lib/api";
import { firebaseAutoSave } from "../lib/firebaseAutosave";

export interface StoryNode {
  id: string;
  repo_id: string;
  kind: string; // 'epic' or 'chapter'
  title: string;
  parent_id?: string;
  order_idx: number;
}

export interface Scene {
  id: string;
  node_id: string;
  title: string;
  order_idx: number;
}

export interface Branch {
  id: string;
  name: string;
  created_at: string;
}

export interface SceneVersion {
  id: string;
  scene_id: string;
  branch_id: string;
  parent_version_id?: string;
  content_html: string;
  meta: Record<string, any>;
  created_at: string;
}

interface AppState {
  // Core state
  repoId: string;
  branch: Branch | null;
  structure: {
    nodes: StoryNode[];
    scenes: Scene[];
  };
  current: {
    nodeId?: string;
    sceneId?: string;
    versionId?: string;
  };
  editor: {
    html: string;
    dirty: boolean;
    parentVersionId?: string;
    autoSaving: boolean;
    lastSaved: Date | null;
  };

  // Actions
  setRepoId: (repoId: string) => void;
  setBranch: (branch: Branch) => void;
  setCurrentScene: (sceneId: string) => void;
  setEditorHtml: (html: string) => void;
  refreshStructure: () => Promise<void>;
  loadLatestVersion: (sceneId: string, branchId: string) => Promise<void>;
  saveVersion: (message?: string) => Promise<string | null>;
  autoSave: () => Promise<void>;
  clearDirty: () => void;
  
  // CRUD operations
  createNode: (kind: string, title: string, parentId?: string) => Promise<void>;
  updateNode: (nodeId: string, title: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  createScene: (chapterId: string, title: string) => Promise<void>;
  updateScene: (sceneId: string, title: string) => Promise<void>;
  deleteScene: (sceneId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  repoId: "default-repo",
  branch: null,
  structure: {
    nodes: [],
    scenes: [],
  },
  current: {},
  editor: {
    html: "<p>Start writing your story here...</p>",
    dirty: false,
    parentVersionId: undefined,
    autoSaving: false,
    lastSaved: null,
  },

  // Actions
  setRepoId: (repoId: string) => {
    set({ repoId });
    get().refreshStructure();
  },

  setBranch: (branch: Branch) => {
    set({ branch });
    const { current } = get();
    if (current.sceneId) {
      get().loadLatestVersion(current.sceneId, branch.id);
    }
  },

  setCurrentScene: (sceneId: string) => {
    const { branch, structure } = get();
    const scene = structure.scenes.find((s) => s.id === sceneId);

    if (!scene || !branch) return;

    set({
      current: {
        nodeId: scene.node_id,
        sceneId: sceneId,
      },
    });

    // Load latest version for this scene/branch
    get().loadLatestVersion(sceneId, branch.id);
  },

  setEditorHtml: (html: string) => {
    set((state) => ({
      editor: {
        ...state.editor,
        html,
        dirty: true,
      },
    }));

    // Clear existing auto-save timeout
    if ((window as any).autoSaveTimeout) {
      clearTimeout((window as any).autoSaveTimeout);
    }

    // Set new auto-save timeout (2 seconds debounce)
    (window as any).autoSaveTimeout = setTimeout(() => {
      get().autoSave();
    }, 2000);
  },

  refreshStructure: async () => {
    const { repoId } = get();
    try {
      const response = await api.get(`/structure?repo_id=${repoId}`);
      set({
        structure: {
          nodes: response.data.nodes || [],
          scenes: response.data.scenes || [],
        },
      });
    } catch (error) {
      console.error("Failed to refresh structure:", error);
      // If API fails, use mock data for demonstration
      set({
        structure: {
          nodes: [
            {
              id: "epic-1",
              repo_id: repoId,
              kind: "epic",
              title: "The Great Adventure",
              parent_id: undefined,
              order_idx: 0,
            },
            {
              id: "chapter-1",
              repo_id: repoId,
              kind: "chapter",
              title: "Chapter 1: The Beginning",
              parent_id: "epic-1",
              order_idx: 0,
            },
          ],
          scenes: [
            {
              id: "scene-1",
              node_id: "chapter-1",
              title: "Opening Scene",
              order_idx: 0,
            },
            {
              id: "scene-2",
              node_id: "chapter-1",
              title: "The Journey Begins",
              order_idx: 1,
            },
          ],
        },
      });
    }
  },

  loadLatestVersion: async (sceneId: string, branchId: string) => {
    try {
      const response = await api.get(
        `/versions/latest?scene_id=${sceneId}&branch_id=${branchId}`,
      );
      const version = response.data;

      set((state) => ({
        current: {
          ...state.current,
          versionId: version.id,
        },
        editor: {
          html:
            version.content_html || "<p>Start writing your story here...</p>",
          dirty: false,
          parentVersionId: version.id,
          autoSaving: false,
          lastSaved: null,
        },
      }));
    } catch (error) {
      console.error("Failed to load latest version:", error);
      // Set empty content if no version exists
      set(() => ({
  editor: {
    html: "<p>Start writing your story here...</p>",
    dirty: false,
    parentVersionId: undefined,
    autoSaving: false,
    lastSaved: null,
  },
      }));
    }
  },

  saveVersion: async (message?: string) => {
    const { current, branch, editor } = get();

    if (!current.sceneId || !branch) {
      console.error("Cannot save: missing scene or branch");
      return null;
    }

    try {
      const response = await api.post("/versions/save", {
        scene_id: current.sceneId,
        branch_id: branch.id,
        parent_version_id: editor.parentVersionId || null,
        content_html: editor.html,
        meta: {
          pov: "Alia", // TODO: Get from style locks
          tense: "present",
          style: "tense",
        },
        message:
          message || editor.html.replace(/<[^>]*>/g, "").substring(0, 90),
      });

      const newVersionId = response.data.version_id;

      set((state) => ({
        editor: {
          ...state.editor,
          dirty: false,
          parentVersionId: newVersionId,
        },
        current: {
          ...state.current,
          versionId: newVersionId,
        },
      }));

      // Emit event for other components
      window.dispatchEvent(
        new CustomEvent("scene:saved", {
          detail: { sceneId: current.sceneId, versionId: newVersionId },
        }),
      );

      return newVersionId;
    } catch (error) {
      console.error("Failed to save version:", error);
      // Even if API fails, mark as saved locally to prevent data loss
      set(() => ({
        editor: {
          ...get().editor,
          dirty: false,
        },
      }));
      return null;
    }
  },

  autoSave: async () => {
    const { current, branch, editor } = get();

    if (!current.sceneId || !branch || !editor.dirty || editor.autoSaving) {
      return;
    }

    set((state) => ({
      editor: {
        ...state.editor,
        autoSaving: true,
      },
    }));

    try {
      const result = await firebaseAutoSave.autoSaveScene(
        current.sceneId,
        branch.id,
        editor.html,
        {
          pov: "Alia", // TODO: Get from style locks
          tense: "present",
          style: "tense",
        }
      );

      if (result.success) {
        set((state) => ({
          editor: {
            ...state.editor,
            dirty: false,
            parentVersionId: result.versionId,
            autoSaving: false,
            lastSaved: new Date(),
          },
          current: {
            ...state.current,
            versionId: result.versionId,
          },
        }));

        // Emit event for other components
        window.dispatchEvent(
          new CustomEvent("scene:autosaved", {
            detail: { sceneId: current.sceneId, versionId: result.versionId },
          }),
        );
      } else {
        throw new Error(result.error || 'Auto-save failed');
      }
    } catch (error) {
      console.error("Failed to auto-save:", error);
      set((state) => ({
        editor: {
          ...state.editor,
          autoSaving: false,
        },
      }));
    }
  },

  clearDirty: () => {
    set((state) => ({
      editor: {
        ...state.editor,
        dirty: false,
      },
    }));
  },

  // CRUD operations
  createNode: async (kind: string, title: string, parentId?: string) => {
    const { repoId } = get();
    try {
      await api.createNode({
        repo_id: repoId,
        kind,
        title,
        parent_id: parentId,
      });
      get().refreshStructure();
    } catch (error) {
      console.error("Failed to create node:", error);
      // If API fails, add to mock data
      const { structure } = get();
      const newId = `${kind}-${Date.now()}`;
      const newNode = {
        id: newId,
        repo_id: repoId,
        kind,
        title,
        parent_id: parentId,
        order_idx: structure.nodes.filter(n => n.parent_id === parentId).length,
      };
      set({
        structure: {
          ...structure,
          nodes: [...structure.nodes, newNode],
        },
      });
    }
  },

  updateNode: async (nodeId: string, title: string) => {
    try {
      await api.updateNode(nodeId, { title });
      get().refreshStructure();
    } catch (error) {
      console.error("Failed to update node:", error);
      // If API fails, update mock data
      const { structure } = get();
      set({
        structure: {
          ...structure,
          nodes: structure.nodes.map(node => 
            node.id === nodeId ? { ...node, title } : node
          ),
        },
      });
    }
  },

  deleteNode: async (nodeId: string) => {
    try {
      await api.deleteNode(nodeId);
      get().refreshStructure();
    } catch (error) {
      console.error("Failed to delete node:", error);
      // If API fails, update mock data
      const { structure } = get();
      set({
        structure: {
          nodes: structure.nodes.filter(node => node.id !== nodeId),
          scenes: structure.scenes.filter(scene => {
            // Also remove scenes that belong to deleted chapters
            const chapter = structure.nodes.find(n => n.id === scene.node_id);
            return chapter && chapter.id !== nodeId;
          }),
        },
      });
    }
  },

  createScene: async (chapterId: string, title: string) => {
    try {
      await api.createScene(chapterId, { title });
      get().refreshStructure();
    } catch (error) {
      console.error("Failed to create scene:", error);
      // If API fails, add to mock data
      const { structure } = get();
      const newId = `scene-${Date.now()}`;
      const newScene = {
        id: newId,
        node_id: chapterId,
        title,
        order_idx: structure.scenes.filter(s => s.node_id === chapterId).length,
      };
      set({
        structure: {
          ...structure,
          scenes: [...structure.scenes, newScene],
        },
      });
    }
  },

  updateScene: async (sceneId: string, title: string) => {
    try {
      await api.updateScene(sceneId, { title });
      get().refreshStructure();
    } catch (error) {
      console.error("Failed to update scene:", error);
      // If API fails, update mock data
      const { structure } = get();
      set({
        structure: {
          ...structure,
          scenes: structure.scenes.map(scene => 
            scene.id === sceneId ? { ...scene, title } : scene
          ),
        },
      });
    }
  },

  deleteScene: async (sceneId: string) => {
    try {
      await api.deleteScene(sceneId);
      get().refreshStructure();
    } catch (error) {
      console.error("Failed to delete scene:", error);
      // If API fails, update mock data
      const { structure } = get();
      set({
        structure: {
          ...structure,
          scenes: structure.scenes.filter(scene => scene.id !== sceneId),
        },
      });
    }
  },
}));
