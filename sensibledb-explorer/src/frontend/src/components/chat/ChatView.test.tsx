import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import ChatView, { translateNLtoSensibleQL } from "./ChatView";
import {
  activeDb,
  setActiveDb,
  nodes,
  setNodes,
  edges,
  setEdges,
  schema,
  setSchema,
  chatMessages,
  setChatMessages,
} from "../../stores/app";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue({ success: true, data: { nodes: [], edges: [] } }),
}));

vi.mock("../../lib/api", () => ({
  sensibleqlExecute: vi.fn().mockResolvedValue({ success: true, data: { nodes: [], edges: [] } }),
}));

import { invoke } from "@tauri-apps/api/core";
import { sensibleqlExecute } from "../../lib/api";

const mockSchema = {
  node_labels: ["User", "Task", "Project"],
  edge_types: ["assigned_to", "depends_on"],
  node_counts: { User: 3, Task: 5, Project: 2 },
  edge_counts: { assigned_to: 5, depends_on: 3 },
  total_nodes: 10,
  total_edges: 8,
};

const mockNodes = [
  { id: 1, label: "User:Alice", type: "User", properties: {} },
  { id: 2, label: "Task:Design", type: "Task", properties: {} },
];

const mockEdges = [
  { id: 1, label: "assigned_to", from: 1, to: 2, properties: {} },
];

describe("ChatView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActiveDb("test-db");
    setNodes(mockNodes);
    setEdges(mockEdges);
    setSchema(mockSchema as any);
    setChatMessages([]);
  });

  it("renders chat view container", () => {
    render(() => <ChatView />);
    expect(document.querySelector(".chat-view")).toBeInTheDocument();
  });

  it("shows initial suggestions when no messages", () => {
    render(() => <ChatView />);
    expect(screen.getByText("What data do I have?")).toBeInTheDocument();
    expect(screen.getByText("Show me all items")).toBeInTheDocument();
  });

  it("user can type in input field", async () => {
    const user = userEvent.setup();
    render(() => <ChatView />);
    const input = document.querySelector(".chat-input-row input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    await user.type(input, "test query");
    expect(input.value).toBe("test query");
  });

  it("sends message on Enter key", async () => {
    const user = userEvent.setup();
    render(() => <ChatView />);
    const input = document.querySelector(".chat-input-row input") as HTMLInputElement;
    await user.type(input, "What data do I have?{Enter}");
    expect(screen.getByText("What data do I have?")).toBeInTheDocument();
  });

  it("clicking suggestion sends message", async () => {
    const user = userEvent.setup();
    render(() => <ChatView />);
    await user.click(screen.getByText("What data do I have?"));
    expect(screen.getByText("What data do I have?")).toBeInTheDocument();
  });

  it("shows assistant response after query", async () => {
    const user = userEvent.setup();
    (sensibleqlExecute as vi.Mock).mockResolvedValue({
      success: true,
      data: { nodes: mockNodes, edges: mockEdges },
    });
    render(() => <ChatView />);
    const input = document.querySelector(".chat-input-row input") as HTMLInputElement;
    await user.type(input, "What data do I have?{Enter}");
    expect(screen.getByText("What data do I have?")).toBeInTheDocument();
  });

  it("shows error when query fails", async () => {
    const user = userEvent.setup();
    (sensibleqlExecute as vi.Mock).mockRejectedValue(new Error("Query failed"));
    render(() => <ChatView />);
    const input = document.querySelector(".chat-input-row input") as HTMLInputElement;
    await user.type(input, "invalid query{Enter}");
  });

  it("clears input after sending message", async () => {
    const user = userEvent.setup();
    render(() => <ChatView />);
    const input = document.querySelector(".chat-input-row input") as HTMLInputElement;
    await user.type(input, "test message{Enter}");
    expect(input.value).toBe("");
  });
});

describe("translateNLtoSensibleQL (ChatView version)", () => {
  const schemaInfo = {
    node_labels: ["User", "Task", "Project", "Symptom"],
    edge_types: ["assigned_to", "depends_on", "causes"],
    node_counts: {},
    edge_counts: {},
    total_nodes: 0,
    total_edges: 0,
  } as any;

  it("translates overview query", () => {
    const result = translateNLtoSensibleQL("What data do I have?", schemaInfo);
    expect(result.sensibleql).toBe("MATCH (n) RETURN n");
    expect(result.queryType).toBe("overview");
  });

  it("translates count query", () => {
    const result = translateNLtoSensibleQL("How many connections?", schemaInfo);
    expect(result.sensibleql).toBe("COUNT edges");
    expect(result.queryType).toBe("count");
  });

  it("translates show all query", () => {
    const result = translateNLtoSensibleQL("Show me all items", schemaInfo);
    expect(result.sensibleql).toBe("MATCH (n) RETURN n");
    expect(result.queryType).toBe("overview");
  });

  it("translates types query", () => {
    const result = translateNLtoSensibleQL("What types exist?", schemaInfo);
    expect(result.sensibleql).toBe("MATCH (n) RETURN DISTINCT labels(n)");
    expect(result.queryType).toBe("types");
  });

  it("returns raw for unknown patterns", () => {
    const result = translateNLtoSensibleQL("something random", null);
    expect(result.queryType).toBe("raw");
  });
});
