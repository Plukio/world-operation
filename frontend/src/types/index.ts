// Entity types
export interface Entity {
  id: string;
  type: string;
  name: string;
  description?: string;
  aliases: string[];
}

export interface EntityCreate {
  type: string;
  name: string;
  description?: string;
  aliases?: string[];
}

export interface EntityUpdate {
  type: string;
  name: string;
  description?: string;
  aliases?: string[];
}

// Relationship types
export interface Relationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relation_type: string;
}

export interface RelationshipCreate {
  source_entity_id: string;
  target_entity_id: string;
  relation_type: string;
}

export interface RelationshipUpdate {
  source_entity_id: string;
  target_entity_id: string;
  relation_type: string;
}

// Repository types
export interface Repository {
  id: string;
  name: string;
  created_at: string;
}

export interface RepositoryCreate {
  name: string;
}

export interface RepositoryUpdate {
  name: string;
}

// Entity Provenance types
export interface EntityProvenance {
  id: string;
  entity_id: string;
  scene_id: string;
  start_idx: number;
  end_idx: number;
  confidence: number;
}

export interface EntityProvenanceCreate {
  entity_id: string;
  scene_id: string;
  start_idx: number;
  end_idx: number;
  confidence: number;
}

export interface EntityProvenanceUpdate {
  entity_id: string;
  scene_id: string;
  start_idx: number;
  end_idx: number;
  confidence: number;
}

// Story structure types
export interface StoryNode {
  id: string;
  repo_id: string;
  kind: string; // 'epic' or 'chapter'
  title: string;
  parent_id?: string;
  order_idx: number;
  created_at: string;
}

export interface StoryNodeCreate {
  repo_id: string;
  kind: string;
  title: string;
  parent_id?: string;
  order_idx?: number;
}

export interface StoryNodeUpdate {
  title: string;
  order_idx?: number;
}

export interface Scene {
  id: string;
  node_id: string;
  title: string;
  order_idx: number;
  created_at: string;
}

export interface SceneCreate {
  title: string;
  order_idx?: number;
}

export interface SceneUpdate {
  title: string;
  order_idx?: number;
}

// Branch types
export interface Branch {
  id: string;
  repo_id: string;
  name: string;
  created_at: string;
}

export interface BranchCreate {
  repo_id: string;
  name: string;
  from_branch?: string;
}

export interface BranchUpdate {
  name: string;
}

// Commit types
export interface Commit {
  id: string;
  repo_id: string;
  branch_id: string;
  message: string;
  author: string;
  created_at: string;
}

export interface CommitCreate {
  repo_id: string;
  branch_id: string;
  message: string;
  author?: string;
}

// Scene Version types
export interface SceneVersion {
  id: string;
  scene_id: string;
  branch_id: string;
  parent_version_id?: string;
  content_html: string;
  meta: Record<string, any>;
  created_at: string;
}

export interface SceneVersionCreate {
  scene_id: string;
  branch_id: string;
  parent_version_id?: string;
  content_html: string;
  meta?: Record<string, any>;
}

// Legacy types for backward compatibility
export interface ExtractionResult {
  characters: Entity[];
  places: Entity[];
  events: Entity[];
  objects: Entity[];
  relationships: Relationship[];
}

export interface SceneGenerateRequest {
  pov: string;
  location: string;
  keywords: string;
}
