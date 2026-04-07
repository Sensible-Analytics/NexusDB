<p align="center">
  <img src="assets/sensible-db-logo.svg" alt="SensibleDB Logo" width="400">
</p>

<p align="center">
  <strong>Embedded Graph-Vector Database for AI Applications</strong>
</p>

<p align="center">
  <a href="https://sensible-analytics.github.io/SensibleDB/">Documentation</a> ·
  <a href="https://github.com/Sensible-Analytics/SensibleDB/issues">Issues</a> ·
  <a href="mailto:founders@sensibledb-db.com">Contact</a>
</p>

<hr>

SensibleDB, by [Sensible Analytics](https://github.com/Sensible-Analytics), is a unified database that makes it easy to build all the components needed for an AI application in a single platform.

You no longer need a separate application DB, vector DB, graph DB, or application layers to manage multiple storage locations. SensibleDB combines graph, vector, and embedded storage into one lightweight engine — like SQLite for knowledge graphs.

### SensibleDB Explorer — Your Personal Knowledge Assistant

A beautiful, interactive desktop application that lets you explore and extract knowledge from your documents — completely offline.

<p align="center">
  <img src="assets/explorer-home.png" alt="SensibleDB Explorer - Home View" width="90%">
</p>

<p align="center">
  <img src="assets/explorer-graph.png" alt="SensibleDB Explorer - Graph View" width="90%">
</p>

<p align="center">
  <img src="assets/explorer-chat.png" alt="SensibleDB Explorer - Chat Interface" width="90%">
</p>

<p align="center">
  <img src="assets/explorer-report.png" alt="SensibleDB Explorer - Report View" width="90%">
</p>

---

## For Non-Technical Users: Your Data Stays on Your Computer

If you're looking for a personal app to help you organize and search through your documents, reports, and notes — SensibleDB Explorer is designed for you.

### Why SensibleDB Explorer?

- **100% Local-First** — Your documents and data never leave your computer. No cloud, no external servers, no data sent anywhere. Everything stays on your machine, even when your Wi-Fi is off.
- **Works Offline** — Take your documents offline. Disconnect from the internet — SensibleDB Explorer keeps working.
- **Download, Connect, Use** — Simply download the app, point it at your documents folder, and start asking questions in plain English.
- **Extract Knowledge** — Chat with your documents to find information, generate reports, and discover connections between your files.

### Quick Start (Explorer UI)

1. Download SensibleDB Explorer for macOS
2. Launch the app
3. Click "Add Folder" and select your documents folder
4. Start chatting with your documents

---

## Key Features

|                         |                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Built-in MCP tools**  | Connect AI agents directly to your knowledge base. MCP server integration allows agents to read/write data. *(Coming Soon — actively being developed)* |
| **Built-in Embeddings** | No need to embed your data before sending it to SensibleDB, just use the `Embed` function to vectorize text.                                |
| **Tooling for RAG**     | SensibleDB has a built-in vector search, keyword search, and graph traversals that can be used to power any type of RAG applications.     |
| **Secure by Default**   | SensibleDB is private by default. You can only access your data through your compiled SensibleQL queries.                                    |
| **Ultra-Low Latency**   | SensibleDB is built in Rust and uses LMDB as its storage engine to provide extremely low latencies.                                         |
| **Type-Safe Queries**   | SensibleQL is 100% type-safe, which lets you develop and deploy with the confidence that your queries will execute in production          |
| **Embedded Mode**       | Use SensibleDB as a lightweight embedded database in your Rust applications with zero external dependencies.                               |
| **Visual Explorer**     | Interactive graph visualization, natural language chat, and automated report generation via the SensibleDB Explorer UI.                   |

## For Technical Users: AI Agent Memory & Knowledge Base

SensibleDB is designed to serve as a high-performance knowledge base and memory store for AI agents:

### Use Cases

- **AI Agent Memory** — Store agent context, conversation history, and learned information in a local graph database that agents can query and update.
- **Knowledge Graph for RAG** — Build rich knowledge graphs from your documents with both semantic (vector) and relationship (graph) understanding.
- **Multi-Agent Shared Memory** — Multiple AI agents can share a single source of truth, reading and writing to the same knowledge base.

### Integration Options

1. **CLI + SDK** — Run `nexus push dev`, then use the TypeScript or Python SDK to query from your agent:
   ```typescript
   import SensibleDB from "sensible-ts";
   const client = new SensibleDB();
   // Query your knowledge base
   const context = await client.query("getContext", { topic: "user preferences" });
   ```

2. **MCP Server** *(Coming Soon)* — Connect your AI agent directly via MCP:
   ```json
   {
     "server": "sensibledb",
     "command": "nexus",
     "args": ["mcp", "serve"]
   }
   ```

### Embedded Mode (For Deep Integration)

For full control, embed SensibleDB directly in your Rust application:

```toml
[dependencies]
sensibledb-db = { version = "1.3", features = ["embedded"] }
```

## Embedded Mode

SensibleDB can be used as an embedded database in Rust applications. Enable with the `embedded` feature:

```toml
[dependencies]
sensibledb-db = { version = "1.3", features = ["embedded"] }
```

### Quick Start (Embedded)

```rust
use sensibledb_db::embedded::{Database, Node};

let db = Database::open("./my_db")?;
let mut tx = db.write_transaction()?;

tx.put_node(Node {
    id: 1,
    label: "User".into(),
})?;

tx.commit()?;
```

### Embedded Features

- **Storage**: In-memory storage with optional persistence
- **Graph**: Node/edge CRUD with transactions
- **Vector**: Cosine similarity search
- **Traversal**: BFS/DFS graph traversal
- **Indices**: Secondary indices for fast lookups

## Getting Started

#### SensibleDB CLI (called "nexus")

Start by installing the SensibleDB CLI tool (called "nexus") to deploy SensibleDB locally.

1. Install CLI (build from source)

   ```bash
   git clone https://github.com/Sensible-Analytics/SensibleDB.git
   cd SensibleDB
   cargo install --path sensibledb-cli
   ```

2. Initialize a project

   ```bash
   mkdir <path-to-project> && cd <path-to-project>
   nexus init
   ```

3. Write queries

   Open your newly created `.hx` files and start writing your schema and queries.
   Head over to [our docs](https://docs.sensibledb-db.com/) for more information about writing queries.

   ```sensibleql
   N::User {
      INDEX name: String,
      age: U32
   }

   QUERY getUser(user_name: String) =>
      user <- N<User>({name: user_name})
      RETURN user
   ```

4. (Optional) Check your queries compile

   ```bash
   nexus check
   ```

5. Deploy your queries to their API endpoints

   ```bash
   nexus push dev
   ```

6. Start calling them using HTTP directly (SDKs coming soon). For example:

   ```typescript
   import SensibleDB from "sensible-ts";

   // Create a new SensibleDB client
   // The default port is 6969
   const client = new SensibleDB();

   // Query the database
   await client.query("addUser", {
     name: "John",
     age: 20,
   });

   // Get the created user
   const user = await client.query("getUser", {
     user_name: "John",
   });

   console.log(user);
   ```

## Project Structure

```
SensibleDB/
├── sensibledb-db/          # Core database engine (Rust)
├── sensibledb-cli/         # Command-line interface
├── sensibledb-explorer/    # Visual graph explorer UI (Tauri + SolidJS)
├── sensibledb-container/   # Docker container deployment
├── sensibledb-macros/      # Procedural macros for SensibleQL
├── metrics/                # Telemetry and metrics
├── sensibleql-tests/              # Query language test suite
├── e2e/                    # Playwright E2E tests (65 tests)
└── docs/                   # Documentation source
```

## Documentation

Full documentation is available at [https://sensible-analytics.github.io/SensibleDB/](https://sensible-analytics.github.io/SensibleDB/)

- [Getting Started](https://sensible-analytics.github.io/SensibleDB/getting-started/intro/)
- [SensibleQL Query Language](https://sensible-analytics.github.io/SensibleDB/sensibleql/overview/)
- [SDKs](https://sensible-analytics.github.io/SensibleDB/sdks/overview/)
- [Architecture](https://sensible-analytics.github.io/SensibleDB/architecture/diagrams/system-context/)

## License

SensibleDB is licensed under the AGPL (Affero General Public License).

## Commercial Support

SensibleDB is available as a managed service for selected users. If you're interested in using SensibleDB's managed service or want enterprise support, [contact](mailto:founders@sensibledb-db.com) us for more information and deployment options.

---

<p align="center">
  <a href="https://github.com/Sensible-Analytics">
    <img src="assets/sensible-db-icon.svg" alt="Sensible Analytics" width="48">
  </a>
  <br>
  <strong>Sensible Analytics</strong> — Making AI applications simpler with unified data storage.
</p>

## Contributors

<a href="https://github.com/rprabhat">
  <img src="https://avatars.githubusercontent.com/rprabhat?s=64" width="64" height="64" alt="rprabhat" />
</a>
