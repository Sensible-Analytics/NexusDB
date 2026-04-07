import { test, expect, vi, beforeEach, describe } from "vitest";
import { mockIPC, clearMocks } from "@tauri-apps/api/mocks";
import * as api from "./api";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";

describe("API layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMocks();
  });

  const mockInvoke = invoke as ReturnType<typeof vi.fn>;

  describe("database commands", () => {
    test("dbCreate calls invoke with correct command and args", async () => {
      mockInvoke.mockResolvedValue("db_created");
      const result = await api.dbCreate("test_db", "/path/to/db");
      expect(mockInvoke).toHaveBeenCalledWith("db_create", { name: "test_db", path: "/path/to/db" });
      expect(result).toBe("db_created");
    });

    test("dbOpen calls invoke with correct command and args", async () => {
      mockInvoke.mockResolvedValue("db_opened");
      const result = await api.dbOpen("test_db", "/path/to/db");
      expect(mockInvoke).toHaveBeenCalledWith("db_open", { name: "test_db", path: "/path/to/db" });
      expect(result).toBe("db_opened");
    });

    test("dbClose calls invoke with correct command and args", async () => {
      mockInvoke.mockResolvedValue("db_closed");
      const result = await api.dbClose("test_db");
      expect(mockInvoke).toHaveBeenCalledWith("db_close", { name: "test_db" });
      expect(result).toBe("db_closed");
    });

    test("dbList calls invoke with correct command", async () => {
      mockInvoke.mockResolvedValue(["db1", "db2"]);
      const result = await api.dbList();
      expect(mockInvoke).toHaveBeenCalledWith("db_list");
      expect(result).toEqual(["db1", "db2"]);
    });

    test("dbStats calls invoke with correct command and args", async () => {
      mockInvoke.mockResolvedValue({ node_count: 10, edge_count: 5 });
      const result = await api.dbStats("test_db");
      expect(mockInvoke).toHaveBeenCalledWith("db_stats", { name: "test_db" });
      expect(result).toEqual({ node_count: 10, edge_count: 5 });
    });
  });

  describe("node commands", () => {
    test("nodeCreate calls invoke with correct command and args", async () => {
      const mockNode = { id: 1, label: "User" };
      mockInvoke.mockResolvedValue(mockNode);
      const result = await api.nodeCreate("test_db", 1, "User");
      expect(mockInvoke).toHaveBeenCalledWith("node_create", { req: { db_name: "test_db", id: 1, label: "User" } });
      expect(result).toEqual(mockNode);
    });

    test("nodeGet calls invoke with correct command and args", async () => {
      const mockNode = { id: 1, label: "User" };
      mockInvoke.mockResolvedValue(mockNode);
      const result = await api.nodeGet("test_db", 1);
      expect(mockInvoke).toHaveBeenCalledWith("node_get", { db_name: "test_db", id: 1 });
      expect(result).toEqual(mockNode);
    });

    test("nodeGet returns null when node not found", async () => {
      mockInvoke.mockResolvedValue(null);
      const result = await api.nodeGet("test_db", 999);
      expect(mockInvoke).toHaveBeenCalledWith("node_get", { db_name: "test_db", id: 999 });
      expect(result).toBeNull();
    });

    test("nodeUpdate calls invoke with correct command and args", async () => {
      const mockNode = { id: 1, label: "UpdatedUser" };
      mockInvoke.mockResolvedValue(mockNode);
      const result = await api.nodeUpdate("test_db", 1, "UpdatedUser");
      expect(mockInvoke).toHaveBeenCalledWith("node_update", { db_name: "test_db", id: 1, label: "UpdatedUser" });
      expect(result).toEqual(mockNode);
    });

    test("nodeDelete calls invoke with correct command and args", async () => {
      mockInvoke.mockResolvedValue("node_deleted");
      const result = await api.nodeDelete("test_db", 1);
      expect(mockInvoke).toHaveBeenCalledWith("node_delete", { db_name: "test_db", id: 1 });
      expect(result).toBe("node_deleted");
    });

    test("nodeList calls invoke with correct command and args", async () => {
      const mockNodes = [
        { id: 1, label: "User" },
        { id: 2, label: "Post" },
      ];
      mockInvoke.mockResolvedValue(mockNodes);
      const result = await api.nodeList("test_db");
      expect(mockInvoke).toHaveBeenCalledWith("node_list", { dbName: "test_db" });
      expect(result).toEqual(mockNodes);
    });
  });

  describe("edge commands", () => {
    test("edgeCreate calls invoke with correct command and args", async () => {
      const mockEdge = { id: 1, label: "FOLLOWS", from: 1, to: 2 };
      mockInvoke.mockResolvedValue(mockEdge);
      const result = await api.edgeCreate("test_db", 1, "FOLLOWS", 1, 2);
      expect(mockInvoke).toHaveBeenCalledWith("edge_create", { req: { db_name: "test_db", id: 1, label: "FOLLOWS", from_node: 1, to_node: 2 } });
      expect(result).toEqual(mockEdge);
    });

    test("edgeGet calls invoke with correct command and args", async () => {
      const mockEdge = { id: 1, label: "FOLLOWS", from: 1, to: 2 };
      mockInvoke.mockResolvedValue(mockEdge);
      const result = await api.edgeGet("test_db", 1);
      expect(mockInvoke).toHaveBeenCalledWith("edge_get", { db_name: "test_db", id: 1 });
      expect(result).toEqual(mockEdge);
    });

    test("edgeGet returns null when edge not found", async () => {
      mockInvoke.mockResolvedValue(null);
      const result = await api.edgeGet("test_db", 999);
      expect(mockInvoke).toHaveBeenCalledWith("edge_get", { db_name: "test_db", id: 999 });
      expect(result).toBeNull();
    });

    test("edgeUpdate calls invoke with correct command and args", async () => {
      const mockEdge = { id: 1, label: "LIKES", from: 1, to: 2 };
      mockInvoke.mockResolvedValue(mockEdge);
      const result = await api.edgeUpdate("test_db", 1, "LIKES", 1, 2);
      expect(mockInvoke).toHaveBeenCalledWith("edge_update", { db_name: "test_db", id: 1, label: "LIKES", from_node: 1, to_node: 2 });
      expect(result).toEqual(mockEdge);
    });

    test("edgeDelete calls invoke with correct command and args", async () => {
      mockInvoke.mockResolvedValue("edge_deleted");
      const result = await api.edgeDelete("test_db", 1);
      expect(mockInvoke).toHaveBeenCalledWith("edge_delete", { db_name: "test_db", id: 1 });
      expect(result).toBe("edge_deleted");
    });

    test("edgeList calls invoke with correct command and args", async () => {
      const mockEdges = [
        { id: 1, label: "FOLLOWS", from: 1, to: 2 },
        { id: 2, label: "LIKES", from: 1, to: 3 },
      ];
      mockInvoke.mockResolvedValue(mockEdges);
      const result = await api.edgeList("test_db");
      expect(mockInvoke).toHaveBeenCalledWith("edge_list", { dbName: "test_db" });
      expect(result).toEqual(mockEdges);
    });
  });

  describe("schema commands", () => {
    test("schemaGet calls invoke with correct command and args", async () => {
      const mockSchema = {
        node_labels: ["User", "Post"],
        edge_labels: ["FOLLOWS"],
        node_counts: { User: 10, Post: 5 },
        edge_counts: { FOLLOWS: 8 },
        total_nodes: 15,
        total_edges: 8,
      };
      mockInvoke.mockResolvedValue(mockSchema);
      const result = await api.schemaGet("test_db");
      expect(mockInvoke).toHaveBeenCalledWith("schema_get", { dbName: "test_db" });
      expect(result).toEqual(mockSchema);
    });
  });

  describe("sensibleql commands", () => {
    test("sensibleqlExecute calls invoke with correct command and args", async () => {
      const mockResult = {
        sensibleql: "N::User",
        data: [{ id: 1, label: "User" }],
        nodes: [1],
        edges: [],
      };
      mockInvoke.mockResolvedValue(mockResult);
      const result = await api.sensibleqlExecute("test_db", "N::User");
      expect(mockInvoke).toHaveBeenCalledWith("sensibleql_execute", { dbName: "test_db", query: "N::User" });
      expect(result).toEqual(mockResult);
    });
  });

  describe("ollama commands", () => {
    test("ollamaCheckStatus calls invoke with correct command and args", async () => {
      const mockStatus = {
        available: true,
        url: "http://localhost:11434",
        version: "0.1.0",
        models: [],
      };
      mockInvoke.mockResolvedValue(mockStatus);
      const result = await api.ollamaCheckStatus("http://localhost:11434");
      expect(mockInvoke).toHaveBeenCalledWith("ollama_check_status", { ollamaUrl: "http://localhost:11434" });
      expect(result).toEqual(mockStatus);
    });

    test("ollamaCheckStatus with null url", async () => {
      const mockStatus = {
        available: false,
        url: "",
        version: null,
        models: [],
      };
      mockInvoke.mockResolvedValue(mockStatus);
      const result = await api.ollamaCheckStatus(null);
      expect(mockInvoke).toHaveBeenCalledWith("ollama_check_status", { ollamaUrl: null });
      expect(result).toEqual(mockStatus);
    });

    test("ollamaPullModel calls invoke with correct command and args", async () => {
      const mockProgress = [
        { status: "downloading", percent: 0 },
        { status: "downloading", percent: 50 },
        { status: "success", percent: 100 },
      ];
      mockInvoke.mockResolvedValue(mockProgress);
      const result = await api.ollamaPullModel("llama2", "http://localhost:11434");
      expect(mockInvoke).toHaveBeenCalledWith("ollama_pull_model", { model: "llama2", ollamaUrl: "http://localhost:11434" });
      expect(result).toEqual(mockProgress);
    });

    test("generateEmbeddings calls invoke with correct command and args", async () => {
      const mockResult = {
        embeddings: [[0.1, 0.2, 0.3]],
      };
      mockInvoke.mockResolvedValue(mockResult);
      const request = { model: "llama2", texts: ["hello world"] };
      const result = await api.generateEmbeddings(request, "http://localhost:11434");
      expect(mockInvoke).toHaveBeenCalledWith("generate_embeddings", { request, ollamaUrl: "http://localhost:11434" });
      expect(result).toEqual(mockResult);
    });

    test("translateNLtoSensibleQL calls invoke with correct command and args", async () => {
      const mockResult = {
        sensibleql: "N::User",
        explanation: "This query retrieves all User nodes",
      };
      mockInvoke.mockResolvedValue(mockResult);
      const request = { query: "show me all users", schema_info: null, db_name: "test_db" };
      const result = await api.translateNLtoSensibleQL(request, "llama2", "http://localhost:11434");
      expect(mockInvoke).toHaveBeenCalledWith("translate_nl_to_sensibleql", { request, model: "llama2", ollamaUrl: "http://localhost:11434" });
      expect(result).toEqual(mockResult);
    });
  });

  describe("ingestion commands", () => {
    test("ingestDocument calls invoke with correct command and args", async () => {
      const mockResult = {
        chunk_count: 10,
        entity_count: 5,
        document_id: "doc_123",
      };
      mockInvoke.mockResolvedValue(mockResult);
      const result = await api.ingestDocument("/path/to/doc.pdf", "test_db", "http://localhost:11434", "llama2");
      expect(mockInvoke).toHaveBeenCalledWith("ingest_document", { filePath: "/path/to/doc.pdf", dbName: "test_db", ollamaUrl: "http://localhost:11434", embeddingModel: "llama2" });
      expect(result).toEqual(mockResult);
    });

    test("chunkText calls invoke with correct command and args", async () => {
      const mockChunks = [
        { id: "chunk_1", content: "First chunk", metadata: {} },
        { id: "chunk_2", content: "Second chunk", metadata: {} },
      ];
      mockInvoke.mockResolvedValue(mockChunks);
      const result = await api.chunkText("Some long text content", "pdf");
      expect(mockInvoke).toHaveBeenCalledWith("chunk_text", { content: "Some long text content", fileType: "pdf" });
      expect(result).toEqual(mockChunks);
    });

    test("extractEntitiesFromChunks calls invoke with correct command and args", async () => {
      const mockEntities = [
        { subject: "John", predicate: "knows", object: "Jane" },
      ];
      mockInvoke.mockResolvedValue(mockEntities);
      const chunks = ["John knows Jane", "Jane works at Acme"];
      const result = await api.extractEntitiesFromChunks(chunks, "llama2", "http://localhost:11434");
      expect(mockInvoke).toHaveBeenCalledWith("extract_entities_from_chunks", { chunks, model: "llama2", ollamaUrl: "http://localhost:11434" });
      expect(result).toEqual(mockEntities);
    });
  });

  describe("command verification", () => {
    test("all database commands use correct command names", async () => {
      mockInvoke.mockResolvedValue("result");
      await api.dbCreate("test", "/path");
      await api.dbOpen("test", "/path");
      await api.dbClose("test");
      await api.dbList();
      await api.dbStats("test");

      const calls = mockInvoke.mock.calls;
      expect(calls[0][0]).toBe("db_create");
      expect(calls[1][0]).toBe("db_open");
      expect(calls[2][0]).toBe("db_close");
      expect(calls[3][0]).toBe("db_list");
      expect(calls[4][0]).toBe("db_stats");
    });

    test("all node commands use correct command names", async () => {
      mockInvoke.mockResolvedValue({ id: 1, label: "Test" });
      await api.nodeCreate("test", 1, "Test");
      await api.nodeGet("test", 1);
      await api.nodeUpdate("test", 1, "Test");
      await api.nodeDelete("test", 1);
      await api.nodeList("test");

      const calls = mockInvoke.mock.calls;
      expect(calls[0][0]).toBe("node_create");
      expect(calls[1][0]).toBe("node_get");
      expect(calls[2][0]).toBe("node_update");
      expect(calls[3][0]).toBe("node_delete");
      expect(calls[4][0]).toBe("node_list");
    });

    test("all edge commands use correct command names", async () => {
      mockInvoke.mockResolvedValue({ id: 1, label: "Test", from: 1, to: 2 });
      await api.edgeCreate("test", 1, "Test", 1, 2);
      await api.edgeGet("test", 1);
      await api.edgeUpdate("test", 1, "Test", 1, 2);
      await api.edgeDelete("test", 1);
      await api.edgeList("test");

      const calls = mockInvoke.mock.calls;
      expect(calls[0][0]).toBe("edge_create");
      expect(calls[1][0]).toBe("edge_get");
      expect(calls[2][0]).toBe("edge_update");
      expect(calls[3][0]).toBe("edge_delete");
      expect(calls[4][0]).toBe("edge_list");
    });
  });
});
