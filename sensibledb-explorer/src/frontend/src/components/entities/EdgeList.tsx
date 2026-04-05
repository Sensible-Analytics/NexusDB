import { Component, createSignal, createEffect, Show } from "solid-js";
import { edges, setEdges, activeDb, isLoading, setIsLoading, selectedEdge, setSelectedEdge } from "../../stores/app";
import { edgeList, edgeCreate, edgeUpdate, edgeDelete } from "../../lib/api";
import "./EntityList.css";

const EdgeList: Component = () => {
  const [showForm, setShowForm] = createSignal(false);
  const [editId, setEditId] = createSignal<number | null>(null);
  const [label, setLabel] = createSignal("");
  const [fromNode, setFromNode] = createSignal("");
  const [toNode, setToNode] = createSignal("");
  const [edgeId, setEdgeId] = createSignal("");

  createEffect(() => {
    if (activeDb()) {
      loadEdges();
    }
  });

  const loadEdges = async () => {
    if (!activeDb()) return;
    setIsLoading(true);
    try {
      const data = await edgeList(activeDb()!);
      setEdges(data);
    } catch (e) {
      console.error("Failed to load edges:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!activeDb()) return;
    try {
      const id = edgeId() ? parseInt(edgeId()) : Date.now();
      await edgeCreate(activeDb()!, id, label(), parseInt(fromNode()), parseInt(toNode()));
      setLabel("");
      setFromNode("");
      setToNode("");
      setEdgeId("");
      setShowForm(false);
      await loadEdges();
    } catch (e) {
      alert(`Failed to create edge: ${e}`);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!activeDb()) return;
    try {
      await edgeUpdate(activeDb()!, id, label(), parseInt(fromNode()), parseInt(toNode()));
      setEditId(null);
      setLabel("");
      await loadEdges();
    } catch (e) {
      alert(`Failed to update edge: ${e}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!activeDb()) return;
    if (!confirm("Delete this edge?")) return;
    try {
      await edgeDelete(activeDb()!, id);
      await loadEdges();
    } catch (e) {
      alert(`Failed to delete edge: ${e}`);
    }
  };

  return (
    <div class="entity-list">
      <div class="entity-header">
        <h2>Edges ({edges().length})</h2>
        <button onClick={() => setShowForm(!showForm())}>+ New Edge</button>
      </div>
      <Show when={showForm()}>
        <div class="entity-form">
          <input type="number" value={edgeId()} onInput={(e) => setEdgeId(e.currentTarget.value)} placeholder="ID (auto if empty)" />
          <input type="text" value={label()} onInput={(e) => setLabel(e.currentTarget.value)} placeholder="Label (e.g., KNOWS, OWNS)" />
          <input type="number" value={fromNode()} onInput={(e) => setFromNode(e.currentTarget.value)} placeholder="From Node ID" />
          <input type="number" value={toNode()} onInput={(e) => setToNode(e.currentTarget.value)} placeholder="To Node ID" />
          <div class="form-actions">
            <button onClick={handleCreate}>Create</button>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      </Show>
      <div class="entity-items">
        {edges().map((edge) => (
          <div classList={{ "entity-item": true, selected: selectedEdge()?.id === edge.id }}>
            {editId() === edge.id ? (
              <>
                <input type="text" value={label()} onInput={(e) => setLabel(e.currentTarget.value)} />
                <input type="number" value={fromNode()} onInput={(e) => setFromNode(e.currentTarget.value)} />
                <input type="number" value={toNode()} onInput={(e) => setToNode(e.currentTarget.value)} />
                <button onClick={() => handleUpdate(edge.id)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span class="entity-label" onClick={() => setSelectedEdge(edge)}>{edge.label}</span>
                <span class="entity-id">{edge.from} → {edge.to}</span>
                <div class="entity-actions">
                  <button onClick={() => { setEditId(edge.id); setLabel(edge.label); setFromNode(String(edge.from)); setToNode(String(edge.to)); }}>Edit</button>
                  <button class="danger" onClick={() => handleDelete(edge.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EdgeList;
