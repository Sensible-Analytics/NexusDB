import { Component, onMount, onCleanup, createEffect } from "solid-js";
import ForceGraph from "force-graph";
import type { ForceGraphInstance } from "force-graph";
import { nodes, edges, activeDb } from "../../stores/app";
import "./GraphView.css";

const GraphView: Component = () => {
  let containerRef: HTMLDivElement | undefined;
  let graph: ForceGraphInstance | undefined;

  onMount(() => {
    if (!containerRef) return;
    graph = ForceGraph(containerRef)
      .backgroundColor("#0f172a")
      .nodeLabel("label")
      .nodeAutoColorBy("label")
      .nodeRelSize(6)
      .linkLabel("label")
      .linkWidth(1.5)
      .linkDirectionalParticles(1)
      .linkDirectionalParticleWidth(2)
      .onEngineStop(() => {
        graph?.zoomToFit(400, 40);
      });
  });

  onCleanup(() => {
    graph = undefined;
  });

  createEffect(() => {
    if (!graph || !activeDb()) return;

    const graphNodes = nodes().map(n => ({
      id: n.id,
      label: n.label,
    }));

    const graphEdges = edges().map(e => ({
      source: e.from,
      target: e.to,
      label: e.label,
    }));

    graph.graphData({ nodes: graphNodes, links: graphEdges });
  });

  return <div ref={containerRef!} class="graph-container" />;
};

export default GraphView;
