import { Component, createEffect, onMount, Show } from "solid-js";
import Sidebar from "./components/sidebar/Sidebar";
import DatabaseManager from "./components/database/DatabaseManager";
import GraphView from "./components/graph/GraphView";
import NodeList from "./components/entities/NodeList";
import EdgeList from "./components/entities/EdgeList";
import SchemaBrowser from "./components/sidebar/SchemaBrowser";
import SensibleQLEditor from "./components/editor/SensibleQLEditor";
import HomeView from "./components/home/HomeView";
import ChatView from "./components/chat/ChatView";
import ReportView from "./components/report/ReportView";
import ModelSettings from "./components/settings/ModelSettings";
import GuidedTour, { isTourCompleted } from "./components/onboarding/GuidedTour";
import { activeView, setActiveView, activeDb, nodes, edges, setDatabases, setActiveDb, setNodes, setEdges, setSchema, selectedNode, setSelectedNode } from "./stores/app";
import { logError, dbList as apiDbList, nodeList, edgeList, schemaGet } from "./lib/api";
import ErrorBoundaryComponent from "./components/ui/ErrorBoundary";
import "./App.css";

const loadDbData = async (dbName: string) => {
  try {
    const nodes = await nodeList(dbName);
    setNodes(nodes);
    const edges = await edgeList(dbName);
    setEdges(edges);
    const schema = await schemaGet(dbName);
    setSchema(schema);
  } catch (err) {
    const errMsg = "[loadDbData] ERROR: " + String(err);
    logError(errMsg).catch(() => {});
  }
};

const App: Component = () => {
  onMount(async () => {
    try {
      const dbs = await apiDbList();
      setDatabases(dbs);
      if (dbs.length > 0) {
        const firstDb = dbs[0];
        setActiveDb(firstDb);
        await loadDbData(firstDb);
      }
    } catch (e) {
    }

    if (!isTourCompleted()) {
      setTimeout(() => {
        const tourEvent = new CustomEvent("show-tour");
        window.dispatchEvent(tourEvent);
      }, 1500);
    }
  });

  createEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "1") setActiveView("home");
      else if (e.key === "2") setActiveView("graph");
      else if (e.key === "3") setActiveView("chat");
      else if (e.key === "4") setActiveView("report");
      else if (e.key === "5") setActiveView("nodes");
      else if (e.key === "6") setActiveView("edges");
      else if (e.key === "7") setActiveView("schema");
      else if (e.key === "8") setActiveView("sensibleql");
      else if (e.key === "9") setActiveView("models");
      else if (e.key === "9") setActiveView("models");
      else if (e.key === "Escape") {
        if (selectedNode()) setSelectedNode(null);
        else setActiveView("home");
      }
      else if (e.key === "/" || (e.ctrlKey && e.key === "k")) {
        e.preventDefault();
        setActiveView("chat");
      }
      else if (e.ctrlKey && e.key === "g") {
        e.preventDefault();
        setActiveView("graph");
      }
      else if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        if (activeDb()) loadDbData(activeDb()!);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div class="app-layout">
      <header class="app-header">
        <div class="header-brand">
          <svg class="header-logo" viewBox="0 0 40 40" width="28" height="28">
            <circle cx="10" cy="10" r="3" fill="#6366f1"/>
            <circle cx="30" cy="10" r="3" fill="#6366f1"/>
            <circle cx="10" cy="30" r="3" fill="#6366f1"/>
            <circle cx="30" cy="30" r="3" fill="#6366f1"/>
            <circle cx="20" cy="20" r="4" fill="#06b6d4"/>
            <line x1="10" y1="10" x2="20" y2="20" stroke="#6366f1" stroke-width="1.5" opacity="0.6"/>
            <line x1="30" y1="10" x2="20" y2="20" stroke="#6366f1" stroke-width="1.5" opacity="0.6"/>
            <line x1="10" y1="30" x2="20" y2="20" stroke="#6366f1" stroke-width="1.5" opacity="0.6"/>
            <line x1="30" y1="30" x2="20" y2="20" stroke="#6366f1" stroke-width="1.5" opacity="0.6"/>
          </svg>
          <span class="header-title">Sensible<span class="header-accent">DB</span></span>
        </div>
        <div class="header-db-selector">
          <Show when={activeDb()}>
            <span class="badge blue">{activeDb()}</span>
          </Show>
        </div>
        <div class="header-actions">
          <button class="icon-btn" title="Settings">⚙</button>
        </div>
      </header>

      <div class="app-body">
        <Sidebar />
        <main class="main-content">
          <Show when={activeView() === "home"}>
            <ErrorBoundaryComponent><HomeView /></ErrorBoundaryComponent>
          </Show>
          <Show when={activeView() === "graph"}>
            <ErrorBoundaryComponent><GraphView /></ErrorBoundaryComponent>
          </Show>
          <Show when={activeView() === "chat"}>
            <ErrorBoundaryComponent><ChatView /></ErrorBoundaryComponent>
          </Show>
          <Show when={activeView() === "report"}>
            <ErrorBoundaryComponent><ReportView /></ErrorBoundaryComponent>
          </Show>
          <Show when={activeView() === "nodes"}>
            <ErrorBoundaryComponent><NodeList /></ErrorBoundaryComponent>
          </Show>
          <Show when={activeView() === "edges"}>
            <ErrorBoundaryComponent><EdgeList /></ErrorBoundaryComponent>
          </Show>
          <Show when={activeView() === "schema"}>
            <ErrorBoundaryComponent><SchemaBrowser /></ErrorBoundaryComponent>
          </Show>
          <Show when={activeView() === "sensibleql"}>
            <ErrorBoundaryComponent><SensibleQLEditor /></ErrorBoundaryComponent>
          </Show>
          <Show when={activeView() === "models"}>
            <ErrorBoundaryComponent><ModelSettings /></ErrorBoundaryComponent>
          </Show>
          <Show when={activeView() === "models"}>
            <ErrorBoundaryComponent><ModelSettings /></ErrorBoundaryComponent>
          </Show>
        </main>
        <aside class="right-panel">
          <DatabaseManager />
        </aside>
      </div>

      <footer class="status-bar">
        <Show when={activeDb()}>
          <span>Connected to <strong>{activeDb()}</strong></span>
          <span class="status-separator">•</span>
          <span>{nodes().length} items</span>
          <span class="status-separator">•</span>
          <span>{edges().length} connections</span>
        </Show>
        <Show when={!activeDb()}>
          <span>No database connected</span>
        </Show>
      </footer>

      <GuidedTour />
    </div>
  );
};

export default App;
