import { Component, createSignal, createEffect } from "solid-js";
import { activeDb, nodes, edges } from "../../stores/app";
import "./ReportView.css";

const ReportView: Component = () => {
  const [period, setPeriod] = createSignal<"all" | "week" | "month">("all");
  const [copiedToast, setCopiedToast] = createSignal(false);
  const [shareCopied, setShareCopied] = createSignal(false);

  const nodeCount = nodes().length;
  const edgeCount = edges().length;

  const nodeTypes = new Set(nodes().map(n => n.label.split(":")[0]));
  const edgeTypes = new Set(edges().map(e => e.label));

  const connectionCount = new Map<number, number>();
  edges().forEach(e => {
    connectionCount.set(e.from, (connectionCount.get(e.from) || 0) + 1);
    connectionCount.set(e.to, (connectionCount.get(e.to) || 0) + 1);
  });
  const mostConnected = [...connectionCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const getNodeLabel = (id: number) => {
    return nodes().find(n => n.id === id)?.label || `ID: ${id}`;
  };

  const typeBreakdown = Array.from(nodeTypes).map(type => {
    const count = nodes().filter(n => n.label.startsWith(type)).length;
    const pct = nodeCount > 0 ? Math.round((count / nodeCount) * 100) : 0;
    return { type, count, pct };
  });

  const periodLabel = () => {
    switch (period()) {
      case "week": return "Last 7 Days";
      case "month": return "Last 30 Days";
      default: return "All Time";
    }
  };

  const showTimeNotice = () => period() !== "all";

  const generateReport = (): string => {
    const now = new Date().toLocaleString();
    const db = activeDb() || "Not connected";

    const lines: string[] = [];
    lines.push("SensibleDB Summary Report");
    lines.push(`Generated: ${now}`);
    lines.push(`Period: ${periodLabel()}`);
    lines.push(`Database: ${db}`);
    lines.push("");
    lines.push("── Overview ──");
    lines.push(`Total Items: ${nodeCount}`);
    lines.push(`Total Connections: ${edgeCount}`);
    lines.push(`Item Types: ${nodeTypes.size} (${Array.from(nodeTypes).join(", ")})`);
    lines.push(`Relationship Types: ${edgeTypes.size} (${Array.from(edgeTypes).join(", ")})`);
    lines.push("");
    lines.push("── Key Findings ──");

    if (mostConnected.length > 0) {
      lines.push(`• ${getNodeLabel(mostConnected[0][0])} is the most connected with ${mostConnected[0][1]} connections`);
    }
    lines.push(`• Your data contains ${nodeTypes.size} different types: ${Array.from(nodeTypes).join(", ")}`);
    lines.push(`• ${edgeTypes.size} types of relationships connect your items: ${Array.from(edgeTypes).join(", ")}`);
    lines.push("");

    if (mostConnected.length > 0) {
      lines.push("── Most Connected Items ──");
      mostConnected.forEach(([id, count], i) => {
        lines.push(`${i + 1}. ${getNodeLabel(id)} — ${count} connections`);
      });
      lines.push("");
    }

    lines.push("── Item Breakdown by Type ──");
    typeBreakdown.forEach(({ type, count, pct }) => {
      lines.push(`${type}: ${count} items (${pct}%)`);
    });

    return lines.join("\n");
  };

  const showCopied = () => {
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const showShareCopied = () => {
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const copyReport = async () => {
    const text = generateReport();
    try {
      await navigator.clipboard.writeText(text);
      showCopied();
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showCopied();
    }
  };

  const downloadTxt = () => {
    const text = generateReport();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensibledb-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    window.print();
  };

  const shareReport = async () => {
    const report = generateReport();
    const shareText = `📊 SensibleDB Report (${periodLabel()})\n\n${report}\n\nGenerated with SensibleDB Explorer`;
    try {
      await navigator.clipboard.writeText(shareText);
      showShareCopied();
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showShareCopied();
    }
  };

  return (
    <div class="report-view">
      <div class="report-header">
        <h1>Summary Report</h1>
        <div class="report-controls">
          <select value={period()} onChange={(e) => setPeriod(e.currentTarget.value as "all" | "week" | "month")}>
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {showTimeNotice() && (
        <div class="time-notice">
          Time-based filtering requires timestamp properties. All data shown.
        </div>
      )}

      <div class="metric-row">
        <div class="metric-card">
          <span class="metric-value">{nodeCount}</span>
          <span class="metric-label">Total Items</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{edgeCount}</span>
          <span class="metric-label">Connections</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{nodeTypes.size}</span>
          <span class="metric-label">Item Types</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{edgeTypes.size}</span>
          <span class="metric-label">Relationship Types</span>
        </div>
      </div>

      <div class="report-section">
        <h2>Key Findings</h2>
        <div class="findings-list">
          {mostConnected.length > 0 && (
            <div class="finding">
              <span class="finding-icon">🔗</span>
              <div class="finding-text">
                <strong>{getNodeLabel(mostConnected[0][0])}</strong> is the most connected item with {mostConnected[0][1]} connections
              </div>
            </div>
          )}
          <div class="finding">
            <span class="finding-icon">📊</span>
            <div class="finding-text">
              Your data contains {nodeTypes.size} different types: {Array.from(nodeTypes).join(", ")}
            </div>
          </div>
          <div class="finding">
            <span class="finding-icon">🔀</span>
            <div class="finding-text">
              {edgeTypes.size} types of relationships connect your items: {Array.from(edgeTypes).join(", ")}
            </div>
          </div>
        </div>
      </div>

      {mostConnected.length > 0 && (
        <div class="report-section">
          <h2>Most Connected Items</h2>
          <div class="connected-list">
            {mostConnected.map(([id, count], i) => (
              <div class="connected-item">
                <span class="connected-rank">{i + 1}.</span>
                <span class="connected-name">{getNodeLabel(id)}</span>
                <span class="connected-count">{count} connections</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div class="report-section">
        <h2>Item Breakdown by Type</h2>
        <div class="type-breakdown">
          {typeBreakdown.map(({ type, count, pct }) => (
            <div class="type-row">
              <span class="type-name">{type}</span>
              <div class="type-bar">
                <div class="type-fill" style={{ width: `${pct}%` }}></div>
              </div>
              <span class="type-count">{count} ({pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div class="export-section">
        <h3>Export</h3>
        <div class="export-buttons">
          <button class="export-btn secondary" onClick={copyReport}>
            📋 Copy as text
          </button>
          <button class="export-btn secondary" onClick={downloadTxt}>
            📥 Download as .txt
          </button>
          <button class="export-btn secondary" onClick={downloadPdf}>
            🖨️ Download as PDF
          </button>
        </div>
      </div>

      <div class="share-section">
        <h3>Share</h3>
        <button class="export-btn primary" onClick={shareReport}>
          🔗 Share link
        </button>
      </div>

      {copiedToast() && (
        <div class="toast-notification">
          ✓ Link copied!
        </div>
      )}

      {shareCopied() && (
        <div class="toast-notification">
          ✓ Link copied!
        </div>
      )}
    </div>
  );
};

export default ReportView;
