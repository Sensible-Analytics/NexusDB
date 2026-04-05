import { Component, createEffect, Show } from "solid-js";
import { schema, setSchema, activeDb } from "../../stores/app";
import { schemaGet } from "../../lib/api";
import "./SchemaBrowser.css";

const SchemaBrowser: Component = () => {
  createEffect(() => {
    if (activeDb()) {
      loadSchema();
    }
  });

  const loadSchema = async () => {
    if (!activeDb()) return;
    try {
      const data = await schemaGet(activeDb()!);
      setSchema(data);
    } catch (e) {
      console.error("Failed to load schema:", e);
    }
  };

  return (
    <div class="schema-browser">
      <h2>Schema</h2>
      <Show when={schema()}>
        {(s) => (
          <div>
            <div class="schema-section">
              <h3>Node Labels ({s().node_labels.length})</h3>
              <ul>
                {s().node_labels.map((label) => (
                  <li>
                    <span class="label-name">{label}</span>
                    <span class="label-count">{s().node_counts[label] || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div class="schema-section">
              <h3>Edge Labels ({s().edge_labels.length})</h3>
              <ul>
                {s().edge_labels.map((label) => (
                  <li>
                    <span class="label-name">{label}</span>
                    <span class="label-count">{s().edge_counts[label] || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div class="schema-stats">
              <div class="stat">
                <span class="stat-value">{s().total_nodes}</span>
                <span class="stat-label">Total Nodes</span>
              </div>
              <div class="stat">
                <span class="stat-value">{s().total_edges}</span>
                <span class="stat-label">Total Edges</span>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};

export default SchemaBrowser;
