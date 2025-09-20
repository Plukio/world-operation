import { create } from "zustand";
import { firebaseAutoSave } from "../lib/firebaseAutosave";
import { firebaseService, StoryNode, Scene, Branch, Entity, Relationship, Repository, EntityProvenance, Commit } from "../lib/firebaseService";

interface FirebaseAppState {
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

  // Data state
  entities: Entity[];
  relationships: Relationship[];
  repositories: Repository[];
  provenance: EntityProvenance[];
  branches: Branch[];
  commits: Commit[];

  // Loading states
  loading: {
    entities: boolean;
    relationships: boolean;
    repositories: boolean;
    provenance: boolean;
    branches: boolean;
    commits: boolean;
    structure: boolean;
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
  refreshCurrentScene: () => Promise<void>;
  
  // CRUD operations
  createNode: (kind: string, title: string, parentId?: string) => Promise<void>;
  updateNode: (nodeId: string, title: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  createScene: (chapterId: string, title: string) => Promise<void>;
  updateScene: (sceneId: string, title: string) => Promise<void>;
  deleteScene: (sceneId: string) => Promise<void>;
  initializeUserRepo: (userId: string) => Promise<string>;

  // Entity CRUD operations
  getEntities: () => Promise<void>;
  getEntity: (id: string) => Promise<Entity | null>;
  createEntity: (data: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Entity | null>;
  updateEntity: (id: string, data: Partial<Omit<Entity, 'id' | 'createdAt'>>) => Promise<Entity | null>;
  deleteEntity: (id: string) => Promise<boolean>;

  // Relationship CRUD operations
  getRelationships: () => Promise<void>;
  getRelationship: (id: string) => Promise<Relationship | null>;
  createRelationship: (data: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Relationship | null>;
  updateRelationship: (id: string, data: Partial<Omit<Relationship, 'id' | 'createdAt'>>) => Promise<Relationship | null>;
  deleteRelationship: (id: string) => Promise<boolean>;

  // Repository CRUD operations
  getRepositories: () => Promise<void>;
  getRepository: (id: string) => Promise<Repository | null>;
  createRepository: (data: Omit<Repository, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Repository | null>;
  updateRepository: (id: string, data: Partial<Omit<Repository, 'id' | 'createdAt'>>) => Promise<Repository | null>;
  deleteRepository: (id: string) => Promise<boolean>;

  // Entity Provenance CRUD operations
  getProvenance: () => Promise<void>;
  getProvenanceRecord: (id: string) => Promise<EntityProvenance | null>;
  createProvenance: (data: Omit<EntityProvenance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<EntityProvenance | null>;
  updateProvenance: (id: string, data: Partial<Omit<EntityProvenance, 'id' | 'createdAt'>>) => Promise<EntityProvenance | null>;
  deleteProvenance: (id: string) => Promise<boolean>;

  // Branch CRUD operations
  getBranches: () => Promise<void>;
  getBranch: (id: string) => Promise<Branch | null>;
  createBranch: (data: Omit<Branch, 'id' | 'created_at'>) => Promise<Branch | null>;
  updateBranch: (id: string, data: Partial<Omit<Branch, 'id' | 'created_at'>>) => Promise<Branch | null>;
  deleteBranch: (id: string) => Promise<boolean>;

  // Commit operations
  getCommits: () => Promise<void>;
  getCommit: (id: string) => Promise<Commit | null>;
  createCommit: (data: Omit<Commit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Commit | null>;
}

export const useFirebaseStore = create<FirebaseAppState>((set, get) => ({
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

  // Data state
  entities: [],
  relationships: [],
  repositories: [],
  provenance: [],
  branches: [],
  commits: [],

  // Loading states
  loading: {
    entities: false,
    relationships: false,
    repositories: false,
    provenance: false,
    branches: false,
    commits: false,
    structure: false,
  },

  // Actions
  setRepoId: (repoId: string) => {
    set({ repoId });
    get().refreshStructure();
  },

  setBranch: (branch: Branch) => {
    set({ branch });
    const { current } = get();
    if (current.sceneId && branch?.id) {
      // Load latest version for this scene/branch
      get().loadLatestVersion(current.sceneId, branch.id);
    }
  },

  setCurrentScene: (sceneId: string) => {
    set((state) => ({
      current: {
        ...state.current,
        sceneId,
      },
    }));

    const { branch } = get();
    if (branch?.id) {
      // Load latest version for this scene/branch
      get().loadLatestVersion(sceneId, branch.id);
    }
  },

  setEditorHtml: (html: string) => {
    console.log('📝 Editor content changed, length:', html.length);
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
      console.log('⏰ Cleared existing auto-save timeout');
    }

    // Set new auto-save timeout (2 seconds debounce)
    console.log('⏰ Setting auto-save timeout (2 seconds)');
    (window as any).autoSaveTimeout = setTimeout(() => {
      console.log('⏰ Auto-save timeout triggered, calling autoSave()');
      get().autoSave();
    }, 2000);
  },

  refreshStructure: async () => {
    const { repoId } = get();
    console.log('🔄 Refreshing structure from Firebase:', { repoId });
    
    set((state) => ({ loading: { ...state.loading, structure: true } }));
    
    try {
      // Get story nodes and scenes from Firebase
      console.log('📡 Fetching story nodes and scenes from Firebase...');
      const [nodes, allScenes] = await Promise.all([
        firebaseService.getStoryNodesByRepo(repoId),
        firebaseService.getAllScenes()
      ]);

      console.log('📊 Raw data from Firebase:', { 
        nodes: nodes, 
        allScenes: allScenes 
      });

      // Filter scenes that belong to the nodes in this repo
      const nodeIds = nodes.map(node => node.id).filter(Boolean);
      const scenes = allScenes.filter(scene => nodeIds.includes(scene.node_id));

      console.log('✅ Loaded structure from Firebase:', { 
        nodesCount: nodes.length, 
        scenesCount: scenes.length,
        nodeIds: nodeIds
      });

      set({
        structure: {
          nodes: nodes || [],
          scenes: scenes || [],
        },
      });
    } catch (error) {
      console.error("❌ Failed to fetch structure from Firebase:", error);
      // Fallback to empty structure
      set({
        structure: {
          nodes: [],
          scenes: [],
        },
      });
    } finally {
      set((state) => ({ loading: { ...state.loading, structure: false } }));
    }
  },

  loadLatestVersion: async (sceneId: string, branchId: string) => {
    console.log('📖 Loading latest version for scene:', { sceneId, branchId });
    
    try {
      // Try Firebase first
      const firebaseContent = await firebaseAutoSave.loadScene(sceneId, branchId);
      
      if (firebaseContent) {
        console.log('✅ Loaded content from Firebase:', { 
          contentLength: firebaseContent.contentHtml?.length || 0,
          lastModified: firebaseContent.lastModified 
        });
        
        set((state) => ({
          current: {
            ...state.current,
            versionId: firebaseContent.id,
          },
          editor: {
            html: firebaseContent.contentHtml || "<p>Start writing your story here...</p>",
            dirty: false,
            parentVersionId: firebaseContent.id,
            autoSaving: false,
            lastSaved: firebaseContent.lastModified,
          },
        }));
        return;
      }
      
      console.log('📭 No saved content found in Firebase');
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
    } catch (error) {
      console.error("❌ Failed to load latest version:", error);
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
      const result = await firebaseAutoSave.autoSaveScene(
        current.sceneId,
        branch.id,
        editor.html,
        {
          pov: "Alia", // TODO: Get from style locks
          tense: "present",
          style: "tense",
          message: message || "Manual save"
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
          new CustomEvent("scene:saved", {
            detail: { sceneId: current.sceneId, versionId: result.versionId },
          }),
        );

        return result.versionId || null;
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error("Failed to save version:", error);
      return null;
    }
  },

  autoSave: async () => {
    const { current, branch, editor } = get();
    console.log('🔄 Auto-save function called:', { 
      sceneId: current.sceneId, 
      branchId: branch?.id, 
      dirty: editor.dirty, 
      autoSaving: editor.autoSaving 
    });

    if (!current.sceneId || !branch?.id || !editor.dirty || editor.autoSaving) {
      console.log('❌ Auto-save skipped:', { 
        noSceneId: !current.sceneId, 
        noBranch: !branch?.id, 
        notDirty: !editor.dirty, 
        alreadySaving: editor.autoSaving 
      });
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
        branch.id!,
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

  refreshCurrentScene: async () => {
    const { current, branch } = get();
    if (current.sceneId && branch?.id) {
      console.log('🔄 Refreshing current scene content...');
      await get().loadLatestVersion(current.sceneId, branch.id);
    }
  },

  // CRUD operations
  createNode: async (kind: string, title: string, parentId?: string) => {
    const { repoId } = get();
    console.log('🔄 createNode called with:', { kind, title, parentId, repoId });
    
    if (!repoId) {
      const error = new Error('No repository ID found. Please make sure you are signed in and have a repository.');
      console.error('❌ No repoId:', error);
      throw error;
    }
    
    try {
      console.log('📡 Calling firebaseService.createStoryNode...');
      
      // Prepare the data object, only including parent_id if it's defined
      const nodeData: any = {
        repo_id: repoId,
        kind,
        title,
        order_idx: 0,
      };
      
      // Only add parent_id if it's defined (not undefined)
      if (parentId !== undefined) {
        nodeData.parent_id = parentId;
      }
      
      console.log('📊 Node data to create:', nodeData);
      
      const result = await firebaseService.createStoryNode(nodeData);
      console.log('✅ Firebase createStoryNode result:', result);
      
      console.log('🔄 Refreshing structure...');
      await get().refreshStructure();
      console.log('✅ Structure refresh completed');
    } catch (error) {
      console.error("❌ Failed to create node:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as any)?.code || 'unknown';
      console.error("❌ Error details:", {
        message: errorMessage,
        code: errorCode,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error; // Re-throw so UI can handle the error
    }
  },

  // Initialize user's repository
  initializeUserRepo: async (userId: string) => {
    try {
      console.log('🔄 Initializing user repository for:', userId);
      
      // Check if user already has a repository
      const existingRepos = await firebaseService.getRepositoriesByUser(userId);
      
      if (existingRepos.length > 0) {
        const repo = existingRepos[0];
        console.log('✅ Found existing repository:', repo);
        set({ repoId: repo.id });
        return repo.id || '';
      }
      
      // Create a new repository for the user
      const newRepo = await firebaseService.createRepository({
        name: 'My Story',
        user_id: userId,
        is_public: false,
      });
      
      console.log('✅ Created new repository:', newRepo);
      set({ repoId: newRepo.id });
      return newRepo.id || '';
    } catch (error) {
      console.error('❌ Failed to initialize user repository:', error);
      throw error;
    }
  },

  updateNode: async (nodeId: string, title: string) => {
    try {
      await firebaseService.updateStoryNode(nodeId, { title });
      await get().refreshStructure();
    } catch (error) {
      console.error("Failed to update node:", error);
      throw error;
    }
  },

  deleteNode: async (nodeId: string) => {
    try {
      await firebaseService.deleteStoryNode(nodeId);
      await get().refreshStructure();
    } catch (error) {
      console.error("Failed to delete node:", error);
      throw error;
    }
  },

  createScene: async (chapterId: string, title: string) => {
    try {
      await firebaseService.createScene({
        node_id: chapterId,
        title,
        order_idx: 0,
      });
      // Wait for structure refresh to complete
      await get().refreshStructure();
    } catch (error) {
      console.error("Failed to create scene:", error);
      throw error; // Re-throw so UI can handle the error
    }
  },

  updateScene: async (sceneId: string, title: string) => {
    try {
      await firebaseService.updateScene(sceneId, { title });
      await get().refreshStructure();
    } catch (error) {
      console.error("Failed to update scene:", error);
      throw error;
    }
  },

  deleteScene: async (sceneId: string) => {
    try {
      await firebaseService.deleteScene(sceneId);
      await get().refreshStructure();
    } catch (error) {
      console.error("Failed to delete scene:", error);
      throw error;
    }
  },

  // Entity CRUD operations
  getEntities: async () => {
    set((state) => ({ loading: { ...state.loading, entities: true } }));
    try {
      const entities = await firebaseService.getAllEntities();
      set({ entities });
    } catch (error) {
      console.error("Failed to fetch entities:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, entities: false } }));
    }
  },

  getEntity: async (id: string) => {
    try {
      return await firebaseService.getEntity(id);
    } catch (error) {
      console.error("Failed to fetch entity:", error);
      return null;
    }
  },

  createEntity: async (data: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEntity = await firebaseService.createEntity(data);
      set((state) => ({ entities: [...state.entities, newEntity] }));
      return newEntity;
    } catch (error) {
      console.error("Failed to create entity:", error);
      return null;
    }
  },

  updateEntity: async (id: string, data: Partial<Omit<Entity, 'id' | 'createdAt'>>) => {
    try {
      const updatedEntity = await firebaseService.updateEntity(id, data);
      if (updatedEntity) {
        set((state) => ({
          entities: state.entities.map((entity) =>
            entity.id === id ? updatedEntity : entity
          ),
        }));
      }
      return updatedEntity;
    } catch (error) {
      console.error("Failed to update entity:", error);
      return null;
    }
  },

  deleteEntity: async (id: string) => {
    try {
      const success = await firebaseService.deleteEntity(id);
      if (success) {
        set((state) => ({
          entities: state.entities.filter((entity) => entity.id !== id),
        }));
      }
      return success;
    } catch (error) {
      console.error("Failed to delete entity:", error);
      return false;
    }
  },

  // Relationship CRUD operations
  getRelationships: async () => {
    set((state) => ({ loading: { ...state.loading, relationships: true } }));
    try {
      const relationships = await firebaseService.getAllRelationships();
      set({ relationships });
    } catch (error) {
      console.error("Failed to fetch relationships:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, relationships: false } }));
    }
  },

  getRelationship: async (id: string) => {
    try {
      return await firebaseService.getRelationship(id);
    } catch (error) {
      console.error("Failed to fetch relationship:", error);
      return null;
    }
  },

  createRelationship: async (data: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRelationship = await firebaseService.createRelationship(data);
      set((state) => ({ relationships: [...state.relationships, newRelationship] }));
      return newRelationship;
    } catch (error) {
      console.error("Failed to create relationship:", error);
      return null;
    }
  },

  updateRelationship: async (id: string, data: Partial<Omit<Relationship, 'id' | 'createdAt'>>) => {
    try {
      const updatedRelationship = await firebaseService.updateRelationship(id, data);
      if (updatedRelationship) {
        set((state) => ({
          relationships: state.relationships.map((relationship) =>
            relationship.id === id ? updatedRelationship : relationship
          ),
        }));
      }
      return updatedRelationship;
    } catch (error) {
      console.error("Failed to update relationship:", error);
      return null;
    }
  },

  deleteRelationship: async (id: string) => {
    try {
      const success = await firebaseService.deleteRelationship(id);
      if (success) {
        set((state) => ({
          relationships: state.relationships.filter((relationship) => relationship.id !== id),
        }));
      }
      return success;
    } catch (error) {
      console.error("Failed to delete relationship:", error);
      return false;
    }
  },

  // Repository CRUD operations
  getRepositories: async () => {
    set((state) => ({ loading: { ...state.loading, repositories: true } }));
    try {
      const repositories = await firebaseService.getAllRepositories();
      set({ repositories });
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, repositories: false } }));
    }
  },

  getRepository: async (id: string) => {
    try {
      return await firebaseService.getRepository(id);
    } catch (error) {
      console.error("Failed to fetch repository:", error);
      return null;
    }
  },

  createRepository: async (data: Omit<Repository, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRepository = await firebaseService.createRepository(data);
      set((state) => ({ repositories: [...state.repositories, newRepository] }));
      return newRepository;
    } catch (error) {
      console.error("Failed to create repository:", error);
      return null;
    }
  },

  updateRepository: async (id: string, data: Partial<Omit<Repository, 'id' | 'createdAt'>>) => {
    try {
      const updatedRepository = await firebaseService.updateRepository(id, data);
      if (updatedRepository) {
        set((state) => ({
          repositories: state.repositories.map((repository) =>
            repository.id === id ? updatedRepository : repository
          ),
        }));
      }
      return updatedRepository;
    } catch (error) {
      console.error("Failed to update repository:", error);
      return null;
    }
  },

  deleteRepository: async (id: string) => {
    try {
      const success = await firebaseService.deleteRepository(id);
      if (success) {
        set((state) => ({
          repositories: state.repositories.filter((repository) => repository.id !== id),
        }));
      }
      return success;
    } catch (error) {
      console.error("Failed to delete repository:", error);
      return false;
    }
  },

  // Entity Provenance CRUD operations
  getProvenance: async () => {
    set((state) => ({ loading: { ...state.loading, provenance: true } }));
    try {
      const provenance = await firebaseService.getAllEntityProvenance();
      set({ provenance });
    } catch (error) {
      console.error("Failed to fetch provenance:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, provenance: false } }));
    }
  },

  getProvenanceRecord: async (id: string) => {
    try {
      return await firebaseService.getEntityProvenance(id);
    } catch (error) {
      console.error("Failed to fetch provenance record:", error);
      return null;
    }
  },

  createProvenance: async (data: Omit<EntityProvenance, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProvenance = await firebaseService.createEntityProvenance(data);
      set((state) => ({ provenance: [...state.provenance, newProvenance] }));
      return newProvenance;
    } catch (error) {
      console.error("Failed to create provenance:", error);
      return null;
    }
  },

  updateProvenance: async (id: string, data: Partial<Omit<EntityProvenance, 'id' | 'createdAt'>>) => {
    try {
      const updatedProvenance = await firebaseService.updateEntityProvenance(id, data);
      if (updatedProvenance) {
        set((state) => ({
          provenance: state.provenance.map((record) =>
            record.id === id ? updatedProvenance : record
          ),
        }));
      }
      return updatedProvenance;
    } catch (error) {
      console.error("Failed to update provenance:", error);
      return null;
    }
  },

  deleteProvenance: async (id: string) => {
    try {
      const success = await firebaseService.deleteEntityProvenance(id);
      if (success) {
        set((state) => ({
          provenance: state.provenance.filter((record) => record.id !== id),
        }));
      }
      return success;
    } catch (error) {
      console.error("Failed to delete provenance:", error);
      return false;
    }
  },

  // Branch CRUD operations
  getBranches: async () => {
    set((state) => ({ loading: { ...state.loading, branches: true } }));
    try {
      const branches = await firebaseService.getAllBranches();
      set({ branches });
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, branches: false } }));
    }
  },

  getBranch: async (id: string) => {
    try {
      return await firebaseService.getBranch(id);
    } catch (error) {
      console.error("Failed to fetch branch:", error);
      return null;
    }
  },

  createBranch: async (data: Omit<Branch, 'id' | 'created_at'>) => {
    try {
      const newBranch = await firebaseService.createBranch(data);
      set((state) => ({ branches: [...state.branches, newBranch] }));
      return newBranch;
    } catch (error) {
      console.error("Failed to create branch:", error);
      return null;
    }
  },

  updateBranch: async (id: string, data: Partial<Omit<Branch, 'id' | 'created_at'>>) => {
    try {
      const updatedBranch = await firebaseService.updateBranch(id, data);
      if (updatedBranch) {
        set((state) => ({
          branches: state.branches.map((branch) =>
            branch.id === id ? updatedBranch : branch
          ),
        }));
      }
      return updatedBranch;
    } catch (error) {
      console.error("Failed to update branch:", error);
      return null;
    }
  },

  deleteBranch: async (id: string) => {
    try {
      const success = await firebaseService.deleteBranch(id);
      if (success) {
        set((state) => ({
          branches: state.branches.filter((branch) => branch.id !== id),
        }));
      }
      return success;
    } catch (error) {
      console.error("Failed to delete branch:", error);
      return false;
    }
  },

  // Commit operations
  getCommits: async () => {
    set((state) => ({ loading: { ...state.loading, commits: true } }));
    try {
      const commits = await firebaseService.getAllCommits();
      set({ commits });
    } catch (error) {
      console.error("Failed to fetch commits:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, commits: false } }));
    }
  },

  getCommit: async (id: string) => {
    try {
      return await firebaseService.getCommit(id);
    } catch (error) {
      console.error("Failed to fetch commit:", error);
      return null;
    }
  },

  createCommit: async (data: Omit<Commit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCommit = await firebaseService.createCommit(data);
      set((state) => ({ commits: [...state.commits, newCommit] }));
      return newCommit;
    } catch (error) {
      console.error("Failed to create commit:", error);
      return null;
    }
  },
}));
