import { Component, For, createSignal, Show } from "solid-js";
import { setActiveView, setActiveDb, databases, nodes, edges, setNodes, setEdges, setSchema } from "../../stores/app";
import { nodeList, edgeList, schemaGet } from "../../lib/api";
import { showTour } from "../onboarding/GuidedTour";
import ConnectionWizard from "../onboarding/ConnectionWizard";
import { sourceOptions } from "../onboarding/ConnectionWizard";
import "./HomeView.css";

interface DemoCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  items: number;
  connections: number;
  questions: string[];
}

const demoCards: DemoCard[] = [
  {
    id: "health-patterns",
    icon: "🏥",
    title: "Health Patterns",
    description: "Track symptoms, triggers, and how events affect your wellbeing. Discover patterns between sleep, stress, and how you feel.",
    items: 11,
    connections: 16,
    questions: [
      "What triggers fatigue?",
      "Show me all symptoms",
      "How is caffeine connected?",
    ],
  },
  {
    id: "project-management",
    icon: "📋",
    title: "Project Management",
    description: "See how team members, tasks, and tools connect. Understand dependencies and who owns what in your projects.",
    items: 13,
    connections: 14,
    questions: [
      "What tasks are blocked?",
      "Show me all team members",
      "Which tools are being used?",
    ],
  },
];

const HomeView: Component = () => {
  const [isWizardOpen, setIsWizardOpen] = createSignal(false);

  const loadDb = async (dbId: string) => {
    setActiveDb(dbId);
    const n = await nodeList(dbId);
    setNodes(n);
    const e = await edgeList(dbId);
    setEdges(e);
    const s = await schemaGet(dbId);
    setSchema(s);
    setActiveView("graph");
  };

  const handleQuestion = async (dbId: string, question: string) => {
    await loadDb(dbId);
    setActiveView("nql");
  };

  const handleWizardComplete = (dbName: string) => {
    loadDb(dbName);
  };

  // Stats from current database
  const currentNodes = nodes().length;
  const currentEdges = edges().length;
  const hasData = currentNodes > 0;

  return (
    <div class="home-view">
      {/* Welcome section */}
      <div class="welcome-section">
        <h1 class="welcome-title">Welcome to SensibleDB</h1>
        <p class="welcome-subtitle">
          Explore your data through connections. Ask questions, find patterns, and generate insights — no database expertise required.
        </p>
        <div class="welcome-actions">
          <button class="welcome-btn primary" onClick={showTour}>
            🎯 Take a Tour
          </button>
          <button class="welcome-btn secondary" onClick={() => setIsWizardOpen(true)}>
            📁 Connect Your Data
          </button>
        </div>
      </div>

      {/* Quick stats */}
      {hasData && (
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">{currentNodes}</span>
            <span class="stat-label">Items</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{currentEdges}</span>
            <span class="stat-label">Connections</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{databases().length}</span>
            <span class="stat-label">Databases</span>
          </div>
        </div>
      )}

      <div class="section">
        <h2 class="section-title">Connect Your Data</h2>
        <p class="section-desc">
          Import your data from various sources and let SensibleDB organize it into a knowledge graph.
        </p>
        <div class="connect-card">
          <div class="connect-header">
            <span class="connect-icon">🔗</span>
            <div class="connect-info">
              <h3 class="connect-title">Import your data</h3>
              <p class="connect-desc">Drag & drop files, or connect a data source</p>
            </div>
          </div>
          <div class="connect-sources">
            <For each={sourceOptions}>
              {(source) => (
                <button class="connect-source" onClick={() => setIsWizardOpen(true)}>
                  <span class="connect-source-icon">{source.icon}</span>
                  <span class="connect-source-label">{source.label}</span>
                </button>
              )}
            </For>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Try a Demo Database</h2>
        <p class="section-desc">
          Explore pre-loaded examples to see how SensibleDB works. Click a card to start exploring.
        </p>
        <div class="demo-grid">
          <For each={demoCards}>
            {(demo) => (
              <div class="demo-card">
                <div class="demo-header">
                  <span class="demo-icon">{demo.icon}</span>
                  <div class="demo-info">
                    <h3 class="demo-title">{demo.title}</h3>
                    <div class="demo-stats">
                      <span class="badge blue">{demo.items} items</span>
                      <span class="badge green">{demo.connections} connections</span>
                    </div>
                  </div>
                </div>
                <p class="demo-desc">{demo.description}</p>
                <button class="demo-btn" onClick={() => loadDb(demo.id)}>
                  Explore →
                </button>
                <div class="demo-questions">
                  <span class="demo-questions-label">Try asking:</span>
                  <For each={demo.questions}>
                    {(q) => (
                      <button class="demo-question" onClick={() => handleQuestion(demo.id, q)}>
                        "{q}"
                      </button>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Getting started tips */}
      <div class="section">
        <h2 class="section-title">Getting Started</h2>
        <div class="tips-grid">
          <div class="tip-card">
            <span class="tip-icon">🔗</span>
            <h3>Explore the Graph</h3>
            <p>See how your data connects. Click items to see details, drag to rearrange, scroll to zoom.</p>
          </div>
          <div class="tip-card">
            <span class="tip-icon">💬</span>
            <h3>Ask Questions</h3>
            <p>Use the Chat view to ask about your data in plain English. No query language needed.</p>
          </div>
          <div class="tip-card">
            <span class="tip-icon">📊</span>
            <h3>Generate Reports</h3>
            <p>Create summaries of your data for any time period. Export and share with your team.</p>
          </div>
        </div>
      </div>

      <ConnectionWizard isOpen={isWizardOpen()} onClose={() => setIsWizardOpen(false)} onComplete={handleWizardComplete} />
    </div>
  );
};

export default HomeView;
