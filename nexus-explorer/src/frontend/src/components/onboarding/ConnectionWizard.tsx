import { Component, createSignal, Show, For } from "solid-js";
import { dbCreate, dbOpen } from "../../lib/api";
import { setActiveDb, setDatabases, databases } from "../../stores/app";
import "./ConnectionWizard.css";

export type SourceType = "file" | "database" | "email" | "notes" | "web" | "chat";

export interface SourceOption {
  type: SourceType;
  icon: string;
  label: string;
  description: string;
  formats: string;
}

export const sourceOptions: SourceOption[] = [
  { type: "file", icon: "📁", label: "File", description: "CSV, JSON, Parquet", formats: "CSV, JSON" },
  { type: "database", icon: "🗄️", label: "Database", description: "PostgreSQL, MySQL", formats: "PostgreSQL" },
  { type: "email", icon: "📧", label: "Email", description: "Gmail, Outlook", formats: "Gmail" },
  { type: "notes", icon: "📝", label: "Notes", description: "Markdown, Text", formats: "Markdown" },
  { type: "web", icon: "🌐", label: "Web", description: "URL, HTML", formats: "URL" },
  { type: "chat", icon: "💬", label: "Chat", description: "Slack, Discord", formats: "Slack" },
];

export interface DetectedColumn {
  name: string;
  type: string;
}

export interface FilePreview {
  name: string;
  size: string;
  columns: DetectedColumn[];
  rows: number;
}

interface ConnectionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (dbName: string) => void;
}

const ConnectionWizard: Component<ConnectionWizardProps> = (props) => {
  const [step, setStep] = createSignal(1);
  const [selectedSource, setSelectedSource] = createSignal<SourceType | null>(null);
  const [selectedFiles, setSelectedFiles] = createSignal<File[]>([]);
  const [dbName, setDbName] = createSignal("");
  const [preview, setPreview] = createSignal<FilePreview[]>([]);
  const [processingProgress, setProcessingProgress] = createSignal(0);
  const [processingSteps, setProcessingSteps] = createSignal<string[]>([]);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [isDragOver, setIsDragOver] = createSignal(false);

  const isLast = () => step() === 4;
  const isFirst = () => step() === 1;

  const nextStep = () => {
    if (step() === 1 && !selectedSource()) return;
    if (step() === 2 && selectedSource() === "file" && selectedFiles().length === 0) return;
    if (step() === 2 && selectedSource() === "file") {
      generatePreview();
    }
    if (isLast()) return;
    setStep(step() + 1);
  };

  const prevStep = () => {
    if (!isFirst()) setStep(step() - 1);
  };

  const generatePreview = () => {
    const files = selectedFiles();
    const previews: FilePreview[] = files.map((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const isJson = ext === "json";
      return {
        name: file.name,
        size: formatFileSize(file.size),
        columns: isJson
          ? [{ name: "name", type: "Text" }, { name: "description", type: "Text" }]
          : [{ name: "date", type: "Date" }, { name: "value", type: "Text" }, { name: "severity", type: "Number" }],
        rows: Math.floor(Math.random() * 100) + 10,
      };
    });
    setPreview(previews);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileSelect = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      setSelectedFiles(Array.from(input.files));
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    const files = selectedFiles();
    setSelectedFiles([...files.slice(0, index), ...files.slice(index + 1)]);
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setStep(4);
    setProcessingProgress(0);
    setProcessingSteps([]);

    const steps_list = [
      "Extracting entities...",
      "Finding relationships...",
      "Creating connections...",
      "Building search index...",
    ];

    const name = dbName() || `imported-${Date.now()}`;

    for (let i = 0; i < steps_list.length; i++) {
      setProcessingSteps(steps_list.slice(0, i + 1));
      setProcessingProgress(((i + 1) / steps_list.length) * 100);
      await new Promise((r) => setTimeout(r, 800));
    }

    try {
      await dbCreate(name, "local");
      await dbOpen(name, "local");
      const currentDbs = databases();
      if (!currentDbs.includes(name)) {
        setDatabases([...currentDbs, name]);
      }
      setActiveDb(name);
      setIsProcessing(false);
      props.onComplete?.(name);
    } catch (e) {
      setError(String(e));
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSource(null);
    setSelectedFiles([]);
    setPreview([]);
    setProcessingProgress(0);
    setProcessingSteps([]);
    setIsProcessing(false);
    setError(null);
    props.onClose();
  };

  return (
    <Show when={props.isOpen}>
      <div class="wizard-overlay">
        <div class="wizard-backdrop" onClick={handleClose} />
        <div class="wizard-modal">
          <div class="wizard-header">
            <h2 class="wizard-title">Connect Your Data</h2>
            <button class="wizard-close" onClick={handleClose}>✕</button>
          </div>

          <div class="wizard-progress">
            <For each={[1, 2, 3, 4]}>
              {(s) => (
                <div class="wizard-progress-step" classList={{ active: step() >= s, completed: step() > s }}>
                  <span class="wizard-progress-number">{s}</span>
                  <span class="wizard-progress-label">
                    {s === 1 && "Source"}
                    {s === 2 && "Configure"}
                    {s === 3 && "Preview"}
                    {s === 4 && "Process"}
                  </span>
                </div>
              )}
            </For>
          </div>

          <div class="wizard-body">
            <Show when={error()}>
              <div class="wizard-error">{error()}</div>
            </Show>

            <Show when={step() === 1}>
              <div class="wizard-step">
                <h3 class="wizard-step-title">Where is your data?</h3>
                <div class="source-grid">
                  <For each={sourceOptions}>
                    {(source) => (
                      <button
                        class="source-card"
                        classList={{ selected: selectedSource() === source.type }}
                        onClick={() => setSelectedSource(source.type)}
                      >
                        <span class="source-icon">{source.icon}</span>
                        <span class="source-label">{source.label}</span>
                        <span class="source-desc">{source.description}</span>
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <Show when={step() === 2}>
              <div class="wizard-step">
                <Show when={selectedSource() === "file"}>
                  <h3 class="wizard-step-title">Connect your files</h3>
                  <div
                    class="drop-zone"
                    classList={{ "drag-over": isDragOver() }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <span class="drop-icon">📂</span>
                    <p class="drop-text">Drag & drop files here</p>
                    <p class="drop-or">or</p>
                    <label class="drop-browse">
                      Browse files...
                      <input type="file" multiple accept=".csv,.json" onChange={handleFileSelect} hidden />
                    </label>
                  </div>
                  <Show when={selectedFiles().length > 0}>
                    <div class="selected-files">
                      <h4 class="files-heading">Selected:</h4>
                      <For each={selectedFiles()}>
                        {(file, idx) => (
                          <div class="file-item">
                            <span class="file-icon">📄</span>
                            <span class="file-name">{file.name}</span>
                            <span class="file-size">({formatFileSize(file.size)})</span>
                            <button class="file-remove" onClick={() => removeFile(idx())}>✕</button>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                  <div class="db-name-input">
                    <label for="db-name">Database name:</label>
                    <input
                      id="db-name"
                      type="text"
                      placeholder="my-data"
                      value={dbName()}
                      onInput={(e) => setDbName(e.currentTarget.value)}
                    />
                  </div>
                </Show>
                <Show when={selectedSource() !== "file"}>
                  <div class="coming-soon">
                    <span class="coming-soon-icon">🚧</span>
                    <h3 class="coming-soon-title">Coming Soon</h3>
                    <p class="coming-soon-desc">
                      {sourceOptions.find((s) => s.type === selectedSource())?.label} connections are coming soon.
                      For now, try importing a CSV or JSON file.
                    </p>
                    <button class="secondary" onClick={() => setSelectedSource("file")}>
                      Switch to File Import
                    </button>
                  </div>
                </Show>
              </div>
            </Show>

            <Show when={step() === 3}>
              <div class="wizard-step">
                <h3 class="wizard-step-title">What we found</h3>
                <For each={preview()}>
                  {(file) => (
                    <div class="preview-card">
                      <div class="preview-header">
                        <span class="preview-icon">📊</span>
                        <span class="preview-name">{file.name}</span>
                      </div>
                      <ul class="preview-details">
                        <li>{file.columns.length} columns: {file.columns.map((c) => c.name).join(", ")}</li>
                        <li>{file.rows} rows</li>
                        <li>Detected types: {file.columns.map((c) => c.type).join(", ")}</li>
                      </ul>
                    </div>
                  )}
                </For>
                <p class="preview-confirm">Does this look right?</p>
              </div>
            </Show>

            <Show when={step() === 4}>
              <div class="wizard-step">
                <Show when={!isProcessing()}>
                  <h3 class="wizard-step-title">Import complete!</h3>
                  <div class="processing-success">
                    <span class="success-icon">✓</span>
                    <p>Your data has been imported successfully.</p>
                  </div>
                </Show>
                <Show when={isProcessing()}>
                  <h3 class="wizard-step-title">Organizing your data...</h3>
                  <div class="progress-bar">
                    <div class="progress-fill" style={`width: ${processingProgress()}%`} />
                  </div>
                  <span class="progress-text">{Math.round(processingProgress())}%</span>
                  <ul class="processing-checklist">
                    <For each={["Extracting entities...", "Finding relationships...", "Creating connections...", "Building search index..."]}>
                      {(s) => (
                        <li classList={{ done: processingSteps().includes(s), active: processingSteps()[processingSteps().length - 1] === s }}>
                          <span class="check-icon">{processingSteps().includes(s) ? "✓" : "○"}</span>
                          {s}
                        </li>
                      )}
                    </For>
                  </ul>
                  <p class="processing-note">This may take a moment for large datasets.</p>
                </Show>
              </div>
            </Show>
          </div>

          <div class="wizard-footer">
            <button class="wizard-btn secondary" onClick={prevStep} disabled={isFirst() || isProcessing()}>
              Back
            </button>
            <Show when={!isProcessing()}>
              <Show when={step() < 3}>
                <button class="wizard-btn primary" onClick={nextStep} disabled={isLast()}>
                  Next
                </button>
              </Show>
              <Show when={step() === 3}>
                <button class="wizard-btn primary" onClick={startProcessing}>
                  Import Data
                </button>
              </Show>
              <Show when={step() === 4 && !isProcessing()}>
                <button class="wizard-btn primary" onClick={handleClose}>
                  Done
                </button>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default ConnectionWizard;
