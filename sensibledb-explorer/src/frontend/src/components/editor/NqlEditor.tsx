import { Component, createSignal, onMount, Show, For } from "solid-js";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { nqlExecute } from "../../lib/api";
import { activeDb } from "../../stores/app";
import type { NqlResult } from "../../types";
import "./NqlEditor.css";

interface SampleQuery {
  label: string;
  tooltip: string;
  query: string;
  db?: string;
}

const sampleQueries: SampleQuery[] = [
  { label: "All Nodes", tooltip: "Show all nodes and edges", query: "MATCH (n) RETURN n" },
  { label: "Find People", tooltip: "Find all Person nodes", query: "MATCH (n:Person) RETURN n" },
  { label: "Find Symptoms", tooltip: "Find all Symptom nodes", query: "MATCH (n:Symptom) RETURN n" },
  { label: "Fatigue Triggers", tooltip: "Find edges connected to Fatigue", query: "MATCH (n:Fatigue)-[r]->(m) RETURN n, r, m" },
  { label: "Count Nodes", tooltip: "Count total nodes", query: "COUNT nodes" },
  { label: "Count Edges", tooltip: "Count total edges", query: "COUNT edges" },
  { label: "Project Tasks", tooltip: "Find all Task nodes", query: "MATCH (n:Task) RETURN n" },
  { label: "Task Dependencies", tooltip: "Find which tasks block others", query: "MATCH (n)-[r:BLOCKS]->(m) RETURN n, r, m" },
  { label: "Team Members", tooltip: "Find all people", query: "MATCH (n:Person) RETURN n" },
  { label: "Tools Used", tooltip: "Find all tools", query: "MATCH (n:Tool) RETURN n" },
];

const NqlEditor: Component = () => {
  let editorRef: HTMLDivElement | undefined;
  const [query, setQuery] = createSignal("");
  const [result, setResult] = createSignal<NqlResult | null>(null);
  const [isRunning, setIsRunning] = createSignal(false);
  let editor: EditorView | undefined;

  onMount(() => {
    if (!editorRef) return;
    editor = new EditorView({
      state: EditorState.create({
        doc: "// Select a sample query below or write your own\n// Supported: MATCH, GET, FIND, COUNT\n",
        extensions: [
          basicSetup,
          EditorView.theme({
            "&": { fontSize: "14px" },
            ".cm-editor": { background: "#1e293b" },
            ".cm-gutters": { background: "#0f172a", border: "none" },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setQuery(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: editorRef,
    });
  });

  const handleRun = async () => {
    if (!activeDb() || !query()) return;
    setIsRunning(true);
    try {
      const res = await nqlExecute(activeDb()!, query());
      setResult(res);
    } catch (e: any) {
      setResult({ success: false, message: String(e), data: null });
    } finally {
      setIsRunning(false);
    }
  };

  const loadSample = (sample: SampleQuery) => {
    if (editor) {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: sample.query },
      });
    }
    setQuery(sample.query);
    setResult(null);
  };

  return (
    <div class="nql-editor">
      <div class="editor-header">
        <h2>NQL Query Editor</h2>
        <button onClick={handleRun} disabled={isRunning()}>
          {isRunning() ? "Running..." : "▶ Run Query"}
        </button>
      </div>

      <div class="sample-queries">
        <h3>Sample Queries</h3>
        <div class="sample-grid">
          <For each={sampleQueries}>
            {(sample) => (
              <button
                class="sample-btn"
                title={sample.tooltip}
                onClick={() => loadSample(sample)}
              >
                {sample.label}
              </button>
            )}
          </For>
        </div>
      </div>

      <div ref={editorRef!} class="editor-container" />
      <Show when={result()}>
        {(r) => (
          <div classList={{ "result-panel": true, error: !r().success }}>
            <div class="result-header">
              <span class={r().success ? "success" : "error"}>
                {r().success ? "✓" : "✗"} {r().message}
              </span>
            </div>
            <pre>{JSON.stringify(r().data, null, 2)}</pre>
          </div>
        )}
      </Show>
    </div>
  );
};

export default NqlEditor;
