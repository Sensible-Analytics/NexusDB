import { Component, createSignal, Show, For } from "solid-js";
import { dbCreate, dbOpen, dbList, dbClose, nodeList, edgeList, schemaGet } from "../../lib/api";
import { databases, setDatabases, activeDb, setActiveDb, setNodes, setEdges, setSchema } from "../../stores/app";
import "./DatabaseManager.css";

const dbDescriptions: Record<string, string> = {
  "health-patterns": "Health & symptom tracking — explore how events trigger symptoms",
  "project-management": "Project management — track team, tasks, dependencies, and tools",
};

const dbIcons: Record<string, string> = {
  "health-patterns": "🏥",
  "project-management": "📋",
};

const DatabaseManager: Component = () => {
  const [name, setName] = createSignal("");
  const [path, setPath] = createSignal("");
  const [isExpanded, setIsExpanded] = createSignal(true);

  const loadDbData = async (dbName: string) => {
    const nodes = await nodeList(dbName);
    setNodes(nodes);
    const edges = await edgeList(dbName);
    setEdges(edges);
    const schema = await schemaGet(dbName);
    setSchema(schema);
  };

  const handleCreate = async () => {
    try {
      await dbCreate(name(), path());
      const dbs = await dbList();
      setDatabases(dbs);
      setActiveDb(name());
      await loadDbData(name());
    } catch (e: any) {
      alert(`Failed to create database: ${e}`);
    }
  };

  const handleOpen = async () => {
    try {
      await dbOpen(name(), path());
      const dbs = await dbList();
      setDatabases(dbs);
      setActiveDb(name());
      await loadDbData(name());
    } catch (e: any) {
      alert(`Failed to open database: ${e}`);
    }
  };

  const handleSelect = async (db: string) => {
    setActiveDb(db);
    await loadDbData(db);
  };

  const handleClose = async (db: string) => {
    await dbClose(db);
    const dbs = await dbList();
    setDatabases(dbs);
    if (activeDb() === db) {
      setActiveDb(null);
      setNodes([]);
      setEdges([]);
      setSchema(null);
    }
  };

  return (
    <div class="db-manager">
      <h3 class="panel-title" onClick={() => setIsExpanded(!isExpanded())} style={{ cursor: "pointer" }}>
        Databases {isExpanded() ? "▾" : "▸"}
      </h3>
      <Show when={isExpanded()}>
        <div class="db-list">
          <For each={databases()}>
            {(db) => (
              <div
                classList={{ "db-item": true, active: activeDb() === db }}
                title={dbDescriptions[db] || `Database: ${db}`}
              >
                <span class="db-icon">{dbIcons[db] || "🗄️"}</span>
                <span class="db-name" onClick={() => handleSelect(db)}>{db}</span>
                <button class="danger small" onClick={() => handleClose(db)} title={`Close ${db}`}>×</button>
              </div>
            )}
          </For>
        </div>
        <div class="db-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" value={name()} onInput={(e) => setName(e.currentTarget.value)} placeholder="my-database" />
          </div>
          <div class="form-group">
            <label>Path</label>
            <input type="text" value={path()} onInput={(e) => setPath(e.currentTarget.value)} placeholder="~/.sensibledb/my-db" />
          </div>
          <div class="db-actions">
            <button onClick={handleCreate} title="Create a new database">Create</button>
            <button class="secondary" onClick={handleOpen} title="Open an existing database">Open</button>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default DatabaseManager;
