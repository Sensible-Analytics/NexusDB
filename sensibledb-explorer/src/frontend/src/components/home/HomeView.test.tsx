import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import HomeView from "../home/HomeView";
import { setActiveView, setActiveDb, databases, setDatabases, setNodes, setEdges, setSchema } from "../../stores/app";

vi.mock("../../lib/api", () => ({
  nodeList: vi.fn().mockResolvedValue([]),
  edgeList: vi.fn().mockResolvedValue([]),
  schemaGet: vi.fn().mockResolvedValue({ node_labels: [], edge_types: [], indexes: [], vector_indexes: [] }),
}));

vi.mock("../onboarding/GuidedTour", () => ({
  showTour: vi.fn(),
}));

vi.mock("../onboarding/ConnectionWizard", () => ({
  sourceOptions: [
    { value: "demo", label: "Load Demo Data", icon: "🧪" },
  ],
  default: () => <div>ConnectionWizard</div>,
}));

describe("HomeView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActiveDb(null);
    setDatabases([]);
    setNodes([]);
    setEdges([]);
    setSchema(null);
  });

  it("renders welcome section", () => {
    const { container } = render(() => <HomeView />);
    expect(container.querySelector(".welcome-section")).toBeInTheDocument();
  });

  it("displays welcome title", () => {
    render(() => <HomeView />);
    expect(screen.getByText(/welcome to sensibledb/i)).toBeInTheDocument();
  });

  it("shows connect your data section", () => {
    render(() => <HomeView />);
    expect(screen.getAllByText(/connect your data/i).length).toBeGreaterThan(0);
  });

  it("shows import your data card", () => {
    render(() => <HomeView />);
    expect(screen.getAllByText(/import your data/i).length).toBeGreaterThan(0);
  });

  it("has tour button", () => {
    render(() => <HomeView />);
    expect(screen.getByRole("button", { name: /take a tour/i })).toBeInTheDocument();
  });

  it("has connect data button", () => {
    render(() => <HomeView />);
    expect(screen.getByRole("button", { name: /connect your data/i })).toBeInTheDocument();
  });

  it("shows demo section", () => {
    render(() => <HomeView />);
    expect(screen.getByText(/try a demo database/i)).toBeInTheDocument();
  });

  it("displays demo card titles", () => {
    render(() => <HomeView />);
    expect(screen.getByText(/health patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/project management/i)).toBeInTheDocument();
  });

  it("displays demo card descriptions", () => {
    render(() => <HomeView />);
    expect(screen.getByText(/track symptoms, triggers/i)).toBeInTheDocument();
    expect(screen.getByText(/see how team members/i)).toBeInTheDocument();
  });

  it("shows demo item counts", () => {
    render(() => <HomeView />);
    expect(screen.getAllByText(/items/i).length).toBeGreaterThan(0);
  });

  it("shows demo connection counts", () => {
    render(() => <HomeView />);
    expect(screen.getAllByText(/connections/i).length).toBeGreaterThan(0);
  });

  it("has explore button on demo cards", () => {
    render(() => <HomeView />);
    expect(screen.getAllByRole("button", { name: /explore/i }).length).toBeGreaterThan(0);
  });

  it("shows question suggestions on demo cards", () => {
    render(() => <HomeView />);
    expect(screen.getByText(/what triggers fatigue?/i)).toBeInTheDocument();
    expect(screen.getByText(/show me all symptoms/i)).toBeInTheDocument();
  });
});
