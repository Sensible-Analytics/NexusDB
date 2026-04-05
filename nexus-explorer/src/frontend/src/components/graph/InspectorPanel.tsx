import { Component, createMemo, For, Show } from "solid-js";
import type { NodeDto, EdgeDto } from "../../types";
import "./InspectorPanel.css";

interface InspectorPanelProps {
  node: NodeDto;
  edges: EdgeDto[];
  allNodes: Array<{ id: number; label: string; type: string; icon: string; color: string }>;
  onAskAbout: () => void;
  onClose: () => void;
}

const typeIcons: Record<string, string> = {
  Person: "🧑",
  Event: "📅",
  Symptom: "😰",
  Medication: "💊",
  Office: "🏢",
  Home: "🏠",
  Travel: "✈️",
  Task: "✅",
  Project: "📋",
  Tool: "🔧",
  default: "📦",
};

const InspectorPanel: Component<InspectorPanelProps> = (props) => {
  const connectedEdges = createMemo(() => {
    return props.edges.filter(
      (e) => e.from === props.node.id || e.to === props.node.id
    );
  });

  const connectionCount = createMemo(() => connectedEdges().length);

  const connectedNodes = createMemo(() => {
    return connectedEdges().map((edge) => {
      const connectedId = edge.from === props.node.id ? edge.to : edge.from;
      const connectedNode = props.allNodes.find((n) => n.id === connectedId);
      return {
        id: connectedId,
        label: connectedNode?.label || `Node ${connectedId}`,
        type: connectedNode?.type || "Item",
        icon: connectedNode?.icon || typeIcons.default,
        relationship: edge.label,
      };
    });
  });

  const nodeType = createMemo(() => {
    const words = props.node.label.split(/[\s_-]+/);
    return words.length > 1 ? words[0] : "Item";
  });

  const nodeIcon = createMemo(() => {
    return typeIcons[nodeType()] || typeIcons.default;
  });

  return (
    <div class="inspector-panel">
      <div class="inspector-header">
        <div class="inspector-title-row">
          <span class="inspector-icon">{nodeIcon()}</span>
          <span class="inspector-type">{nodeType()}</span>
          <span class="inspector-name">: {props.node.label}</span>
        </div>
        <button class="inspector-close" onClick={props.onClose} title="Close">
          ✕
        </button>
      </div>

      <div class="inspector-card">
        <div class="inspector-property">
          <span class="property-label">ID</span>
          <span class="property-value">{props.node.id}</span>
        </div>
        <div class="inspector-property">
          <span class="property-label">Type</span>
          <span class="property-value">{nodeType()}</span>
        </div>
        <div class="inspector-property">
          <span class="property-label">Connections</span>
          <span class="property-value">{connectionCount()}</span>
        </div>
      </div>

      <div class="inspector-section">
        <div class="section-divider">
          <span>Connected To</span>
        </div>
        <Show
          when={connectedNodes().length > 0}
          fallback={
            <div class="no-connections">
              No connections found for this node.
            </div>
          }
        >
          <div class="connected-list">
            <For each={connectedNodes()}>
              {(cn) => (
                <div class="connected-item">
                  <span class="connected-icon">{cn.icon}</span>
                  <span class="connected-label">{cn.label}</span>
                  <span class="connected-relationship">({cn.relationship})</span>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      <button class="ask-about-btn" onClick={props.onAskAbout}>
        Ask about {props.node.label} →
      </button>
    </div>
  );
};

export default InspectorPanel;
