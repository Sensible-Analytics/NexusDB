import { Component, createSignal, For, Show, onMount, onCleanup } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import "./ModelSettings.css";

interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

interface OllamaStatus {
  available: boolean;
  url: string;
  version: string | null;
  models: OllamaModel[];
}

interface PullProgress {
  status: string;
  percent: number;
}

const recommendedModels = [
  { name: "qwen2.5-coder:3b", label: "NL-to-SQL Model" },
  { name: "nomic-embed-text", label: "Embedding Model" },
];

function formatSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`;
  }
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(0)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}

const ModelSettings: Component = () => {
  const [status, setStatus] = createSignal<OllamaStatus | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [pullingModel, setPullingModel] = createSignal<string | null>(null);
  const [pullProgress, setPullProgress] = createSignal<{ status: string; percent: number } | null>(null);
  let pollInterval: number | undefined;

  const clearPollInterval = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = undefined;
    }
  };

  onCleanup(() => {
    clearPollInterval();
  });

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<OllamaStatus>("ollama_check_status", { ollamaUrl: null });
      setStatus(result);
    } catch (e) {
      setError("Failed to connect to Ollama. Make sure Ollama is running on your system.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const pullModel = async (model: string) => {
    setPullingModel(model);
    setPullProgress({ status: "Starting download...", percent: 0 });

    try {
      await invoke("ollama_pull_model", { model, ollamaUrl: null });

      pollInterval = window.setInterval(async () => {
        try {
          const progress = await invoke<PullProgress>("ollama_check_pull_progress", { model });
          setPullProgress(progress);

          if (progress.percent >= 100 || progress.status.includes("success") || progress.status.includes("complete")) {
            clearPollInterval();
            setPullingModel(null);
            setPullProgress(null);
            await checkStatus();
          }
        } catch {
          clearPollInterval();
          setPullingModel(null);
          setPullProgress(null);
        }
      }, 500);
    } catch (e) {
      console.error("Failed to pull model:", e);
      setError(`Failed to pull model: ${String(e)}`);
      clearPollInterval();
      setPullingModel(null);
      setPullProgress(null);
    }
  };

  const isModelInstalled = (modelName: string): boolean => {
    const s = status();
    if (!s || !s.models) return false;
    return s.models.some((m) => m.name === modelName || m.name.startsWith(modelName));
  };

  const getModelSize = (modelName: string): number | null => {
    const s = status();
    if (!s || !s.models) return null;
    const model = s.models.find((m) => m.name === modelName || m.name.startsWith(modelName));
    return model ? model.size : null;
  };

  onMount(() => {
    checkStatus();
  });

  return (
    <div class="model-settings">
      <div class="settings-header">
        <h2 class="settings-title">Model Settings</h2>
        <button class="refresh-btn" onClick={checkStatus} disabled={loading()}>
          <Show when={loading()} fallback={<><span>↻</span> <span>Refresh</span></>}>
            Checking...
          </Show>
        </button>
      </div>

      <Show when={error()}>
        <div class="error-card">
          <div class="error-icon">⚠️</div>
          <p class="error-message">{error()}</p>
          <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" class="ollama-link">
            Download Ollama →
          </a>
        </div>
      </Show>

      <Show when={status()}>
        <div class="connection-status">
          <div class={`status-indicator ${status()!.available ? "available" : "unavailable"}`} />
          <span class={`status-text ${status()!.available ? "available" : "unavailable"}`}>
            <Show when={status()!.available} fallback="Ollama is not running">
              Connected to Ollama
              <Show when={status()!.version}>{" "}(v{status()!.version})</Show>
              {" "}at {status()!.url}
            </Show>
          </span>
          <Show when={!status()!.available}>
            <a class="ollama-link" href="https://ollama.com" target="_blank" rel="noopener noreferrer">
              Install Ollama →
            </a>
          </Show>
        </div>

        <Show when={status()!.available}>
          <div class="section">
            <h3 class="section-title">Recommended Models</h3>
            <div class="recommended-grid">
              <For each={recommendedModels}>
                {(item) => (
                  <div class="model-card">
                    <div class="model-info">
                      <span class="model-name">{item.name}</span>
                      <span class="model-label">{item.label}</span>
                      <Show when={isModelInstalled(item.name)}>
                        <span class="model-size">Installed ({formatSize(getModelSize(item.name) || 0)})</span>
                      </Show>
                    </div>
                    <Show
                      when={pullingModel() === item.name}
                      fallback={
                        <Show
                          when={isModelInstalled(item.name)}
                          fallback={
                            <button
                              class="download-btn"
                              onClick={() => pullModel(item.name)}
                              disabled={pullingModel() !== null}
                            >
                              Download
                            </button>
                          }
                        >
                          <span class="installed-badge">✓ Installed</span>
                        </Show>
                      }
                    >
                      <div class="pull-progress-wrapper">
                        <div class="progress-text">{pullProgress()?.status || "Pulling..."}</div>
                        <div class="progress-bar">
                          <div class="progress-fill" style={{ width: `${pullProgress()?.percent || 0}%` }} />
                        </div>
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </div>

          <Show when={status()!.models && status()!.models.length > 0}>
            <div class="section">
              <h3 class="section-title">Installed Models ({status()!.models.length})</h3>
              <div class="model-list">
                <For each={status()!.models}>
                  {(model) => (
                    <div class="model-item">
                      <span class="model-item-name">{model.name}</span>
                      <span class="model-item-size">{formatSize(model.size)}</span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>

          <Show when={!status()!.models || status()!.models.length === 0}>
            <div class="empty-models">
              No models installed. Download a model to get started.
            </div>
          </Show>
        </Show>
      </Show>

      <Show when={!error() && !status() && loading()}>
        <div class="loading-state">
          <div class="loading-spinner" />
          <p>Checking Ollama status...</p>
        </div>
      </Show>

      <Show when={!error() && !status() && !loading()}>
        <div class="connection-status">
          <div class="status-indicator unavailable" />
          <span class="status-text unavailable">
            Unable to connect to Ollama
          </span>
        </div>
      </Show>
    </div>
  );
};

export default ModelSettings;