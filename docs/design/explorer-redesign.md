# SensibleDB Explorer — UI/UX Redesign Design Document
## Logo & Brand Identity

### Logo Concept

```
┌─────────────────────────────────────────┐
│                                         │
│    ◆──◆──◆                              │
│    │  ╱  ╲  │                           │
│    ◆ ◆    ◆ ◆                           │
│    │  ╲  ╱  │                           │
│    ◆──◆──◆                              │
│                                         │
│    SensibleDB                           │
│    Explore your data's connections      │
│                                         │
└─────────────────────────────────────────┘
```

**Design Rationale**:
- **Interconnected nodes** (◆) represent the graph database core
- **Central hub** represents the AI/insight layer connecting everything
- **Clean geometric shapes** convey precision and reliability
- **Symmetry** suggests balance between complexity and simplicity

### Color Palette (Brand)

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-primary` | `#6366f1` (Indigo) | Primary brand color, logo, key actions |
| `--brand-secondary` | `#8b5cf6` (Violet) | Gradients, accents |
| `--brand-accent` | `#06b6d4` (Cyan) | Highlights, data points |
| `--brand-success` | `#10b981` (Emerald) | Positive states, growth |
| `--brand-warning` | `#f59e0b` (Amber) | Attention, insights |
| `--brand-danger` | `#ef4444` (Red) | Errors, alerts |

### Logo Variants

**Full Logo (Header)**:
```
◆ SensibleDB
```

**Icon Only (Favicon, small spaces)**:
```
◆
```

**Wordmark (Marketing)**:
```
SensibleDB
```

### Typography (Brand)

- **Headings**: Inter or SF Pro Display — clean, modern, highly legible
- **Body**: Inter or System UI — matches headings, optimized for screens
- **Code/Monospace**: JetBrains Mono or SF Mono — for queries, technical content

### Brand Voice

| Attribute | Description | Example |
|-----------|-------------|---------|
| **Clear** | Plain language, no jargon | "Items" not "Nodes" |
| **Helpful** | Proactive guidance | "Try asking: What patterns do you see?" |
| **Confident** | Direct answers, transparent reasoning | "I found 3 connections..." |
| **Warm** | Conversational, not robotic | "Here's what I discovered..." |

---



## 1. Vision & Principles

**Vision**: A data exploration tool that anyone can use — not just database experts. Users connect data sources, the app organizes information into a knowledge graph using local AI, and users explore through natural conversation.

**Design Principles**:
1. **Progressive Disclosure** — Show only what's needed now. Reveal complexity on demand.
2. **Value in 60 Seconds** — Users must see something useful within the first minute.
3. **Plain Language First** — Technical terms appear only after concepts are understood.
4. **Conversation, Not Commands** — Users ask questions, the app explains and answers.
5. **Visual Before Tabular** — Show relationships spatially, then offer data views.
6. **Transparency** — Always show "how we got this" for every result.

---

## 2. Target User

**Persona**: "Curious Professional" — not a data engineer, not a DBA. Someone who:
- Has data (CSVs, notes, emails, documents) and wants to find patterns
- Doesn't know graph theory, vectors, or embeddings
- Wants to ask "What's connected to X?" in plain English
- Needs to generate reports or summaries for their team

---

## 3. Information Architecture

### 3.1 Layout (Single-Page Application)

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (48px)                                                  │
│  [🔷 SensibleDB]  [Search: "Ask your data anything..."]    [⚙] [👤]   │
├──────────┬────────────────────────────────────────────┬─────────────┤
│          │                                            │             │
│ SIDEBAR  │           MAIN CANVAS                      │ INSPECTOR   │
│ (240px)  │           (flex: 1)                        │ (320px)     │
│          │                                            │             │
│ • Home   │  ┌──────────────────────────────────────┐  │ • Details   │
│ • Graph  │  │                                      │  │ • Related   │
│ • Chat   │  │   [Visualization Area]               │  │ • Actions   │
│ • Report │  │                                      │  │             │
│          │  │   Nodes as cards, edges as lines     │  │ ┌─────────┐ │
│ ──────── │  │   Draggable, zoomable, pannable      │  │ │ AI Chat │ │
│          │  └──────────────────────────────────────┘  │ │ Panel   │ │
│ DATA     │                                            │ └─────────┘ │
│ SOURCES  │  ┌──────────────────────────────────────┐  │             │
│ [Add +]  │  │  QUERY BAR (64px)                     │  │             │
│ • Demo 1 │  │  💬 [Type a question...]      [Ask ▶] │  │             │
│ • Demo 2 │  │  Suggestions: "What data do I have?"  │  │             │
│          │  └──────────────────────────────────────┘  │             │
├──────────┴────────────────────────────────────────────┴─────────────┤
│  STATUS BAR (28px): "Connected to health-patterns • 11 items • 16 links" │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 View Modes

| Mode | Purpose | What User Sees |
|------|---------|----------------|
| **Home** | Onboarding & overview | Welcome card, connected sources, quick actions, guided tour |
| **Graph** | Visual exploration | Interactive node-link diagram with filtering |
| **Chat** | Natural language queries | Conversational interface with streaming responses |
| **Report** | Time-based summaries | Metric cards, trend charts, exportable narratives |

---

## 4. Detailed Screen Specifications

### 4.1 Home View (Onboarding & Overview)

**Purpose**: First screen users see. Gets them to value in <60 seconds.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Welcome to SensibleDB Explorer                    │
│              Explore your data through connections          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ 🚀 Quick Start  │  │ 📚 Learn More   │                  │
│  │                 │  │                 │                  │
│  │ Try a demo      │  │ What is a       │                  │
│ │ database          │  │ knowledge graph?│                  │
│  │                 │  │                 │                  │
│  │ [Open Demo →]   │  │ [Watch Tour →]  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔗 Connect Your Data                                │   │
│  │                                                     │   │
│  │ [📁 CSV/JSON] [📧 Email] [📝 Notes] [🗄️ Database]  │   │
│  │                                                     │   │
│  │ Drag & drop files here, or connect a data source    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💡 Try asking:                                      │   │
│  │ "What patterns do you see?"                         │   │
│  │ "Show me the most connected items"                  │   │
│  │ "Summarize what happened this week"                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Demo Database Cards**:
```
┌──────────────────────────────────┐
│ 🏥 Health Patterns               │
│ Track symptoms, triggers, and    │
│ how events affect your wellbeing │
│                                  │
│ 11 items • 16 connections        │
│ [Explore →]                      │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 📋 Project Management            │
│ See how team members, tasks,     │
│ and tools connect in your work   │
│                                  │
│ 13 items • 14 connections        │
│ [Explore →]                      │
└──────────────────────────────────┘
```

### 4.2 Graph View (Visual Exploration)

**Purpose**: Interactive visualization of the knowledge graph.

**Key Features**:
- **Nodes as cards**: Each node shows an icon, label, and type badge
- **Edges as labeled lines**: Relationship type shown on hover
- **Pan & Zoom**: Scroll to zoom, drag to pan, drag nodes to rearrange
- **Click to inspect**: Clicking a node opens the Inspector panel
- **Filter by type**: Sidebar checkboxes to show/hide node types
- **Search**: Type to highlight matching nodes

**Node Card Design**:
```
┌─────────────────────┐
│  🧑 Person          │
│  Alex               │
│  ─────────────────  │
│  5 connections      │
│  [View Details →]   │
└─────────────────────┘
```

**Inspector Panel** (right sidebar, opens on node click):
```
┌─────────────────────────────┐
│ 🧑 Person: Alex             │
│                             │
│ ┌─────────────────────────┐ │
│ │ ID: 1                   │ │
│ │ Type: Person            │ │
│ │ Connections: 5          │ │
│ └─────────────────────────┘ │
│                             │
│ ── Connected To ─────────── │
│                             │
│ 🏢 Office (WORKS_AT)        │
│ 🏠 Home (LIVES_AT)          │
│ 😴 PoorSleep (EXPERIENCED)  │
│ 😤 StressfulMeeting (EXP)   │
│ ✈️ Travel (EXPERIENCED)     │
│                             │
│ [Ask about Alex →]          │
└─────────────────────────────┘
```

### 4.3 Chat View (Natural Language Queries)

**Purpose**: Users ask questions in plain English, get answers with explanations.

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  Chat with your data                                │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🤖 I found 11 items and 16 connections in     │ │
│  │    your health patterns database. Here's what │ │
│  │    I see:                                     │ │
│  │                                               │ │
│  │ • 2 people tracked their health               │ │
│  │ • 3 types of events (meetings, sleep, travel) │ │
│  │ • 3 symptoms were recorded                    │ │
│  │ • 1 medication was used                       │ │
│  │                                               │ │
│  │ The most connected item is "Fatigue" with     │ │
│  │ 4 connections.                                │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 💬 What would you like to know?               │ │
│  │                                               │ │
│  │ [____________________________________] [Send] │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Suggestions:                                       │
│  [What causes fatigue?] [Show me patterns]          │
│  [Summarize this week] [Export as report]           │
└─────────────────────────────────────────────────────┘
```

**Query Response Format**:
```
┌─────────────────────────────────────────────────────┐
│ 👤 What triggers fatigue?                           │
├─────────────────────────────────────────────────────┤
│ 🤖 I found 2 events connected to fatigue:           │
│                                                     │
│ 1. 😴 Poor Sleep — 0.5 days before, 90% confidence  │
│    "Short sleep duration"                           │
│                                                     │
│ 2. 😤 Stressful Meeting — 1 day before, 80% conf.   │
│    "Stress trigger"                                 │
│                                                     │
│ Both events happened before fatigue episodes.       │
│ Poor sleep appears to be the stronger trigger.      │
│                                                     │
│ [Show on graph] [Ask follow-up] [How did I get this?]│
└─────────────────────────────────────────────────────┘
```

### 4.4 Report View (Time-Based Summaries)

**Purpose**: Generate shareable summaries for a time period.

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  Summary Report                          [Export 📥] │
│                                                     │
│  Period: [Last 7 days ▼]  [Generate ▶]             │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │    11    │  │    16    │  │     5    │         │
│  │  Items   │  │  Links   │  │  Types   │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  ── Key Findings ───────────────────────────────── │
│                                                     │
│  • Fatigue is the most connected symptom (4 links) │
│  • Poor sleep and stress are common triggers       │
│  • Caffeine is used to manage fatigue symptoms     │
│                                                     │
│  ── Most Active Connections ────────────────────── │
│                                                     │
│  Fatigue ← Poor Sleep (TRIGGERED)                  │
│  Fatigue ← Stressful Meeting (TRIGGERED)           │
│  Fatigue → Caffeine (MANAGED_WITH)                 │
│                                                     │
│  [Copy as text] [Download PDF] [Share link]        │
└─────────────────────────────────────────────────────┘
```

---

## 5. Data Source Connection Flow

### 5.1 Connection Wizard (4 Steps)

```
Step 1: Choose Source Type
┌─────────────────────────────────────────────────────┐
│  Where is your data?                                │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 📁 File  │ │ 🗄️ DB    │ │ 📧 Email │           │
│  │ CSV, JSON│ │ Postgres │ │ Gmail    │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 📝 Notes │ │ 🌐 Web   │ │ 💬 Chat  │           │
│  │ Markdown │ │ URL      │ │ Slack    │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  [← Back]                    [Next →]               │
└─────────────────────────────────────────────────────┘

Step 2: Configure Connection
┌─────────────────────────────────────────────────────┐
│  Connect your files                                 │
│                                                     │
│  Drag & drop files here                             │
│  or [Browse files...]                               │
│                                                     │
│  Selected:                                          │
│  📄 health-data.csv (2.3 MB)           [✕]         │
│  📄 symptoms.json (156 KB)             [✕]         │
│                                                     │
│  [← Back]                    [Next →]               │
└─────────────────────────────────────────────────────┘

Step 3: Preview & Confirm
┌─────────────────────────────────────────────────────┐
│  What we found                                      │
│                                                     │
│  📊 health-data.csv                                 │
│  • 3 columns: date, symptom, severity               │
│  • 47 rows                                          │
│  • Detected types: Date, Text, Number               │
│                                                     │
│  📊 symptoms.json                                   │
│  • 2 fields: name, description                      │
│  • 12 entries                                       │
│  • Detected types: Text, Text                       │
│                                                     │
│  Does this look right?                              │
│  [Edit mappings]                                    │
│                                                     │
│  [← Back]              [Import Data ▶]              │
└─────────────────────────────────────────────────────┘

Step 4: Processing
┌─────────────────────────────────────────────────────┐
│  Organizing your data...                            │
│                                                     │
│  ████████████████░░░░  78%                          │
│                                                     │
│  • Extracting entities... ✓                         │
│  • Finding relationships... ✓                       │
│  • Creating connections... ⏳                       │
│  • Building search index...                         │
│                                                     │
│  This may take a moment for large datasets.         │
└─────────────────────────────────────────────────────┘
```

---

## 6. Technical Concept Explanations

### 6.1 Glossary (User-Facing Terms)

| Technical Term | User-Facing Term | Explanation |
|---------------|-----------------|-------------|
| Node | Item | "A thing in your data — a person, event, symptom, etc." |
| Edge | Connection | "How two items are related" |
| Label/Type | Type | "What kind of item this is" |
| Vector Embedding | Similarity | "Items that are alike are grouped together" |
| Graph Traversal | Follow connections | "Starting from one item, see what it connects to" |
| NQL Query | Ask a question | "A way to ask your data questions" |
| Schema | Structure | "The blueprint of how your data is organized" |

### 6.2 Contextual Tooltips

Every technical term gets a `?` icon that shows:
```
┌─────────────────────────────────────┐
│ What is a connection?               │
│                                     │
│ Connections show how items relate   │
│ to each other. For example:         │
│                                     │
│ "Poor Sleep" → TRIGGERED → "Fatigue"│
│                                     │
│ This means poor sleep happened      │
│ before and may have caused fatigue. │
│                                     │
│ [Learn more →]                      │
└─────────────────────────────────────┘
```

---

## 7. Design System

### 7.1 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0f172a` | Main background |
| `--bg-secondary` | `#1e293b` | Panels, cards |
| `--bg-tertiary` | `#334155` | Inputs, hover states |
| `--text-primary` | `#f1f5f9` | Primary text |
| `--text-secondary` | `#94a3b8` | Secondary text, labels |
| `--text-muted` | `#64748b` | Hints, placeholders |
| `--accent` | `#3b82f6` | Primary actions, links |
| `--success` | `#22c55e` | Positive indicators |
| `--danger` | `#ef4444` | Errors, destructive |
| `--warning` | `#f59e0b` | Warnings, attention |

### 7.2 Typography

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-xs` | 11px | 400 | Captions, badges |
| `--text-sm` | 13px | 400 | Body text, labels |
| `--text-base` | 14px | 400 | Default text |
| `--text-lg` | 16px | 500 | Section headers |
| `--text-xl` | 20px | 600 | Page titles |

### 7.3 Spacing Scale

4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### 7.4 Border Radius

- Small: 4px (badges, small buttons)
- Medium: 6px (inputs, buttons)
- Large: 8px (cards, panels)
- XL: 12px (modals, large containers)

---

## 8. Component Specifications

### 8.1 Query Bar (Reusable)

```
┌──────────────────────────────────────────────────────────┐
│ 💬 [Ask a question about your data...]          [Ask ▶] │
│                                                          │
│ Suggestions: "Show me all people" • "What's connected   │
│ to fatigue?" • "Count all items"                         │
└──────────────────────────────────────────────────────────┘
```

**Behavior**:
- Auto-suggests based on current database content
- Shows interpreted query before executing: "I understood: Find all Person items"
- Supports follow-up questions in context

### 8.2 Node Card (Graph View)

```
┌─────────────────────┐
│  [icon] [Type]      │
│  [Label]            │
│  ─────────────────  │
│  [N] connections    │
│  [View →]           │
└─────────────────────┘
```

**States**: Default, Hover (glow), Selected (highlighted border), Dragging (shadow)

### 8.3 Connection Line (Graph View)

- Default: 2px, `#475569`
- Hover: 3px, `#60a5fa`, label visible
- Selected: 3px, `#3b82f6`, label always visible

### 8.4 Chat Message

```
┌─────────────────────────────────────────────┐
│ 👤 User question                            │
├─────────────────────────────────────────────┤
│ 🤖 Answer with explanation                  │
│                                             │
│ • Key finding 1                             │
│ • Key finding 2                             │
│                                             │
│ [Show on graph] [Ask follow-up] [Explain]  │
└─────────────────────────────────────────────┘
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Design system tokens (CSS variables) ✅ started
- [ ] Consistent component styles (buttons, inputs, cards)
- [ ] Fix NQL query execution (camelCase params) ✅ done
- [ ] Graph interaction (zoom, pan, drag, select) ✅ done

### Phase 2: Home & Onboarding (Week 2)
- [ ] Home view with demo database cards
- [ ] Guided tour for first-time users
- [ ] Data source connection wizard (step 1-2)
- [ ] Contextual tooltips for technical terms

### Phase 3: Chat Interface (Week 3)
- [ ] Chat view with conversation history
- [ ] Natural language to NQL translation (local)
- [ ] Streaming response display
- [ ] Follow-up question suggestions

### Phase 4: Reports & Export (Week 4)
- [ ] Report view with metric cards
- [ ] Time period selector
- [ ] Export as text/PDF
- [ ] Share functionality

### Phase 5: Polish (Week 5)
- [ ] Animations and transitions
- [ ] Error states and empty states
- [ ] Keyboard shortcuts
- [ ] Performance optimization for large graphs

---

## 10. Migration Strategy

1. **Keep existing functionality** — All current features (node list, edge list, schema browser) remain accessible
2. **Add new views alongside** — Home, Chat, Report are new tabs in the sidebar
3. **Gradual replacement** — Old views get redesigned one at a time
4. **Feature flags** — New UI can be toggled on/off during transition

---

## 11. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to first insight | < 60 seconds | Analytics: time from launch to first query result |
| Query success rate | > 90% | % of queries that return results vs errors |
| User retention (7-day) | > 60% | Analytics: returning users / total users |
| Support tickets | < 5/week | Track user-reported issues |
| NQL usage vs Chat | < 30% NQL | Migration to natural language interface |
