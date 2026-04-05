import { Component, createEffect, createSignal, onMount, onCleanup, For, Show } from "solid-js";
import { nodes, edges, activeDb, schema, setSelectedNode, selectedNode, setActiveView, setChatMessages } from "../../stores/app";
import { nqlExecute } from "../../lib/api";
import type { NodeDto, EdgeDto } from "../../types";
import InspectorPanel from "./InspectorPanel";
import "./GraphView.css";

interface GraphNode {
  id: number;
  label: string;
  type: string;
  x: number;
  y: number;
  color: string;
  icon: string;
  connectionCount: number;
}

const colors = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1"
];

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

const CARD_WIDTH = 160;
const CARD_HEIGHT = 80;

const GraphView: Component = () => {
  const [graphNodes, setGraphNodes] = createSignal<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = createSignal<EdgeDto[]>([]);
  const [transform, setTransform] = createSignal({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = createSignal<GraphNode | null>(null);
  const [panning, setPanning] = createSignal(false);
  const [panStart, setPanStart] = createSignal({ x: 0, y: 0 });
  const [hoveredEdge, setHoveredEdge] = createSignal<number | null>(null);
  const [hoveredNode, setHoveredNode] = createSignal<number | null>(null);
  const [queryInput, setQueryInput] = createSignal("");
  const [queryLoading, setQueryLoading] = createSignal(false);
  const [suggestions] = createSignal<string[]>([]);
  let svgRef: SVGSVGElement | undefined;
  let animFrameId: number | undefined;
  let simulationRunning = false;

  const getIconForType = (type: string): string => {
    return typeIcons[type] || typeIcons.default;
  };

  const getColorForIndex = (i: number): string => {
    return colors[i % colors.length];
  };

  const extractTypeFromLabel = (label: string): string => {
    const s = schema();
    if (s) {
      for (const nodeLabel of s.node_labels) {
        if (label.toLowerCase().includes(nodeLabel.toLowerCase())) {
          return nodeLabel;
        }
      }
    }
    const words = label.split(/[\s_-]+/);
    if (words.length > 1) {
      return words[0];
    }
    return "Item";
  };

  const getConnectionCount = (nodeId: number, edgeList: EdgeDto[]): number => {
    return edgeList.filter(e => e.from === nodeId || e.to === nodeId).length;
  };

  const runAsyncSimulation = (nodeMap: Map<number, GraphNode>, edgeList: EdgeDto[], cx: number, cy: number) => {
    if (simulationRunning) return;
    simulationRunning = true;

    let alpha = 1.0;
    const minAlpha = 0.001;
    const decay = 0.97;

    const tick = () => {
      if (alpha < minAlpha) {
        simulationRunning = false;
        return;
      }

      const arr = Array.from(nodeMap.values());
      const dragNode = dragging();

      for (let i = 0; i < arr.length; i++) {
        if (dragNode && arr[i].id === dragNode.id) continue;
        for (let j = i + 1; j < arr.length; j++) {
          if (dragNode && arr[j].id === dragNode.id) continue;
          const dx = arr[j].x - arr[i].x;
          const dy = arr[j].y - arr[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (5000 / (dist * dist)) * alpha;
          arr[i].x -= (dx / dist) * force;
          arr[i].y -= (dy / dist) * force;
          arr[j].x += (dx / dist) * force;
          arr[j].y += (dy / dist) * force;
        }
      }

      edgeList.forEach(edge => {
        const s = nodeMap.get(edge.from);
        const t = nodeMap.get(edge.to);
        if (s && t) {
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 120) * 0.01 * alpha;
          if (!(dragNode && s.id === dragNode.id)) {
            s.x += (dx / dist) * force;
            s.y += (dy / dist) * force;
          }
          if (!(dragNode && t.id === dragNode.id)) {
            t.x -= (dx / dist) * force;
            t.y -= (dy / dist) * force;
          }
        }
      });

      arr.forEach(node => {
        if (dragNode && node.id === dragNode.id) return;
        node.x += (cx - node.x) * 0.02 * alpha;
        node.y += (cy - node.y) * 0.02 * alpha;
      });

      setGraphNodes(Array.from(nodeMap.values()));
      alpha *= decay;
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
  };

  createEffect(() => {
    if (!activeDb()) {
      setGraphNodes([]);
      setGraphEdges([]);
      return;
    }

    const n = nodes();
    const e = edges();
    if (n.length === 0) {
      setGraphNodes([]);
      setGraphEdges([]);
      return;
    }

    const nodeMap = new Map<number, GraphNode>();
    const svg = svgRef!;
    const rect = svg.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;
    const cx = width / 2;
    const cy = height / 2;

    const typeIndex = new Map<string, number>();
    let typeCounter = 0;

    n.forEach((node: NodeDto) => {
      const type = extractTypeFromLabel(node.label);
      if (!typeIndex.has(type)) {
        typeIndex.set(type, typeCounter++);
      }
      const angle = (2 * Math.PI * n.indexOf(node)) / n.length;
      const r = Math.min(width, height) * 0.3;
      nodeMap.set(node.id, {
        id: node.id,
        label: node.label,
        type,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        color: getColorForIndex(typeIndex.get(type)!),
        icon: getIconForType(type),
        connectionCount: 0,
      });
    });

    e.forEach(edge => {
      const src = nodeMap.get(edge.from);
      const tgt = nodeMap.get(edge.to);
      if (src) src.connectionCount++;
      if (tgt) tgt.connectionCount++;
    });

    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
    }
    simulationRunning = false;
    setGraphNodes(Array.from(nodeMap.values()));
    setGraphEdges(e);
    setSelectedNode(null);
    setTransform({ x: 0, y: 0, k: 1 });

    runAsyncSimulation(nodeMap, e, cx, cy);
  });

  onCleanup(() => {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
    }
  });

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const t = transform();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newK = Math.max(0.1, Math.min(5, t.k * delta));
    setTransform({ ...t, k: newK });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.target === svgRef || (e.target as Element).tagName === 'rect') {
      setPanning(true);
      setPanStart({ x: e.clientX - transform().x, y: e.clientY - transform().y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const dragNode = dragging();
    if (dragNode) {
      const t = transform();
      const svg = svgRef!;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left - t.x) / t.k;
      const y = (e.clientY - rect.top - t.y) / t.k;
      setGraphNodes(prev => prev.map(n => n.id === dragNode.id ? { ...n, x, y } : n));
    } else if (panning()) {
      const ps = panStart();
      setTransform(prev => ({ ...prev, x: e.clientX - ps.x, y: e.clientY - ps.y }));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setPanning(false);
  };

  const handleNodeMouseDown = (node: GraphNode, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedNode({ id: node.id, label: node.label } as NodeDto);
    setDragging(node);
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode({ id: node.id, label: node.label } as NodeDto);
  };

  const handleAskAboutNode = (nodeName: string) => {
    setChatMessages([]);
    setActiveView("chat");
  };

  const handleQuerySubmit = async () => {
    const query = queryInput().trim();
    if (!query || !activeDb() || queryLoading()) return;

    setQueryLoading(true);
    try {
      const result = await nqlExecute(activeDb()!, query);
      if (result.success) {
        setChatMessages([
          { role: "user", content: query, timestamp: Date.now() },
          { role: "assistant", content: `Found ${result.data?.nodes?.length || 0} items and ${result.data?.edges?.length || 0} connections.`, data: result.data, timestamp: Date.now() }
        ]);
      } else {
        setChatMessages([
          { role: "user", content: query, timestamp: Date.now() },
          { role: "assistant", content: "I couldn't process that query. Try rephrasing your question.", timestamp: Date.now() }
        ]);
      }
      setActiveView("chat");
    } catch {
      setChatMessages([
        { role: "user", content: query, timestamp: Date.now() },
        { role: "assistant", content: "An error occurred while executing the query.", timestamp: Date.now() }
      ]);
      setActiveView("chat");
    } finally {
      setQueryLoading(false);
    }
  };

  const selected = () => selectedNode();

  return (
    <div class="graph-container">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        class="graph-svg"
        xmlns="http://www.w3.org/2000/svg"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <rect width="100%" height="100%" fill="transparent" />
        <g transform={`translate(${transform().x},${transform().y}) scale(${transform().k})`}>
          <defs>
            <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.5" />
            </filter>
          </defs>

          {graphEdges().map(edge => {
            const source = graphNodes().find(n => n.id === edge.from);
            const target = graphNodes().find(n => n.id === edge.to);
            if (!source || !target) return null;

            const isHovered = hoveredEdge() === edge.id;
            const isSelected = selected() && (selected()!.id === edge.from || selected()!.id === edge.to);
            const strokeWidth = isHovered || isSelected ? 3 : 2;
            const strokeColor = isSelected ? "#3b82f6" : isHovered ? "#60a5fa" : "#475569";

            return (
              <g
                class="edge-group"
                onMouseEnter={() => setHoveredEdge(edge.id)}
                onMouseLeave={() => setHoveredEdge(null)}
              >
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={strokeColor}
                  stroke-width={strokeWidth}
                  class="edge-line"
                />
                <Show when={isHovered || isSelected}>
                  <text
                    x={(source.x + target.x) / 2}
                    y={(source.y + target.y) / 2 - 8}
                    fill="#e2e8f0"
                    font-size="11"
                    font-weight="500"
                    text-anchor="middle"
                    class="edge-label"
                  >
                    {edge.label}
                  </text>
                </Show>
              </g>
            );
          })}

          {graphNodes().map((node, i) => {
            const isSelected = selected()?.id === node.id;
            const isHovered = hoveredNode() === node.id;
            const isDragging = dragging()?.id === node.id;

            return (
              <g
                class={`node-group ${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
                transform={`translate(${node.x - CARD_WIDTH / 2}, ${node.y - CARD_HEIGHT / 2})`}
                onMouseDown={(e) => handleNodeMouseDown(node, e)}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "grab" }}
              >
                <foreignObject width={CARD_WIDTH} height={CARD_HEIGHT}>
                  <div
                    class="node-card"
                    style={{
                      "border-color": isSelected ? node.color : isHovered ? "rgba(255,255,255,0.3)" : "var(--border)",
                      "box-shadow": isDragging
                        ? "0 8px 24px rgba(0,0,0,0.6)"
                        : isHovered
                        ? `0 0 12px ${node.color}40`
                        : "var(--shadow-sm)",
                      "border-width": isSelected ? "2px" : "1px",
                    }}
                  >
                    <div class="node-card-header">
                      <span class="node-card-icon">{node.icon}</span>
                      <span
                        class="node-card-type"
                        style={{ color: node.color }}
                      >
                        {node.type}
                      </span>
                    </div>
                    <div class="node-card-label">{node.label}</div>
                    <div class="node-card-divider" />
                    <div class="node-card-footer">
                      <span class="node-card-connections">
                        {node.connectionCount} connection{node.connectionCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {graphNodes().length === 0 && (
            <text x="400" y="300" fill="#94a3b8" font-size="16" text-anchor="middle">No data to display</text>
          )}
        </g>
      </svg>

      <Show when={selected()}>
        <div class="graph-inspector-panel">
          <InspectorPanel
            node={selected()!}
            edges={graphEdges()}
            allNodes={graphNodes()}
            onAskAbout={() => handleAskAboutNode(selected()!.label)}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </Show>

      <div class="zoom-controls">
        <button onClick={() => setTransform(t => ({ ...t, k: Math.min(5, t.k * 1.2) }))}>+</button>
        <button onClick={() => setTransform(t => ({ ...t, k: Math.max(0.1, t.k / 1.2) }))}>−</button>
        <button onClick={() => setTransform({ x: 0, y: 0, k: 1 })}>⟲</button>
      </div>

      <div class="query-bar">
        <div class="query-bar-content">
          <div class="query-input-row">
            <span class="query-icon">💬</span>
            <input
              type="text"
              class="query-input"
              value={queryInput()}
              onInput={(e) => setQueryInput(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuerySubmit()}
              placeholder="Ask a question about your data..."
              disabled={!activeDb() || queryLoading()}
            />
            <button
              class="query-submit-btn"
              onClick={handleQuerySubmit}
              disabled={!activeDb() || queryLoading() || !queryInput().trim()}
            >
              {queryLoading() ? "..." : "Ask ▶"}
            </button>
          </div>
          <div class="query-suggestions">
            <span class="suggestions-label">Suggestions:</span>
            <Show when={schema()}>
              <For each={schema()!.node_labels.slice(0, 3)}>
                {(label) => (
                  <button
                    class="suggestion-chip"
                    onClick={() => {
                      setQueryInput(`Show me all ${label}`);
                    }}
                  >
                    "Show me all {label}"
                  </button>
                )}
              </For>
            </Show>
            <Show when={!schema() || schema()!.node_labels.length === 0}>
              <button class="suggestion-chip" onClick={() => setQueryInput("What data do I have?")}>
                "What data do I have?"
              </button>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphView;
