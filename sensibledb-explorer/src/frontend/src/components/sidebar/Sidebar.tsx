import { Component, For, createSignal, Show } from "solid-js";
import { activeView, setActiveView, databases, activeDb, setActiveDb, setNodes, setEdges, setSchema } from "../../stores/app";
import { nodeList, edgeList, schemaGet } from "../../lib/api";
import ConnectionWizard from "../onboarding/ConnectionWizard";
import "./Sidebar.css";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  tooltip: string;
  shortcut?: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: "🏠", label: "Home", tooltip: "Overview and getting started", shortcut: "1" },
  { id: "graph", icon: "🔗", label: "Graph", tooltip: "Visualize connections between items", shortcut: "2" },
  { id: "chat", icon: "💬", label: "Chat", tooltip: "Ask questions about your data", shortcut: "3" },
  { id: "report", icon: "📊", label: "Report", tooltip: "Generate summaries and insights", shortcut: "4" },
];

const dataNavItems: NavItem[] = [
  { id: "nodes", icon: "📦", label: "Items", tooltip: "Browse all items in your database", shortcut: "5" },
  { id: "edges", icon: "🔀", label: "Connections", tooltip: "View relationships between items", shortcut: "6" },
  { id: "schema", icon: "🏗️", label: "Structure", tooltip: "See how your data is organized", shortcut: "7" },
  { id: "nql", icon: "⌨️", label: "NQL Editor", tooltip: "Write advanced queries", shortcut: "8" },
];

const Sidebar: Component = () => {
  const [isWizardOpen, setIsWizardOpen] = createSignal(false);

  const loadDbData = async (dbName: string) => {
    const nodes = await nodeList(dbName);
    setNodes(nodes);
    const edges = await edgeList(dbName);
    setEdges(edges);
    const schema = await schemaGet(dbName);
    setSchema(schema);
  };

  const handleNavClick = (id: string) => {
    setActiveView(id as any);
  };

  const handleDbClick = async (db: string) => {
    setActiveDb(db);
    await loadDbData(db);
  };

  return (
    <nav class="sidebar">
      <div class="sidebar-section">
        <For each={navItems}>
          {(item) => (
            <button
              classList={{ "nav-item": true, active: activeView() === item.id }}
              onClick={() => handleNavClick(item.id)}
              title={item.tooltip}
            >
              <span class="nav-icon">{item.icon}</span>
              <span class="nav-label">{item.label}</span>
              <Show when={item.shortcut}>
                <span class="nav-shortcut">{item.shortcut}</span>
              </Show>
            </button>
          )}
        </For>
      </div>

      <div class="sidebar-divider" />

      <div class="sidebar-section">
        <h3 class="sidebar-heading">Data</h3>
        <For each={dataNavItems}>
          {(item) => (
            <button
              classList={{ "nav-item": true, active: activeView() === item.id }}
              onClick={() => handleNavClick(item.id)}
              title={item.tooltip}
            >
              <span class="nav-icon">{item.icon}</span>
              <span class="nav-label">{item.label}</span>
              <Show when={item.shortcut}>
                <span class="nav-shortcut">{item.shortcut}</span>
              </Show>
            </button>
          )}
        </For>
      </div>

      <div class="sidebar-divider" />

      <div class="sidebar-section">
        <h3 class="sidebar-heading">Databases</h3>
        <button class="connect-data-btn" onClick={() => setIsWizardOpen(true)}>
          <span class="db-icon">➕</span>
          <span class="db-name">Connect Data</span>
        </button>
        <For each={databases()}>
          {(db) => (
            <button
              classList={{ "db-item": true, active: activeDb() === db }}
              onClick={() => handleDbClick(db)}
              title={db === "health-patterns" ? "Health & symptom tracking demo" : db === "project-management" ? "Project management demo" : `Database: ${db}`}
            >
              <span class="db-icon">{db === "health-patterns" ? "🏥" : db === "project-management" ? "📋" : "🗄️"}</span>
              <span class="db-name">{db}</span>
            </button>
          )}
        </For>
      </div>

      <ConnectionWizard isOpen={isWizardOpen()} onClose={() => setIsWizardOpen(false)} onComplete={() => {}} />
    </nav>
  );
};

export default Sidebar;
