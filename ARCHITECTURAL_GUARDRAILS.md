# Architectural Guardrails

> **Purpose**: This document defines the non-negotiable architectural principles, technology choices, and design constraints for SensibleDB. All contributors and AI agents must adhere to these guardrails when proposing or implementing changes.

---

## 1. System Identity

**SensibleDB is an Embedded Graph-Vector Database** built in Rust, designed to unify the data layer for AI applications. It eliminates the need for separate application DBs, vector DBs, graph DBs, and application layers.

---

## 2. Core Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Language** | Rust | Memory safety, zero-cost abstractions, ultra-low latency |
| **Storage Engine** | LMDB (Lightning Memory-Mapped Database) | ACID transactions, zero-copy reads, embedded-friendly |
| **Query Language** | SensibleQL (custom, type-safe) | Domain-specific, compile-time validation |
| **Build System** | Cargo (workspace) | Multi-crate dependency management |
| **CLI** | Rust (sensibledb-cli) | Cross-platform, single binary distribution |
| **Container Runtime** | Rust (sensibledb-container) | Server deployment mode |
| **SDKs** | TypeScript (`sensible-ts`), Python (`sensible-py`) | Primary AI application languages |
| **Documentation** | MkDocs | Static site generation from markdown |
| **E2E Testing** | Playwright + TypeScript | Browser-level integration testing |

---

## 3. Workspace Architecture

The project is organized as a Cargo workspace with the following crates:

| Crate | Path | Responsibility |
|-------|------|----------------|
| `sensibledb-db` | `sensibledb-db/` | Core database engine — storage, graph, vector, transactions |
| `sensibledb-container` | `sensibledb-container/` | Server/container runtime for hosted deployments |
| `sensibledb-macros` | `sensibledb-macros/` | Procedural macros for SensibleQL compilation |
| `sensibledb-cli` | `sensibledb-cli/` | CLI tool for project management and query deployment |
| `sensibledb-explorer` | `sensibledb-explorer/` | Web-based data explorer UI |
| `metrics` | `metrics/` | Observability and metrics collection |
| `nql-tests` | `nql-tests/` | SensibleQL query language test suite |

---

## 4. Architectural Principles

### 4.1 Embedded-First Design
- SensibleDB MUST function as a zero-dependency embedded library
- All core features must work without network calls or external services
- Server mode is an extension, not the primary deployment model

### 4.2 Graph + Vector as Primary Data Model
- The native data model is graph (nodes + edges) with vector embeddings
- KV, document, and relational support are secondary abstractions built on top
- Vector search uses cosine similarity as the default metric

### 4.3 Type Safety End-to-End
- SensibleQL queries MUST be 100% type-safe at compile time
- Schema definitions and query validation happen before deployment
- Runtime type errors are unacceptable

### 4.4 Security by Default
- Data is private by default — accessible only through compiled SensibleQL queries
- No raw data exposure through APIs
- AGPL license enforces copyleft for derivative works

### 4.5 Ultra-Low Latency
- LMDB provides zero-copy reads — leverage this in all read paths
- Release profile: `opt-level = 2`, `lto = true`, `codegen-units = 1`
- Avoid unnecessary allocations in hot paths

---

## 5. Data Model Guardrails

### 5.1 Graph Model
- **Nodes**: Typed entities with properties (schema-defined)
- **Edges**: Directed relationships between nodes with optional properties
- **Labels**: Node types defined via `N::TypeName` syntax

### 5.2 Vector Model
- Embeddings are attached to node properties via the `Embed` function
- Vector search is integrated with graph traversal (not a separate system)
- Built-in embedding generation — no external embedding service required

### 5.3 Storage Model
- LMDB is the sole storage engine — no alternative backends
- All data persistence flows through LMDB transactions
- In-memory mode available for testing/embedded use

---

## 6. Query Language (SensibleQL) Guardrails

- Schema definitions use `N::TypeName { ... }` syntax
- Queries use `QUERY name(params) => ... RETURN ...` syntax
- All queries are compiled via `nexus check` before deployment
- Queries are deployed via `nexus push <environment>`
- Query compilation uses procedural macros (`sensibledb-macros`)

---

## 7. Integration Guardrails

### 7.1 MCP Support
- Built-in Model Context Protocol (MCP) tools for agent data discovery
- Agents walk the graph — they do NOT generate raw queries
- MCP tools expose graph structure, not database internals

### 7.2 SDK Contracts
- TypeScript SDK: `sensible-ts` — primary SDK for web/Node.js applications
- Python SDK: `sensible-py` — primary SDK for Python/AI applications
- Both SDKs communicate via compiled query endpoints (not raw SensibleQL)
- Default server port: `6969`

---

## 8. Testing Guardrails

- **Unit tests**: Co-located with source in each crate
- **Query tests**: `nql-tests/` crate for SensibleQL validation
- **E2E tests**: Playwright-based in `e2e/` directory
- **Metrics**: Collected via `metrics/` crate

---

## 9. Change Approval Process

Any architectural change that affects these guardrails MUST:

1. Be documented as an Architecture Decision Record (ADR) in `docs/adr/`
2. Include updated C4 diagrams in `docs/architecture/diagrams/`
3. Pass all existing tests + new tests for the change
4. Receive explicit approval from maintainers

---

## 10. Anti-Patterns (What NOT to Do)

- ❌ Do NOT introduce alternative storage engines without an ADR
- ❌ Do NOT bypass LMDB transactions for direct file I/O
- ❌ Do NOT add runtime type checking where compile-time is possible
- ❌ Do NOT expose raw data through APIs — always go through SensibleQL
- ❌ Do NOT split graph and vector into separate systems
- ❌ Do NOT add external dependencies to the core `sensibledb-db` crate without justification
- ❌ Do NOT change the AGPL license without maintainer consensus

---

## 11. Related Documentation

- **C4 Diagrams**: `docs/architecture/diagrams/`
- **Architecture Decision Records**: `docs/adr/`
- **User Documentation**: `docs/` (MkDocs source)
- **Contributing Guide**: `CONTRIBUTORS.md`
- **Code of Conduct**: `CODE_OF_CONDUCT.md`
