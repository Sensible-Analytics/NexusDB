export interface NodeDto {
  id: number;
  label: string;
}

export interface EdgeDto {
  id: number;
  label: string;
  from: number;
  to: number;
}

export interface DbStats {
  node_count: number;
  edge_count: number;
}

export interface SchemaInfo {
  node_labels: string[];
  edge_labels: string[];
  node_counts: Record<string, number>;
  edge_counts: Record<string, number>;
  total_nodes: number;
  total_edges: number;
}

export interface NqlResult {
  success: boolean;
  message: string;
  data: any | null;
}

export interface GraphNode {
  id: number;
  label: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: number;
  target: number;
  label: string;
}

export interface OllamaModelInfo {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaStatus {
  available: boolean;
  url: string;
  version: string | null;
  models: OllamaModelInfo[];
}

export interface PullProgressResult {
  status: string;
  percent: number;
}

export interface EmbeddingRequest {
  model: string;
  texts: string[];
}

export interface EmbeddingResult {
  embeddings: number[][];
}

export interface NLToSensibleQLRequest {
  query: string;
  schema_info: string | null;
  db_name: string;
}

export interface NLToSensibleQLResult {
  sensibleql: string;
  explanation: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface ExtractedEntity {
  subject: string;
  predicate: string;
  object: string;
}

export interface IngestionResult {
  chunk_count: number;
  entity_count: number;
  document_id: string;
}
