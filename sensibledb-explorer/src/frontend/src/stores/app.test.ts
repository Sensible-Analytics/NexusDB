import { test, expect, beforeEach, describe } from "vitest";
import {
  activeDb,
  setActiveDb,
  databases,
  setDatabases,
  nodes,
  setNodes,
  edges,
  setEdges,
  schema,
  setSchema,
  selectedNode,
  setSelectedNode,
  selectedEdge,
  setSelectedEdge,
  activeView,
  setActiveView,
  chatMessages,
  setChatMessages,
  isChatLoading,
  setIsChatLoading,
  chatContext,
  setChatContext,
  lastQueryResult,
  setLastQueryResult,
  isLoading,
  setIsLoading,
  error,
  setError,
  type ChatMessage,
  type ChatContext,
  type QueryResult,
} from "./app";

describe("app signals", () => {
  beforeEach(() => {
    setActiveDb(null);
    setDatabases([]);
    setNodes([]);
    setEdges([]);
    setSchema(null);
    setSelectedNode(null);
    setSelectedEdge(null);
    setActiveView("home");
    setChatMessages([]);
    setIsChatLoading(false);
    setChatContext(null);
    setLastQueryResult(null);
    setIsLoading(false);
    setError(null);
  });

  describe("activeDb", () => {
    test("initial value is null", () => {
      expect(activeDb()).toBeNull();
    });

    test("setActiveDb updates activeDb", () => {
      setActiveDb("test-db");
      expect(activeDb()).toBe("test-db");
    });

    test("setActiveDb can set to null", () => {
      setActiveDb("test-db");
      setActiveDb(null);
      expect(activeDb()).toBeNull();
    });
  });

  describe("databases", () => {
    test("initial value is empty array", () => {
      expect(databases()).toEqual([]);
    });

    test("setDatabases updates databases", () => {
      setDatabases(["db1", "db2"]);
      expect(databases()).toEqual(["db1", "db2"]);
    });
  });

  describe("nodes", () => {
    test("initial value is empty array", () => {
      expect(nodes()).toEqual([]);
    });

    test("setNodes updates nodes", () => {
      setNodes([{ id: 1, label: "Node1" }]);
      expect(nodes()).toEqual([{ id: 1, label: "Node1" }]);
    });
  });

  describe("edges", () => {
    test("initial value is empty array", () => {
      expect(edges()).toEqual([]);
    });

    test("setEdges updates edges", () => {
      setEdges([{ id: 1, label: "Edge1", from: 1, to: 2 }]);
      expect(edges()).toEqual([{ id: 1, label: "Edge1", from: 1, to: 2 }]);
    });
  });

  describe("schema", () => {
    test("initial value is null", () => {
      expect(schema()).toBeNull();
    });

    test("setSchema updates schema", () => {
      const testSchema = {
        node_labels: ["User", "Post"],
        edge_labels: ["FOLLOWS", "WROTE"],
        node_counts: { User: 100, Post: 50 },
        edge_counts: { FOLLOWS: 200 },
        total_nodes: 150,
        total_edges: 200,
      };
      setSchema(testSchema);
      expect(schema()).toEqual(testSchema);
    });
  });

  describe("selectedNode", () => {
    test("initial value is null", () => {
      expect(selectedNode()).toBeNull();
    });

    test("setSelectedNode updates selectedNode", () => {
      const node = { id: 1, label: "TestNode" };
      setSelectedNode(node);
      expect(selectedNode()).toEqual(node);
    });
  });

  describe("selectedEdge", () => {
    test("initial value is null", () => {
      expect(selectedEdge()).toBeNull();
    });

    test("setSelectedEdge updates selectedEdge", () => {
      const edge = { id: 1, label: "TestEdge", from: 1, to: 2 };
      setSelectedEdge(edge);
      expect(selectedEdge()).toEqual(edge);
    });
  });

  describe("activeView", () => {
    test("initial value is home", () => {
      expect(activeView()).toBe("home");
    });

    test("setActiveView updates to graph", () => {
      setActiveView("graph");
      expect(activeView()).toBe("graph");
    });

    test("setActiveView updates to chat", () => {
      setActiveView("chat");
      expect(activeView()).toBe("chat");
    });

    test("setActiveView updates to report", () => {
      setActiveView("report");
      expect(activeView()).toBe("report");
    });

    test("setActiveView updates to nodes", () => {
      setActiveView("nodes");
      expect(activeView()).toBe("nodes");
    });

    test("setActiveView updates to edges", () => {
      setActiveView("edges");
      expect(activeView()).toBe("edges");
    });

    test("setActiveView updates to schema", () => {
      setActiveView("schema");
      expect(activeView()).toBe("schema");
    });

    test("setActiveView updates to sensibleql", () => {
      setActiveView("sensibleql");
      expect(activeView()).toBe("sensibleql");
    });

    test("setActiveView can switch back to home", () => {
      setActiveView("graph");
      setActiveView("home");
      expect(activeView()).toBe("home");
    });
  });

  describe("isLoading and error", () => {
    test("initial values", () => {
      expect(isLoading()).toBe(false);
      expect(error()).toBeNull();
    });

    test("setIsLoading updates", () => {
      setIsLoading(true);
      expect(isLoading()).toBe(true);
      setIsLoading(false);
      expect(isLoading()).toBe(false);
    });

    test("setError updates", () => {
      setError("Something went wrong");
      expect(error()).toBe("Something went wrong");
      setError(null);
      expect(error()).toBeNull();
    });
  });
});

describe("chat signals", () => {
  beforeEach(() => {
    setChatMessages([]);
    setIsChatLoading(false);
    setChatContext(null);
    setLastQueryResult(null);
  });

  describe("chatMessages", () => {
    test("initial value is empty array", () => {
      expect(chatMessages()).toEqual([]);
    });

    test("setChatMessages updates with user message", () => {
      const messages: ChatMessage[] = [
        { role: "user", content: "Hello", timestamp: Date.now() },
      ];
      setChatMessages(messages);
      expect(chatMessages()).toEqual(messages);
    });

    test("setChatMessages updates with assistant message", () => {
      const messages: ChatMessage[] = [
        { role: "user", content: "Hello", timestamp: Date.now() },
        { role: "assistant", content: "Hi there!", timestamp: Date.now() },
      ];
      setChatMessages(messages);
      expect(chatMessages()).toHaveLength(2);
      expect(chatMessages()[1].role).toBe("assistant");
    });

    test("setChatMessages preserves message with data", () => {
      const messages: ChatMessage[] = [
        { role: "user", content: "Query", timestamp: Date.now(), data: { nodes: [1, 2] } },
      ];
      setChatMessages(messages);
      expect(chatMessages()[0].data).toEqual({ nodes: [1, 2] });
    });
  });

  describe("isChatLoading", () => {
    test("initial value is false", () => {
      expect(isChatLoading()).toBe(false);
    });

    test("setIsChatLoading updates", () => {
      setIsChatLoading(true);
      expect(isChatLoading()).toBe(true);
      setIsChatLoading(false);
      expect(isChatLoading()).toBe(false);
    });
  });

  describe("chatContext", () => {
    test("initial value is null", () => {
      expect(chatContext()).toBeNull();
    });

    test("setChatContext updates", () => {
      const context: ChatContext = {
        lastQuery: "show users",
        lastNql: "N::User",
        lastResultType: "items",
        lastEntityTypes: ["User"],
        lastItemCount: 10,
        lastEdgeCount: 5,
      };
      setChatContext(context);
      expect(chatContext()).toEqual(context);
    });

    test("chatContext can be nullified", () => {
      const context: ChatContext = {
        lastQuery: "show users",
        lastNql: "N::User",
        lastResultType: "items",
      };
      setChatContext(context);
      setChatContext(null);
      expect(chatContext()).toBeNull();
    });
  });

  describe("lastQueryResult", () => {
    test("initial value is null", () => {
      expect(lastQueryResult()).toBeNull();
    });

    test("setLastQueryResult updates with query result", () => {
      const result: QueryResult = {
        sensibleql: "N::User",
        data: [{ id: 1, label: "User1" }],
        nodes: [1],
        edges: [],
      };
      setLastQueryResult(result);
      expect(lastQueryResult()).toEqual(result);
    });

    test("setLastQueryResult can store error result", () => {
      const result: QueryResult = {
        sensibleql: "INVALID",
        data: null,
        nodes: [],
        edges: [],
      };
      setLastQueryResult(result);
      expect(lastQueryResult()?.data).toBeNull();
    });
  });
});

describe("database switching", () => {
  beforeEach(() => {
    setActiveDb(null);
    setDatabases([]);
  });

  test("setActiveDb changes activeDb signal", () => {
    setDatabases(["db1", "db2", "db3"]);
    setActiveDb("db2");
    expect(activeDb()).toBe("db2");
  });

  test("switching between databases works", () => {
    setDatabases(["db1", "db2"]);
    setActiveDb("db1");
    expect(activeDb()).toBe("db1");
    setActiveDb("db2");
    expect(activeDb()).toBe("db2");
    setActiveDb(null);
    expect(activeDb()).toBeNull();
  });
});

describe("node selection", () => {
  beforeEach(() => {
    setSelectedNode(null);
    setNodes([]);
  });

  test("setSelectedNode updates selectedNode signal", () => {
    const node = { id: 42, label: "SelectedNode" };
    setNodes([{ id: 1, label: "Node1" }, node]);
    setSelectedNode(node);
    expect(selectedNode()).toEqual(node);
  });

  test("setSelectedNode can be cleared", () => {
    const node = { id: 1, label: "Node" };
    setSelectedNode(node);
    setSelectedNode(null);
    expect(selectedNode()).toBeNull();
  });
});

describe("query result storage", () => {
  beforeEach(() => {
    setLastQueryResult(null);
  });

  test("setLastQueryResult updates lastQueryResult signal", () => {
    const result: QueryResult = {
      sensibleql: "N::User -> r:FOLLOWS -> N::User",
      data: [{ id: 1 }, { id: 2 }],
      nodes: [1, 2],
      edges: [1],
    };
    setLastQueryResult(result);
    expect(lastQueryResult()).toEqual(result);
    expect(lastQueryResult()?.sensibleql).toBe("N::User -> r:FOLLOWS -> N::User");
    expect(lastQueryResult()?.nodes).toHaveLength(2);
  });
});
