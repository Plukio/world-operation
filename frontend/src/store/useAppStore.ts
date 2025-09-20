import { create } from "zustand";
import { api } from "../lib/api";

export interface Episode {
  id: string;
  repo_id: string;
  title: string;
  order_idx: number;
}

export interface Scene {
  id: string;
  episode_id: string;
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
    episodes: Episode[];
    scenes: Scene[];
  };
  current: {
    episodeId?: string;
    sceneId?: string;
    versionId?: string;
  };
  editor: {
    html: string;
    dirty: boolean;
    parentVersionId?: string;
  };

  // Actions
  setRepoId: (repoId: string) => void;
  setBranch: (branch: Branch) => void;
  setCurrentScene: (sceneId: string) => void;
  setEditorHtml: (html: string) => void;
  refreshStructure: () => Promise<void>;
  loadLatestVersion: (sceneId: string, branchId: string) => Promise<void>;
  saveVersion: (message?: string) => Promise<string | null>;
  clearDirty: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  repoId: "default-repo",
  branch: null,
  structure: {
    episodes: [],
    scenes: [],
  },
  current: {},
  editor: {
    html: "<p>Start writing your story here...</p>",
    dirty: false,
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
        episodeId: scene.episode_id,
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
  },

  refreshStructure: async () => {
    const { repoId } = get();
    try {
      const response = await api.get(`/episodes/structure?repo_id=${repoId}`);
      set({
        structure: {
          episodes: response.data.episodes || [],
          scenes: response.data.scenes || [],
        },
      });
    } catch (error) {
      console.error("Failed to refresh structure:", error);
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
        },
      }));
    }
  },

  saveVersion: async (message?: string) => {
    const { current, branch, editor } = get();

    if (!current.sceneId || !branch || !editor.parentVersionId) {
      console.error("Cannot save: missing scene, branch, or parent version");
      return null;
    }

    try {
      const response = await api.post("/versions/save", {
        scene_id: current.sceneId,
        branch_id: branch.id,
        parent_version_id: editor.parentVersionId,
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
      return null;
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
}));
