# NexusDB Documentation

## Table of Contents

- [Getting Started](#getting-started)
  - [Overview](#overview)
  - [Installation](#installation)
- [NexusQL Query Language](#nexusql-query-language)
  - [Overview](#nexusql-overview)
  - [Schema Definition](#schema-definition)
  - [CRUD Operations](#crud-operations)
  - [Graph Traversals](#graph-traversals)
  - [Vector Operations](#vector-operations)
- [CLI Reference](#cli-reference)
- [SDKs](#sdks)
- [Features](#features)

---

## Getting Started

### Overview

NexusDB is a high-performance **graph-vector database** built from scratch in Rust, with its own query language designed for traversing and manipulating graph and vector data efficiently.

NexusDB makes it easy to build all components needed for an AI application in a single platform. You no longer need a separate application DB, vector DB, graph DB, or application layers. Just use NexusDB.

#### Key Features

- **Built-in MCP Tools** — AI agents can discover data and walk the graph autonomously
- **Built-in Embeddings** — Use `Embed()` to vectorize text directly in queries
- **RAG Tooling** — Vector search, keyword search (BM25), and graph traversals
- **Secure by Default** — Private by default, accessible only through compiled queries
- **Ultra-Low Latency** — Rust + LMDB for near-zero overhead access
- **Type-Safe Queries** — 100% type-safe with compile-time validation

#### Multi-Model Support

| Model | Description | Use Case |
|-------|-------------|----------|
| **Graph** | Native node/edge with traversals | Knowledge graphs, social networks |
| **Vector** | Cosine similarity with embeddings | Semantic search, RAG |
| **KV** | Simple key-value lookups | Caching, configuration |
| **Document** | Flexible schema documents | Content management |
| **Relational** | Table-based queries with joins | Traditional data relationships |

### Installation

#### Prerequisites

- **Rust** 1.75.0 or higher
- **Docker Desktop** (for local development)
- **LMDB** system library

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install LMDB
brew install lmdb          # macOS
apt install liblmdb-dev    # Ubuntu/Debian
pacman -S lmdb             # Arch Linux
```

#### Step 1: Install NexusCLI

```bash
curl -sSL "https://install.nexus-db.com" | bash
nexus --version
```

#### Step 2: Initialize a Project

```bash
mkdir my-project && cd my-project
nexus init
```

Creates:
```
my-project/
├── nexus.toml      # Project configuration
├── db/
│   ├── schema.hx   # Schema definitions
│   └── queries.hx  # Query definitions
└── .nexus/         # Build artifacts
```

#### Step 3: Write Schema and Queries

**schema.hx:**
```nql
N::User {
    INDEX name: String,
    email: String,
    created_at: Date DEFAULT NOW
}

E::Follows {
    From: User,
    To: User,
    Properties: {
        since: Date
    }
}
```

**queries.hx:**
```nql
QUERY createUser(name: String, email: String) =>
    user <- AddN<User>({name: name, email: email})
    RETURN user

QUERY getUser(name: String) =>
    user <- N<User>({name: name})
    RETURN user

QUERY getUserFollowers(user_id: ID) =>
    followers <- N<User>(user_id)::In<Follows>
    RETURN followers
```

#### Step 4: Check and Deploy

```bash
nexus check      # Validate compilation
nexus push dev   # Deploy locally
```

#### Step 5: Test

```bash
curl -X POST http://localhost:6969/createUser \
  -H 'Content-Type: application/json' \
  -d '{"name": "John", "email": "john@example.com"}'

curl -X POST http://localhost:6969/getUser \
  -H 'Content-Type: application/json' \
  -d '{"name": "John"}'
```

---

## NexusQL Query Language

### Overview

NexusQL is a **strongly typed, compiled query language** for NexusDB that combines the best features of Gremlin, Cypher, and Rust.

#### Why NexusQL?

| Feature | NexusQL | Gremlin | Cypher |
|---------|---------|---------|--------|
| Type Safety | Compile-time | Runtime | Runtime |
| Syntax | Clean, concise | Verbose | Readable |
| Performance | Compiled | Interpreted | Interpreted |
| IDE Support | Autocomplete | Limited | Limited |
| Vector Support | Built-in | External | External |

#### Query Structure

```nql
QUERY QueryName(param1: Type, param2: Type) =>
    result <- traversal_expression
    RETURN result
```

| Component | Description |
|-----------|-------------|
| `QUERY` | Start query definition |
| `QueryName` | Query identifier (becomes API endpoint) |
| `param: Type` | Typed input parameters |
| `=>` | Separates header from body |
| `<-` | Assignment operator |
| `RETURN` | Output values |

### Schema Definition

#### Node Schema

```nql
N::User {
    INDEX name: String,
    email: String,
    age: U32,
    created_at: Date DEFAULT NOW
}
```

#### Edge Schema

```nql
E::Follows {
    From: User,
    To: User,
    Properties: {
        since: Date
    }
}
```

#### Supported Types

| Type | Description | Example |
|------|-------------|---------|
| `String` | UTF-8 text | `"hello"` |
| `I32`, `I64` | Signed integers | `42` |
| `U8`, `U32`, `U64` | Unsigned integers | `42` |
| `F32`, `F64` | Floating point | `3.14` |
| `Boolean` | True/false | `true` |
| `Date` | Timestamp | `NOW` |
| `ID` | Unique identifier | Auto-generated |
| `Vector` | Float array | `[0.1, 0.2, ...]` |

### CRUD Operations

#### Create

```nql
QUERY createUser(name: String, email: String) =>
    user <- AddN<User>({name: name, email: email})
    RETURN user

QUERY followUser(from_id: ID, to_id: ID, since: Date) =>
    edge <- AddE<Follows>({since: since})::From(from_id)::To(to_id)
    RETURN edge
```

#### Read

```nql
QUERY getUser(name: String) =>
    user <- N<User>({name: name})
    RETURN user

QUERY getAllUsers() =>
    users <- N<User>()
    RETURN users
```

#### Update

```nql
QUERY updateUserEmail(user_id: ID, email: String) =>
    updated <- N<User>(user_id)::Update({email: email})
    RETURN updated
```

#### Delete

```nql
QUERY deleteUser(user_id: ID) =>
    N<User>(user_id)::Drop
    RETURN "Deleted"
```

### Graph Traversals

#### `::Out` — Outgoing Nodes

```nql
QUERY GetUserFollowing(user_id: ID) =>
    following <- N<User>(user_id)::Out<Follows>
    RETURN following
```

#### `::In` — Incoming Nodes

```nql
QUERY GetUserFollowers(user_id: ID) =>
    followers <- N<User>(user_id)::In<Follows>
    RETURN followers
```

#### `::OutE` — Outgoing Edges

```nql
QUERY GetFollowingEdges(user_id: ID) =>
    edges <- N<User>(user_id)::OutE<Follows>
    RETURN edges
```

#### `::InE` — Incoming Edges

```nql
QUERY GetFollowerEdges(user_id: ID) =>
    edges <- N<User>(user_id)::InE<Follows>
    RETURN edges
```

#### Chaining Traversals

```nql
QUERY GetFriendsOfFriends(user_id: ID) =>
    fof <- N<User>(user_id)::Out<Follows>::Out<Follows>
    RETURN fof
```

#### Shortest Path

```nql
QUERY FindPath(from_id: ID, to_id: ID) =>
    path <- N<User>(from_id)::ShortestPath<N<User>(to_id)>
    RETURN path
```

### Vector Operations

#### Vector Similarity Search

```nql
QUERY searchSimilar(query_vec: [F32], limit: U32) =>
    results <- SearchV<Article>({vector: query_vec, limit: limit})
    RETURN results
```

#### Automatic Embeddings

```nql
QUERY searchArticles(query: String) =>
    results <- SearchV<Article>({vector: Embed(query), limit: 10})
    RETURN results
```

#### Keyword Search (BM25)

```nql
QUERY keywordSearch(query: String) =>
    results <- SearchBM25<Article>({fields: ["title", "content"], query: query})
    RETURN results
```

#### Hybrid Search with RRF

```nql
QUERY hybridSearch(query: String) =>
    vector_results <- SearchV<Article>({vector: Embed(query), limit: 20})
    keyword_results <- SearchBM25<Article>({fields: ["title"], query: query})
    combined <- vector_results::RRF(keyword_results)
    RETURN combined
```

#### MMR Reranking

```nql
QUERY diverseResults(query: String) =>
    results <- SearchV<Article>({vector: Embed(query), limit: 50})
    diverse <- results::MMR({diversity: 0.5, limit: 10})
    RETURN diverse
```

---

## CLI Reference

### Commands

| Command | Description |
|---------|-------------|
| `nexus init` | Initialize a new project |
| `nexus check` | Validate schema and queries |
| `nexus push dev` | Deploy to local instance |
| `nexus status` | Show instance status |
| `nexus start <name>` | Start an instance |
| `nexus stop <name>` | Stop an instance |
| `nexus logs` | Stream instance logs |
| `nexus prune` | Clean up unused resources |
| `nexus update` | Update CLI to latest version |

### Configuration (nexus.toml)

```toml
[project]
name = "my-project"
build_mode = "debug"

[vector]
dimensions = 384
metric = "cosine"

[instance]
name = "dev-instance"
port = 6969
```

---

## SDKs

### TypeScript

```bash
npm install nexus-ts
```

```typescript
import NexusDB from "nexus-ts";
const client = new NexusDB();
const user = await client.query("getUser", { name: "John" });
```

### Python

```bash
pip install nexus-py
```

```python
from nexus import Client
client = Client(local=True, port=6969)
user = client.query("getUser", {"name": "John"})
```

### Rust (Embedded)

```toml
[dependencies]
nexus-db = { version = "1.3", features = ["embedded"] }
```

```rust
use nexus_db::embedded::{Database, Node};
let db = Database::open("./my_db")?;
```

---

## Features

### Built-in MCP Tools
AI agents can discover data and walk the graph autonomously, constructing queries based on graph topology.

### Built-in Embeddings
Use `Embed()` directly in queries — no external embedding service needed.

### RAG Tooling
Vector search, BM25 keyword search, graph traversals, hybrid search with RRF, and MMR reranking.

### Security
Private by default. Data accessible only through compiled NexusQL queries. Type-safe queries prevent injection attacks.

### Ultra-Low Latency
Rust + LMDB memory-mapped B-trees for near-zero overhead access.

### Type-Safe Queries
Compile-time validation catches errors before production. IDE support with autocomplete.

### Multi-Model
Graph, vector, KV, document, and relational — all in one database.
