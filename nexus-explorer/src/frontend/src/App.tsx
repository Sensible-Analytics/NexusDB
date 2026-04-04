import { Component, onMount, Show } from "solid-js";
import Sidebar from "./components/sidebar/Sidebar";
import DatabaseManager from "./components/database/DatabaseManager";
import GraphView from "./components/graph/GraphView";
import NodeList from "./components/entities/NodeList";
import EdgeList from "./components/entities/EdgeList";
import SchemaBrowser from "./components/sidebar/SchemaBrowser";
import NqlEditor from "./components/editor/NqlEditor";
import { activeView, setDatabases, setActiveDb, setNodes, setEdges, setSchema } from "./stores/app";
import { dbList as apiDbList, nodeList, edgeList, schemaGet } from "./lib/api";
import "./App.css";

const loadDbData = async (dbName: string) => {
  const nodes = await nodeList(dbName);
  setNodes(nodes);
  const edges = await edgeList(dbName);
  setEdges(edges);
  const schema = await schemaGet(dbName);
  setSchema(schema);
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
      // No databases open yet, that's fine
    }
  });

  return (
    <div class="app-layout">
      <Sidebar />
      <main class="main-content">
        <Show when={activeView() === "graph"}>
          <GraphView />
        </Show>
        <Show when={activeView() === "nodes"}>
          <NodeList />
        </Show>
        <Show when={activeView() === "edges"}>
          <EdgeList />
        </Show>
        <Show when={activeView() === "schema"}>
          <SchemaBrowser />
        </Show>
        <Show when={activeView() === "nql"}>
          <NqlEditor />
        </Show>
      </main>
      <aside class="right-panel">
        <DatabaseManager />
      </aside>
    </div>
  );
};

export default App;
