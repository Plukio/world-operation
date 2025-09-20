import { create } from "zustand";
import { api } from "../lib/api";
import type {
  Entity,
  Relationship,
  Repository,
  EntityProvenance,
  Branch,
  Commit,
  EntityCreate,
  EntityUpdate,
  RelationshipCreate,
  RelationshipUpdate,
  RepositoryCreate,
  RepositoryUpdate,
  EntityProvenanceCreate,
  EntityProvenanceUpdate,
  BranchCreate,
  BranchUpdate,
  CommitCreate,
} from "../types";

interface CRUDState {
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
  };

  // Entity CRUD operations
  getEntities: () => Promise<void>;
  getEntity: (id: string) => Promise<Entity | null>;
  createEntity: (data: EntityCreate) => Promise<Entity | null>;
  updateEntity: (id: string, data: EntityUpdate) => Promise<Entity | null>;
  deleteEntity: (id: string) => Promise<boolean>;

  // Relationship CRUD operations
  getRelationships: () => Promise<void>;
  getRelationship: (id: string) => Promise<Relationship | null>;
  createRelationship: (data: RelationshipCreate) => Promise<Relationship | null>;
  updateRelationship: (id: string, data: RelationshipUpdate) => Promise<Relationship | null>;
  deleteRelationship: (id: string) => Promise<boolean>;

  // Repository CRUD operations
  getRepositories: () => Promise<void>;
  getRepository: (id: string) => Promise<Repository | null>;
  createRepository: (data: RepositoryCreate) => Promise<Repository | null>;
  updateRepository: (id: string, data: RepositoryUpdate) => Promise<Repository | null>;
  deleteRepository: (id: string) => Promise<boolean>;

  // Entity Provenance CRUD operations
  getProvenance: () => Promise<void>;
  getProvenanceRecord: (id: string) => Promise<EntityProvenance | null>;
  createProvenance: (data: EntityProvenanceCreate) => Promise<EntityProvenance | null>;
  updateProvenance: (id: string, data: EntityProvenanceUpdate) => Promise<EntityProvenance | null>;
  deleteProvenance: (id: string) => Promise<boolean>;

  // Branch CRUD operations
  getBranches: () => Promise<void>;
  getBranch: (id: string) => Promise<Branch | null>;
  createBranch: (data: BranchCreate) => Promise<Branch | null>;
  updateBranch: (id: string, data: BranchUpdate) => Promise<Branch | null>;
  deleteBranch: (id: string) => Promise<boolean>;

  // Commit operations
  getCommits: () => Promise<void>;
  getCommit: (id: string) => Promise<Commit | null>;
  createCommit: (data: CommitCreate) => Promise<Commit | null>;
}

export const useCRUDStore = create<CRUDState>((set) => ({
  // Initial state
  entities: [],
  relationships: [],
  repositories: [],
  provenance: [],
  branches: [],
  commits: [],

  loading: {
    entities: false,
    relationships: false,
    repositories: false,
    provenance: false,
    branches: false,
    commits: false,
  },

  // Entity CRUD operations
  getEntities: async () => {
    set((state) => ({ loading: { ...state.loading, entities: true } }));
    try {
      const response = await api.getEntities();
      set({ entities: response.data });
    } catch (error) {
      console.error("Failed to fetch entities:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, entities: false } }));
    }
  },

  getEntity: async (id: string) => {
    try {
      const response = await api.getEntity(id);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch entity:", error);
      return null;
    }
  },

  createEntity: async (data: EntityCreate) => {
    try {
      const response = await api.createEntity(data);
      const newEntity = response.data;
      set((state) => ({ entities: [...state.entities, newEntity] }));
      return newEntity;
    } catch (error) {
      console.error("Failed to create entity:", error);
      return null;
    }
  },

  updateEntity: async (id: string, data: EntityUpdate) => {
    try {
      const response = await api.updateEntity(id, data);
      const updatedEntity = response.data;
      set((state) => ({
        entities: state.entities.map((entity) =>
          entity.id === id ? updatedEntity : entity
        ),
      }));
      return updatedEntity;
    } catch (error) {
      console.error("Failed to update entity:", error);
      return null;
    }
  },

  deleteEntity: async (id: string) => {
    try {
      await api.deleteEntity(id);
      set((state) => ({
        entities: state.entities.filter((entity) => entity.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete entity:", error);
      return false;
    }
  },

  // Relationship CRUD operations
  getRelationships: async () => {
    set((state) => ({ loading: { ...state.loading, relationships: true } }));
    try {
      const response = await api.getRelationships();
      set({ relationships: response.data });
    } catch (error) {
      console.error("Failed to fetch relationships:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, relationships: false } }));
    }
  },

  getRelationship: async (id: string) => {
    try {
      const response = await api.getRelationship(id);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch relationship:", error);
      return null;
    }
  },

  createRelationship: async (data: RelationshipCreate) => {
    try {
      const response = await api.createRelationship(data);
      const newRelationship = response.data;
      set((state) => ({ relationships: [...state.relationships, newRelationship] }));
      return newRelationship;
    } catch (error) {
      console.error("Failed to create relationship:", error);
      return null;
    }
  },

  updateRelationship: async (id: string, data: RelationshipUpdate) => {
    try {
      const response = await api.updateRelationship(id, data);
      const updatedRelationship = response.data;
      set((state) => ({
        relationships: state.relationships.map((relationship) =>
          relationship.id === id ? updatedRelationship : relationship
        ),
      }));
      return updatedRelationship;
    } catch (error) {
      console.error("Failed to update relationship:", error);
      return null;
    }
  },

  deleteRelationship: async (id: string) => {
    try {
      await api.deleteRelationship(id);
      set((state) => ({
        relationships: state.relationships.filter((relationship) => relationship.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete relationship:", error);
      return false;
    }
  },

  // Repository CRUD operations
  getRepositories: async () => {
    set((state) => ({ loading: { ...state.loading, repositories: true } }));
    try {
      const response = await api.getRepositories();
      set({ repositories: response.data });
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, repositories: false } }));
    }
  },

  getRepository: async (id: string) => {
    try {
      const response = await api.getRepository(id);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch repository:", error);
      return null;
    }
  },

  createRepository: async (data: RepositoryCreate) => {
    try {
      const response = await api.createRepository(data);
      const newRepository = response.data;
      set((state) => ({ repositories: [...state.repositories, newRepository] }));
      return newRepository;
    } catch (error) {
      console.error("Failed to create repository:", error);
      return null;
    }
  },

  updateRepository: async (id: string, data: RepositoryUpdate) => {
    try {
      const response = await api.updateRepository(id, data);
      const updatedRepository = response.data;
      set((state) => ({
        repositories: state.repositories.map((repository) =>
          repository.id === id ? updatedRepository : repository
        ),
      }));
      return updatedRepository;
    } catch (error) {
      console.error("Failed to update repository:", error);
      return null;
    }
  },

  deleteRepository: async (id: string) => {
    try {
      await api.deleteRepository(id);
      set((state) => ({
        repositories: state.repositories.filter((repository) => repository.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete repository:", error);
      return false;
    }
  },

  // Entity Provenance CRUD operations
  getProvenance: async () => {
    set((state) => ({ loading: { ...state.loading, provenance: true } }));
    try {
      const response = await api.getProvenance();
      set({ provenance: response.data });
    } catch (error) {
      console.error("Failed to fetch provenance:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, provenance: false } }));
    }
  },

  getProvenanceRecord: async (id: string) => {
    try {
      const response = await api.getProvenanceRecord(id);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch provenance record:", error);
      return null;
    }
  },

  createProvenance: async (data: EntityProvenanceCreate) => {
    try {
      const response = await api.createProvenance(data);
      const newProvenance = response.data;
      set((state) => ({ provenance: [...state.provenance, newProvenance] }));
      return newProvenance;
    } catch (error) {
      console.error("Failed to create provenance:", error);
      return null;
    }
  },

  updateProvenance: async (id: string, data: EntityProvenanceUpdate) => {
    try {
      const response = await api.updateProvenance(id, data);
      const updatedProvenance = response.data;
      set((state) => ({
        provenance: state.provenance.map((record) =>
          record.id === id ? updatedProvenance : record
        ),
      }));
      return updatedProvenance;
    } catch (error) {
      console.error("Failed to update provenance:", error);
      return null;
    }
  },

  deleteProvenance: async (id: string) => {
    try {
      await api.deleteProvenance(id);
      set((state) => ({
        provenance: state.provenance.filter((record) => record.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete provenance:", error);
      return false;
    }
  },

  // Branch CRUD operations
  getBranches: async () => {
    set((state) => ({ loading: { ...state.loading, branches: true } }));
    try {
      const response = await api.getBranches();
      set({ branches: response.data });
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, branches: false } }));
    }
  },

  getBranch: async (id: string) => {
    try {
      const response = await api.getBranch(id);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch branch:", error);
      return null;
    }
  },

  createBranch: async (data: BranchCreate) => {
    try {
      const response = await api.createBranch(data);
      const newBranch = response.data;
      set((state) => ({ branches: [...state.branches, newBranch] }));
      return newBranch;
    } catch (error) {
      console.error("Failed to create branch:", error);
      return null;
    }
  },

  updateBranch: async (id: string, data: BranchUpdate) => {
    try {
      const response = await api.updateBranch(id, data);
      const updatedBranch = response.data;
      set((state) => ({
        branches: state.branches.map((branch) =>
          branch.id === id ? updatedBranch : branch
        ),
      }));
      return updatedBranch;
    } catch (error) {
      console.error("Failed to update branch:", error);
      return null;
    }
  },

  deleteBranch: async (id: string) => {
    try {
      await api.deleteBranch(id);
      set((state) => ({
        branches: state.branches.filter((branch) => branch.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete branch:", error);
      return false;
    }
  },

  // Commit operations
  getCommits: async () => {
    set((state) => ({ loading: { ...state.loading, commits: true } }));
    try {
      const response = await api.getCommits();
      set({ commits: response.data });
    } catch (error) {
      console.error("Failed to fetch commits:", error);
    } finally {
      set((state) => ({ loading: { ...state.loading, commits: false } }));
    }
  },

  getCommit: async (id: string) => {
    try {
      const response = await api.getCommit(id);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch commit:", error);
      return null;
    }
  },

  createCommit: async (data: CommitCreate) => {
    try {
      const response = await api.createCommit(data);
      const newCommit = response.data;
      set((state) => ({ commits: [...state.commits, newCommit] }));
      return newCommit;
    } catch (error) {
      console.error("Failed to create commit:", error);
      return null;
    }
  },
}));
