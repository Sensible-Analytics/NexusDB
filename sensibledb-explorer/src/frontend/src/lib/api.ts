import { invoke } from "@tauri-apps/api/core";
import type { NodeDto, EdgeDto, SchemaInfo, SensibleqlResult, OllamaStatus, PullProgressResult, EmbeddingRequest, EmbeddingResult, NLToSensibleQLRequest, NLToSensibleQLResult, IngestionResult, DocumentChunk, ExtractedEntity } from "../types";

export const logError = (msg: string) => invoke("log_error", { msg });

export const dbCreate = (name: string, path: string) => invoke<string>("db_create", { name, path });
export const dbOpen = (name: string, path: string) => invoke<string>("db_open", { name, path });
export const dbClose = (name: string) => invoke<string>("db_close", { name });
export const dbList = () => invoke<string[]>("db_list");
export const dbStats = (name: string) => invoke<{ node_count: number; edge_count: number }>("db_stats", { name });

export const nodeCreate = (db_name: string, id: number, label: string) =>
  invoke<NodeDto>("node_create", { req: { db_name, id, label } });
export const nodeGet = (db_name: string, id: number) =>
  invoke<NodeDto | null>("node_get", { db_name, id });
export const nodeUpdate = (db_name: string, id: number, label: string) =>
  invoke<NodeDto>("node_update", { db_name, id, label });
export const nodeDelete = (db_name: string, id: number) =>
  invoke<string>("node_delete", { db_name, id });
export const nodeList = (db_name: string) =>
  invoke<NodeDto[]>("node_list", { dbName: db_name });

export const edgeCreate = (db_name: string, id: number, label: string, from_node: number, to_node: number) =>
  invoke<EdgeDto>("edge_create", { req: { db_name, id, label, from_node, to_node } });
export const edgeGet = (db_name: string, id: number) =>
  invoke<EdgeDto | null>("edge_get", { db_name, id });
export const edgeUpdate = (db_name: string, id: number, label: string, from_node: number, to_node: number) =>
  invoke<EdgeDto>("edge_update", { db_name, id, label, from_node, to_node });
export const edgeDelete = (db_name: string, id: number) =>
  invoke<string>("edge_delete", { db_name, id });
export const edgeList = (db_name: string) =>
  invoke<EdgeDto[]>("edge_list", { dbName: db_name });

export const schemaGet = (db_name: string) =>
  invoke<SchemaInfo>("schema_get", { dbName: db_name });

export const sensibleqlExecute = (db_name: string, query: string) =>
  invoke<SensibleqlResult>("sensibleql_execute", { dbName: db_name, query });

export const ollamaCheckStatus = (ollamaUrl: string | null) =>
  invoke<OllamaStatus>("ollama_check_status", { ollamaUrl });
export const ollamaPullModel = (model: string, ollamaUrl: string | null) =>
  invoke<PullProgressResult[]>("ollama_pull_model", { model, ollamaUrl });
export const generateEmbeddings = (request: EmbeddingRequest, ollamaUrl: string | null) =>
  invoke<EmbeddingResult>("generate_embeddings", { request, ollamaUrl });
export const translateNLtoSensibleQL = (request: NLToSensibleQLRequest, model: string | null, ollamaUrl: string | null) =>
  invoke<NLToSensibleQLResult>("translate_nl_to_sensibleql", { request, model, ollamaUrl });

export const ingestDocument = (filePath: string, dbName: string, ollamaUrl: string | null, embeddingModel: string | null) =>
  invoke<IngestionResult>("ingest_document", { filePath, dbName, ollamaUrl, embeddingModel });
export const chunkText = (content: string, fileType: string) =>
  invoke<DocumentChunk[]>("chunk_text", { content, fileType });
export const extractEntitiesFromChunks = (chunks: string[], model: string | null, ollamaUrl: string | null) =>
  invoke<ExtractedEntity[]>("extract_entities_from_chunks", { chunks, model, ollamaUrl });
