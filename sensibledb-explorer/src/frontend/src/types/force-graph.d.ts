declare module 'force-graph' {
  export interface ForceGraphInstance {
    backgroundColor(color: string): ForceGraphInstance;
    nodeLabel(label: string | ((node: any) => string)): ForceGraphInstance;
    nodeAutoColorBy(field: string | null): ForceGraphInstance;
    nodeVal(val: number | ((node: any) => number)): ForceGraphInstance;
    nodeRelSize(size: number): ForceGraphInstance;
    linkLabel(label: string | ((link: any) => string)): ForceGraphInstance;
    linkWidth(width: number | ((link: any) => number)): ForceGraphInstance;
    linkDirectionalParticles(particles: number): ForceGraphInstance;
    linkDirectionalParticleWidth(width: number): ForceGraphInstance;
    graphData(data: { nodes: any[]; links: any[] }): ForceGraphInstance;
    nodeCanvasObject(fn: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void): ForceGraphInstance;
    onEngineStop(fn: () => void): ForceGraphInstance;
    zoomToFit(duration?: number, padding?: number): ForceGraphInstance;
    centerAt(x?: number, y?: number, duration?: number): ForceGraphInstance;
    _destructor?(): void;
  }

  const ForceGraph: (element: HTMLElement) => ForceGraphInstance;
  export default ForceGraph;
}
