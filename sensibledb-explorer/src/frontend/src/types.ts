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
