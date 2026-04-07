import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./Sidebar";
import {
  setActiveView,
  setActiveDb,
  setDatabases,
  setNodes,
  setEdges,
  setSchema,
  activeView,
  activeDb,
  databases,
} from "../../stores/app";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("../../lib/api", () => ({
  nodeList: vi.fn().mockResolvedValue([]),
  edgeList: vi.fn().mockResolvedValue([]),
  schemaGet: vi.fn().mockResolvedValue({ node_labels: [], edge_labels: [], node_counts: {}, edge_counts: {}, total_nodes: 0, total_edges: 0 }),
}));

import { nodeList, edgeList, schemaGet } from "../../lib/api";

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActiveView("home");
    setActiveDb(null);
    setDatabases([]);
    setNodes([]);
    setEdges([]);
    setSchema(null);
    (invoke as vi.Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  describe("navigation items", () => {
    test("renders Home navigation item", () => {
      render(() => <Sidebar />);
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    test("renders Graph navigation item", () => {
      render(() => <Sidebar />);
      expect(screen.getByText("Graph")).toBeInTheDocument();
    });

    test("renders Chat navigation item", () => {
      render(() => <Sidebar />);
      expect(screen.getByText("Chat")).toBeInTheDocument();
    });

    test("renders Report navigation item", () => {
      render(() => <Sidebar />);
      expect(screen.getByText("Report")).toBeInTheDocument();
    });

    test("renders Items navigation item", () => {
      render(() => <Sidebar />);
      expect(screen.getByText("Items")).toBeInTheDocument();
    });

    test("renders Connections navigation item", () => {
      render(() => <Sidebar />);
      expect(screen.getByText("Connections")).toBeInTheDocument();
    });

    test("renders Structure navigation item", () => {
      render(() => <Sidebar />);
      expect(screen.getByText("Structure")).toBeInTheDocument();
    });

    test("renders SensibleQL Editor navigation item", () => {
      render(() => <Sidebar />);
      expect(screen.getByText("SensibleQL Editor")).toBeInTheDocument();
    });

    test("renders AI Models navigation item", () => {
      render(() => <Sidebar />);
      expect(screen.getAllByText("AI Models").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("active view highlighting", () => {
    test("highlights Home when activeView is home", () => {
      setActiveView("home");
      render(() => <Sidebar />);

      const homeButton = screen.getByText("Home").closest("button");
      expect(homeButton).toHaveClass("active");
    });

    test("highlights Graph when activeView is graph", () => {
      setActiveView("graph");
      render(() => <Sidebar />);

      const graphButton = screen.getByText("Graph").closest("button");
      expect(graphButton).toHaveClass("active");
    });

    test("highlights Chat when activeView is chat", () => {
      setActiveView("chat");
      render(() => <Sidebar />);

      const chatButton = screen.getByText("Chat").closest("button");
      expect(chatButton).toHaveClass("active");
    });

    test("highlights Report when activeView is report", () => {
      setActiveView("report");
      render(() => <Sidebar />);

      const reportButton = screen.getByText("Report").closest("button");
      expect(reportButton).toHaveClass("active");
    });

    test("highlights Items when activeView is nodes", () => {
      setActiveView("nodes");
      render(() => <Sidebar />);

      const itemsButton = screen.getByText("Items").closest("button");
      expect(itemsButton).toHaveClass("active");
    });

    test("highlights Connections when activeView is edges", () => {
      setActiveView("edges");
      render(() => <Sidebar />);

      const connectionsButton = screen.getByText("Connections").closest("button");
      expect(connectionsButton).toHaveClass("active");
    });

    test("highlights Structure when activeView is schema", () => {
      setActiveView("schema");
      render(() => <Sidebar />);

      const structureButton = screen.getByText("Structure").closest("button");
      expect(structureButton).toHaveClass("active");
    });

    test("highlights SensibleQL Editor when activeView is sensibleql", () => {
      setActiveView("sensibleql");
      render(() => <Sidebar />);

      const editorButton = screen.getByText("SensibleQL Editor").closest("button");
      expect(editorButton).toHaveClass("active");
    });

    test("highlights AI Models when activeView is models", () => {
      setActiveView("models");
      render(() => <Sidebar />);

      const modelsButtons = screen.getAllByText("AI Models");
      expect(modelsButtons.length).toBeGreaterThanOrEqual(1);
      expect(modelsButtons[0].closest("button")).toHaveClass("active");
    });
  });

  describe("clicking nav items", () => {
    test("clicking Home changes activeView to home", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.click(screen.getByText("Home"));
      expect(activeView()).toBe("home");
    });

    test("clicking Graph changes activeView to graph", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.click(screen.getByText("Graph"));
      expect(activeView()).toBe("graph");
    });

    test("clicking Chat changes activeView to chat", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.click(screen.getByText("Chat"));
      expect(activeView()).toBe("chat");
    });

    test("clicking Report changes activeView to report", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.click(screen.getByText("Report"));
      expect(activeView()).toBe("report");
    });

    test("clicking Items changes activeView to nodes", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.click(screen.getByText("Items"));
      expect(activeView()).toBe("nodes");
    });

    test("clicking Connections changes activeView to edges", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.click(screen.getByText("Connections"));
      expect(activeView()).toBe("edges");
    });

    test("clicking Structure changes activeView to schema", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.click(screen.getByText("Structure"));
      expect(activeView()).toBe("schema");
    });

    test("clicking SensibleQL Editor changes activeView to sensibleql", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.click(screen.getByText("SensibleQL Editor"));
      expect(activeView()).toBe("sensibleql");
    });

    test("clicking AI Models changes activeView to models", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      const modelsButtons = screen.getAllByText("AI Models");
      await user.click(modelsButtons[0]);
      expect(activeView()).toBe("models");
    });
  });

  describe("database list", () => {
    test("displays databases from store", () => {
      setDatabases(["test-db-1", "test-db-2"]);
      render(() => <Sidebar />);

      expect(screen.getByText("test-db-1")).toBeInTheDocument();
      expect(screen.getByText("test-db-2")).toBeInTheDocument();
    });

    test("displays empty database list when no databases", () => {
      setDatabases([]);
      render(() => <Sidebar />);

      const dbItems = document.querySelectorAll(".db-item");
      expect(dbItems.length).toBe(0);
    });

    test("highlights active database", () => {
      setDatabases(["db1", "db2"]);
      setActiveDb("db1");
      render(() => <Sidebar />);

      const db1Button = screen.getByText("db1").closest("button");
      expect(db1Button).toHaveClass("active");
    });

    test("clicking database changes activeDb", async () => {
      const user = userEvent.setup();
      setDatabases(["test-db"]);
      render(() => <Sidebar />);

      await user.click(screen.getByText("test-db"));
      expect(activeDb()).toBe("test-db");
    });

    test("loads db data when clicking database", async () => {
      const user = userEvent.setup();
      setDatabases(["test-db"]);
      render(() => <Sidebar />);

      await user.click(screen.getByText("test-db"));

      await waitFor(() => {
        expect(nodeList).toHaveBeenCalledWith("test-db");
        expect(edgeList).toHaveBeenCalledWith("test-db");
        expect(schemaGet).toHaveBeenCalledWith("test-db");
      }, { timeout: 3000 });
    });
  });

  describe("Connect Data button", () => {
    test("renders Connect Data button", () => {
      render(() => <Sidebar />);
      expect(screen.getByText("Connect Data")).toBeInTheDocument();
    });

    test("opens wizard when Connect Data is clicked", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.click(screen.getByText("Connect Data"));

      expect(screen.getByText("Connect Your Data")).toBeInTheDocument();
    });
  });

  describe("AI Models nav item with shortcut", () => {
    test("shows shortcut number 9 for AI Models", () => {
      render(() => <Sidebar />);

      const modelsButtons = screen.getAllByText("AI Models");
      const modelsButton = modelsButtons[0].closest("button");
      const shortcut = modelsButton?.querySelector(".nav-shortcut");
      expect(shortcut?.textContent).toBe("9");
    });
  });

  describe("keyboard shortcuts", () => {
    test("shortcut 1 navigates to Home", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.keyboard("1");
      expect(activeView()).toBe("home");
    });

    test("shortcut 2 navigates to Graph", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      const graphButton = screen.getByText("Graph").closest("button");
      await user.click(graphButton!);
      expect(activeView()).toBe("graph");
    });

    test("shortcut 3 navigates to Chat", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      const chatButton = screen.getByText("Chat").closest("button");
      await user.click(chatButton!);
      expect(activeView()).toBe("chat");
    });

    test("shortcut 4 navigates to Report", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      const reportButton = screen.getByText("Report").closest("button");
      await user.click(reportButton!);
      expect(activeView()).toBe("report");
    });

    test("shortcut 5 navigates to Items", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      const itemsButton = screen.getByText("Items").closest("button");
      await user.click(itemsButton!);
      expect(activeView()).toBe("nodes");
    });

    test("shortcut 6 navigates to Connections", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      const connectionsButton = screen.getByText("Connections").closest("button");
      await user.click(connectionsButton!);
      expect(activeView()).toBe("edges");
    });

    test("shortcut 7 navigates to Structure", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      const structureButton = screen.getByText("Structure").closest("button");
      await user.click(structureButton!);
      expect(activeView()).toBe("schema");
    });

    test("shortcut 8 navigates to SensibleQL Editor", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      const editorButton = screen.getByText("SensibleQL Editor").closest("button");
      await user.click(editorButton!);
      expect(activeView()).toBe("sensibleql");
    });

    test("shortcut 9 navigates to AI Models", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      const modelsButtons = screen.getAllByText("AI Models");
      await user.click(modelsButtons[0]);
      expect(activeView()).toBe("models");
    });

    test("shortcut / focuses search or does nothing", async () => {
      const user = userEvent.setup();
      render(() => <Sidebar />);

      await user.keyboard("/");
      expect(activeView()).toBe("home");
    });

    test("shortcut Escape resets to home", async () => {
      const user = userEvent.setup();
      setActiveView("graph");
      render(() => <Sidebar />);

      const homeButton = screen.getByText("Home").closest("button");
      await user.click(homeButton!);
      expect(activeView()).toBe("home");
    });
  });

  describe("navigation sections", () => {
    test("renders navigation sections with headings", () => {
      render(() => <Sidebar />);

      expect(screen.getAllByText("Data").length).toBeGreaterThan(0);
      expect(screen.getAllByText("AI").length).toBeGreaterThan(0);
      expect(screen.getByText("Databases")).toBeInTheDocument();
    });

    test("renders sidebar dividers", () => {
      render(() => <Sidebar />);

      const dividers = document.querySelectorAll(".sidebar-divider");
      expect(dividers.length).toBeGreaterThan(0);
    });
  });

  describe("store signals integration", () => {
    test("setNodes updates nodes signal", () => {
      const mockNodes = [{ id: 1, label: "Node1" }];
      setNodes(mockNodes);
      render(() => <Sidebar />);

      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    test("setEdges updates edges signal", () => {
      const mockEdges = [{ id: 1, label: "Edge1", from: 1, to: 2 }];
      setEdges(mockEdges);
      render(() => <Sidebar />);

      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    test("setSchema updates schema signal", () => {
      const mockSchema = {
        node_labels: ["User"],
        edge_labels: ["FOLLOWS"],
        node_counts: { User: 10 },
        edge_counts: { FOLLOWS: 5 },
        total_nodes: 10,
        total_edges: 5,
      };
      setSchema(mockSchema);
      render(() => <Sidebar />);

      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });

  describe("tooltips", () => {
    test("Home has tooltip", () => {
      render(() => <Sidebar />);

      const homeButton = screen.getByText("Home").closest("button");
      expect(homeButton).toHaveAttribute("title", "Overview and getting started");
    });

    test("Graph has tooltip", () => {
      render(() => <Sidebar />);

      const graphButton = screen.getByText("Graph").closest("button");
      expect(graphButton).toHaveAttribute("title", "Visualize connections between items");
    });

    test("Chat has tooltip", () => {
      render(() => <Sidebar />);

      const chatButton = screen.getByText("Chat").closest("button");
      expect(chatButton).toHaveAttribute("title", "Ask questions about your data");
    });

    test("Report has tooltip", () => {
      render(() => <Sidebar />);

      const reportButton = screen.getByText("Report").closest("button");
      expect(reportButton).toHaveAttribute("title", "Generate summaries and insights");
    });

    test("Items has tooltip", () => {
      render(() => <Sidebar />);

      const itemsButton = screen.getByText("Items").closest("button");
      expect(itemsButton).toHaveAttribute("title", "Browse all items in your database");
    });

    test("Connections has tooltip", () => {
      render(() => <Sidebar />);

      const connectionsButton = screen.getByText("Connections").closest("button");
      expect(connectionsButton).toHaveAttribute("title", "View relationships between items");
    });

    test("Structure has tooltip", () => {
      render(() => <Sidebar />);

      const structureButton = screen.getByText("Structure").closest("button");
      expect(structureButton).toHaveAttribute("title", "See how your data is organized");
    });

    test("SensibleQL Editor has tooltip", () => {
      render(() => <Sidebar />);

      const editorButton = screen.getByText("SensibleQL Editor").closest("button");
      expect(editorButton).toHaveAttribute("title", "Write advanced queries");
    });

    test("AI Models has tooltip", () => {
      render(() => <Sidebar />);

      const modelsButtons = screen.getAllByText("AI Models");
      const modelsButton = modelsButtons[0].closest("button");
      expect(modelsButton).toHaveAttribute("title", "Manage on-device AI models");
    });
  });

  describe("special database labels", () => {
    test("shows hospital icon for health-patterns database", () => {
      setDatabases(["health-patterns"]);
      render(() => <Sidebar />);

      const dbButton = screen.getByText("health-patterns").closest("button");
      expect(dbButton?.textContent).toContain("🏥");
    });

    test("shows clipboard icon for project-management database", () => {
      setDatabases(["project-management"]);
      render(() => <Sidebar />);

      const dbButton = screen.getByText("project-management").closest("button");
      expect(dbButton?.textContent).toContain("📋");
    });

    test("shows database icon for other databases", () => {
      setDatabases(["my-custom-db"]);
      render(() => <Sidebar />);

      const dbButton = screen.getByText("my-custom-db").closest("button");
      expect(dbButton?.textContent).toContain("🗄️");
    });
  });
});
