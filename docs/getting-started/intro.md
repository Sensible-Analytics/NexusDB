# SensibleDB Overview

SensibleDB is a high-performance **graph-vector database** built from scratch in Rust.

## What is SensibleDB?

SensibleDB makes it easy to build all components needed for an AI application in a single platform — all while keeping your data 100% local.

## Choose Your Path

### Non-Technical Users: SensibleDB Explorer

Download the desktop app to turn your documents into a searchable knowledge base:

1. Download for macOS
2. Launch and add your documents folder
3. Chat with your documents in plain English

### Developers: CLI + SDK

Use the CLI ("nexus") to build AI applications with a knowledge graph backend.

### Technical Users: Embedded Mode

Embed SensibleDB directly in Rust applications for full control.

## Key Features

- **100% Local-First** — Your data never leaves your machine
- **Built-in Embeddings** — Use `Embed()` to vectorize text in queries
- **RAG Tooling** — Vector search, BM25, graph traversals
- **Secure by Default** — Private by default, no external access
- **Ultra-Low Latency** — Rust + LMDB for extreme performance
- **Type-Safe Queries** — Compile-time validation
- **MCP Ready** *(Coming Soon)* — Connect AI agents via MCP

## Multi-Model Support

| Model | Description |
|-------|-------------|
| Graph | Native node/edge with traversals |
| Vector | Cosine similarity with embeddings |
| KV | Simple key-value lookups |
| Document | Flexible schema documents |
| Relational | Table-based queries with joins |

