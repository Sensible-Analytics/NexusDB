import { createSignal } from "solid-js";
import type { NodeDto, EdgeDto, SchemaInfo } from "../types";

export const [activeDb, setActiveDb] = createSignal<string | null>(null);
export const [databases, setDatabases] = createSignal<string[]>([]);
export const [nodes, setNodes] = createSignal<NodeDto[]>([]);
export const [edges, setEdges] = createSignal<EdgeDto[]>([]);
export const [selectedNode, setSelectedNode] = createSignal<NodeDto | null>(null);
export const [selectedEdge, setSelectedEdge] = createSignal<EdgeDto | null>(null);
export const [schema, setSchema] = createSignal<SchemaInfo | null>(null);
export const [isLoading, setIsLoading] = createSignal(false);
export const [error, setError] = createSignal<string | null>(null);
export const [activeView, setActiveView] = createSignal<"home" | "graph" | "chat" | "report" | "nodes" | "edges" | "schema" | "nql">("home");

// Chat state
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  data?: any;
  timestamp: number;
}
export const [chatMessages, setChatMessages] = createSignal<ChatMessage[]>([]);
export const [isChatLoading, setIsChatLoading] = createSignal(false);

export interface ChatContext {
  lastQuery: string;
  lastNql: string;
  lastResultType: "overview" | "items" | "connections" | "count" | "relationships" | "most_connected" | "error";
  lastEntityTypes?: string[];
  lastItemCount?: number;
  lastEdgeCount?: number;
}
export const [chatContext, setChatContext] = createSignal<ChatContext | null>(null);

export interface QueryResult {
  nql: string;
  data: any | null;
  nodes: number[];
  edges: number[];
}
export const [lastQueryResult, setLastQueryResult] = createSignal<QueryResult | null>(null);
