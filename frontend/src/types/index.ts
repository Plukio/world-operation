export interface Entity {
  name: string;
  description: string;
  spans: Array<{
    start_idx: number;
    end_idx: number;
  }>;
  confidence: number;
}

export interface Relationship {
  source: string;
  target: string;
  relation_type: string;
  confidence: number;
}

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

export interface Scene {
  id: string;
  text: string;
  title: string;
  pov_entity_id?: string;
  location_entity_id?: string;
  created_at: string;
  updated_at: string;
}
