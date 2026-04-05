import { test as base, expect, type Page } from '@playwright/test';

export async function injectTauriMock(page: Page) {
  await page.addInitScript(() => {
    const mockData = {
      nodes: [
        { id: 1, label: 'Alex' },
        { id: 2, label: 'Fatigue' },
        { id: 3, label: 'Poor Sleep' },
        { id: 4, label: 'Office' },
        { id: 5, label: 'Home' },
        { id: 6, label: 'Project Alpha' },
        { id: 7, label: 'Task: Design UI' },
        { id: 8, label: 'Task: Write Tests' },
        { id: 9, label: 'VS Code' },
        { id: 10, label: 'Playwright' },
      ],
      edges: [
        { id: 1, label: 'EXPERIENCES', from: 1, to: 2 },
        { id: 2, label: 'TRIGGERS', from: 3, to: 2 },
        { id: 3, label: 'WORKS_AT', from: 1, to: 4 },
        { id: 4, label: 'LIVES_AT', from: 1, to: 5 },
        { id: 5, label: 'OWNS', from: 1, to: 6 },
        { id: 6, label: 'BLOCKS', from: 7, to: 8 },
        { id: 7, label: 'USES', from: 1, to: 9 },
        { id: 8, label: 'USES', from: 8, to: 10 },
        { id: 9, label: 'RELATED_TO', from: 2, to: 3 },
        { id: 10, label: 'ASSIGNED_TO', from: 7, to: 1 },
      ],
      schema: {
        node_labels: ['Person', 'Symptom', 'Event', 'Office', 'Home', 'Project', 'Task', 'Tool'],
        edge_labels: ['EXPERIENCES', 'TRIGGERS', 'WORKS_AT', 'LIVES_AT', 'OWNS', 'BLOCKS', 'USES', 'RELATED_TO', 'ASSIGNED_TO'],
        node_counts: { Person: 1, Symptom: 1, Event: 1, Office: 1, Home: 1, Project: 1, Task: 2, Tool: 2 },
        edge_counts: { EXPERIENCES: 1, TRIGGERS: 1, WORKS_AT: 1, LIVES_AT: 1, OWNS: 1, BLOCKS: 1, USES: 2, RELATED_TO: 1, ASSIGNED_TO: 1 },
        total_nodes: 10,
        total_edges: 10,
      },
    };

    let callbackCounter = 0;
    const callbacks = new Map();

    const tauriInvoke = async (cmd: string, args: any) => {
      switch (cmd) {
        case 'db_list':
          return ['health-patterns', 'project-management'];
        case 'db_create':
          return `Database ${args?.name || 'test'} created`;
        case 'db_open':
          return `Database ${args?.name || 'test'} opened`;
        case 'db_close':
          return 'closed';
        case 'db_stats':
          return { node_count: mockData.nodes.length, edge_count: mockData.edges.length };
        case 'node_list':
          return mockData.nodes;
        case 'node_create':
          mockData.nodes.push({ id: args?.req?.id || Date.now(), label: args?.req?.label || '' });
          return { id: args?.req?.id || Date.now(), label: args?.req?.label || '' };
        case 'node_get':
          return mockData.nodes.find((n: any) => n.id === args?.id) || null;
        case 'node_update':
          const node = mockData.nodes.find((n: any) => n.id === args?.id);
          if (node) node.label = args?.label || '';
          return node;
        case 'node_delete':
          mockData.nodes = mockData.nodes.filter((n: any) => n.id !== args?.id);
          return 'deleted';
        case 'edge_list':
          return mockData.edges;
        case 'edge_create':
          const newEdge = { id: args?.req?.id || Date.now(), label: args?.req?.label || '', from: args?.req?.from_node || 0, to: args?.req?.to_node || 0 };
          mockData.edges.push(newEdge);
          return newEdge;
        case 'edge_get':
          return mockData.edges.find((e: any) => e.id === args?.id) || null;
        case 'edge_update':
          const edge = mockData.edges.find((e: any) => e.id === args?.id);
          if (edge) { edge.label = args?.label || ''; edge.from = args?.from_node || 0; edge.to = args?.to_node || 0; }
          return edge;
        case 'edge_delete':
          mockData.edges = mockData.edges.filter((e: any) => e.id !== args?.id);
          return 'deleted';
        case 'schema_get':
          return mockData.schema;
        case 'nql_execute': {
          const query = (args?.query || '').trim().toUpperCase();
          if (query.includes('COUNT') && query.includes('NODE')) {
            return { success: true, message: `Found ${mockData.nodes.length} nodes`, data: { nodes: mockData.nodes, edges: [] } };
          }
          if (query.includes('COUNT') && query.includes('EDGE')) {
            return { success: true, message: `Found ${mockData.edges.length} edges`, data: { nodes: [], edges: mockData.edges } };
          }
          if (query.includes('MATCH')) {
            return { success: true, message: `Found ${mockData.nodes.length} nodes and ${mockData.edges.length} edges`, data: { nodes: mockData.nodes, edges: mockData.edges } };
          }
          return { success: true, message: `Query executed`, data: { nodes: mockData.nodes.slice(0, 5), edges: mockData.edges.slice(0, 5) } };
        }
        case 'log_error':
          return 'logged';
        default:
          return null;
      }
    };

    (window as any).__TAURI_INTERNALS__ = {
      invoke: async (cmd: string, args: any, options?: any) => {
        const callback = options?.callback;
        if (callback) {
          callbackCounter++;
          callbacks.set(callbackCounter, callback);
          const result = await tauriInvoke(cmd, args);
          const cb = callbacks.get(callbackCounter);
          if (cb) cb(result);
          return callbackCounter;
        }
        return tauriInvoke(cmd, args);
      },
      transformCallback: (cb: Function, once = true) => {
        callbackCounter++;
        callbacks.set(callbackCounter, { cb, once });
        return callbackCounter;
      },
    };

    (window as any).__TAURI__ = {
      invoke: (window as any).__TAURI_INTERNALS__.invoke,
    };

    (window as any).__TAURI_OS_PLUGIN_INTERNALS__ = {
      invoke: (window as any).__TAURI_INTERNALS__.invoke,
    };
  });
}

export const test = base.extend<{ injectMock: void }>({
  injectMock: [async ({ page }, use) => {
    await injectTauriMock(page);
    await use();
  }, { auto: true }],
});

export { expect };
