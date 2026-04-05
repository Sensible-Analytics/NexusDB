import { Component, createSignal, createEffect, Show } from "solid-js";
import { nodes, setNodes, activeDb, isLoading, setIsLoading, selectedNode, setSelectedNode } from "../../stores/app";
import { nodeList, nodeCreate, nodeUpdate, nodeDelete } from "../../lib/api";
import "./EntityList.css";

const NodeList: Component = () => {
  const [showForm, setShowForm] = createSignal(false);
  const [editId, setEditId] = createSignal<number | null>(null);
  const [label, setLabel] = createSignal("");
  const [nodeId, setNodeId] = createSignal("");

  createEffect(() => {
    if (activeDb()) {
      loadNodes();
    }
  });

  const loadNodes = async () => {
    if (!activeDb()) return;
    setIsLoading(true);
    try {
      const data = await nodeList(activeDb()!);
      setNodes(data);
    } catch (e) {
      console.error("Failed to load nodes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!activeDb()) return;
    try {
      const id = nodeId() ? parseInt(nodeId()) : Date.now();
      await nodeCreate(activeDb()!, id, label());
      setLabel("");
      setNodeId("");
      setShowForm(false);
      await loadNodes();
    } catch (e) {
      alert(`Failed to create node: ${e}`);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!activeDb()) return;
    try {
      await nodeUpdate(activeDb()!, id, label());
      setEditId(null);
      setLabel("");
      await loadNodes();
    } catch (e) {
      alert(`Failed to update node: ${e}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!activeDb()) return;
    if (!confirm("Delete this node?")) return;
    try {
      await nodeDelete(activeDb()!, id);
      await loadNodes();
    } catch (e) {
      alert(`Failed to delete node: ${e}`);
    }
  };

  return (
    <div class="entity-list">
      <div class="entity-header">
        <h2>Nodes ({nodes().length})</h2>
        <button onClick={() => setShowForm(!showForm())}>+ New Node</button>
      </div>
      <Show when={showForm()}>
        <div class="entity-form">
          <input type="number" value={nodeId()} onInput={(e) => setNodeId(e.currentTarget.value)} placeholder="ID (auto if empty)" />
          <input type="text" value={label()} onInput={(e) => setLabel(e.currentTarget.value)} placeholder="Label (e.g., User, Product)" />
          <div class="form-actions">
            <button onClick={handleCreate}>Create</button>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      </Show>
      <div class="entity-items">
        {nodes().map((node) => (
          <div classList={{ "entity-item": true, selected: selectedNode()?.id === node.id }}>
            {editId() === node.id ? (
              <>
                <input type="text" value={label()} onInput={(e) => setLabel(e.currentTarget.value)} />
                <button onClick={() => handleUpdate(node.id)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span class="entity-label" onClick={() => setSelectedNode(node)}>{node.label}</span>
                <span class="entity-id">#{node.id}</span>
                <div class="entity-actions">
                  <button onClick={() => { setEditId(node.id); setLabel(node.label); }}>Edit</button>
                  <button class="danger" onClick={() => handleDelete(node.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeList;
